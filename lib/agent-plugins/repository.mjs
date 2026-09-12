import fs from 'node:fs';
import path from 'node:path';

import { resolvePacks } from './pack-resolver.mjs';

const angularVersioningPrefix = 'angular.versioning.';
const supportedProfiles = new Map([
  ['core', ['ngautopilot-core']],
  ['essentials', ['ngautopilot-angular-foundations']],
  ['architecture', ['ngautopilot-angular-foundations']],
  ['performance', ['ngautopilot-angular-runtime']],
  ['testing', ['ngautopilot-angular-testing']],
  ['migration', ['ngautopilot-core']],
]);
const supportedCapabilities = new Map([
  ['foundations', 'ngautopilot-angular-foundations'],
  ['runtime', 'ngautopilot-angular-runtime'],
  ['state', 'ngautopilot-angular-state'],
  ['testing', 'ngautopilot-angular-testing'],
  ['ui', 'ngautopilot-angular-ui'],
]);

export function createRepositoryTools({ root }) {
  return Object.freeze({
    catalogSearch: ({ query, limit = 10 }) => searchCatalog(readCatalog(root), query, limit),
    packList: () => listPacks(root),
    packResolve: ({ packId }) => resolvePack(root, packId),
    projectInspect: () => inspectProject(root),
    stackDetect: () => detectStack(root),
    skillRoute: ({ request }) => searchCatalog(readCatalog(root), request, 10),
    compatibilityCheck: ({ target }) => compatibilityCheck(root, target),
    upgradePlan: ({ from, to }) => upgradePlan(root, from, to),
    repositoryValidate: () => validateRepositoryReadOnly(root),
  });
}

export function searchCatalog(catalog, query, limit = 10) {
  const terms = String(query).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const matches = (catalog.skills ?? [])
    .map((skill) => ({ skill, score: terms.reduce((score, term) => score + searchable(skill).split(term).length - 1, 0) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.skill.id.localeCompare(right.skill.id))
    .slice(0, Math.min(Math.max(Number(limit) || 10, 1), 50))
    .map(({ skill }) => skill);
  return { query, matches };
}

/**
 * Resolve the non-mutating guidance installation for an Angular project.
 *
 * The resolver deliberately selects no migration-hop pack. A caller that wants
 * an upgrade must use the explicit upgrade planner and later migration flow.
 */
export function resolveAngularInstallation({ root, projectRoot, target, profile = 'core', capabilities = [] }) {
  if (!root || !projectRoot) throw new Error('root and projectRoot are required');
  const repositoryRoot = path.resolve(root);
  const project = locateProjectPackage(projectRoot);
  const evidence = readAngularEvidence(project);
  const coreDeclaration = evidence.angular.declarations.find(({ name }) => name === '@angular/core');
  const coreDeclarationVersion = parseDeclaredVersion(coreDeclaration.version);
  const requestedTarget = parseAngularTarget(target ?? (
    !evidence.lockfile && coreDeclarationVersion.operator !== ''
      ? deriveOmittedAngularTarget(evidence.angular)
      : { major: evidence.angular.major, minor: evidence.angular.minor }
  ));

  const packageOnlyRange = !evidence.lockfile && coreDeclarationVersion.operator !== '';
  if (requestedTarget.major !== evidence.angular.major
    || (requestedTarget.minor !== undefined && !packageOnlyRange && requestedTarget.minor !== evidence.angular.minor)) {
    throw new Error(`Angular target ${formatTarget(requestedTarget)} contradicts detected ${evidence.angular.version}`);
  }
  if (!evidence.lockfile && requestedTarget.minor !== undefined) {
    const targetVersion = { major: requestedTarget.major, minor: requestedTarget.minor, patch: 0, prerelease: [] };
    for (const declaration of evidence.angular.declarations) {
      const declaredVersion = parseDeclaredVersion(declaration.version);
      if (!isTargetCompatibleWithDeclaration(declaredVersion, targetVersion)) {
        throw new Error(`Angular target ${formatTarget(requestedTarget)} is outside declared ${declaration.name} ${declaration.version}`);
      }
    }
  }

  const profilePacks = supportedProfiles.get(profile);
  if (!profilePacks) throw new Error(`unsupported Angular installation profile: ${profile}`);
  if (!Array.isArray(capabilities) || capabilities.some((capability) => typeof capability !== 'string')) {
    throw new Error('capabilities must be an array of supported capability names');
  }

  const capabilityPacks = capabilities.map((capability) => {
    const packId = supportedCapabilities.get(capability);
    if (!packId) throw new Error(`unsupported Angular installation capability: ${capability}`);
    return packId;
  });
  const requestedPacks = [...new Set([...profilePacks, ...capabilityPacks])].sort();
  const packs = [...new Map(requestedPacks.flatMap((packId) => resolvePacks(path.join(repositoryRoot, 'packs'), packId))
    .map((pack) => [pack.id, pack])).values()].sort((left, right) => left.id.localeCompare(right.id));
  const catalog = readCatalog(repositoryRoot);
  const selectedSkills = selectPackSkills(catalog.skills ?? [], packs);
  for (const skill of (catalog.skills ?? []).filter(({ id }) => id.startsWith(angularVersioningPrefix))) {
    if (!selectedSkills.has(skill.id)) selectedSkills.set(skill.id, { skill, packIds: [] });
  }
  const evaluatedSkills = [...selectedSkills.values()]
    .sort((left, right) => left.skill.id.localeCompare(right.skill.id))
    .map(({ skill, packIds }) => ({ skill, packIds, compatibility: readAngularCompatibility(repositoryRoot, skill.path) }));
  const compatibleSkills = evaluatedSkills.filter(({ compatibility }) => isAngularCompatible(compatibility, evidence.angular.major));
  const incompatibleSkills = evaluatedSkills.filter(({ compatibility }) => !isAngularCompatible(compatibility, evidence.angular.major));

  return {
    projectRoot: project.root,
    target: requestedTarget,
    profile,
    capabilities: [...new Set(capabilities)].sort(),
    evidence,
    validation: {
      level: evidence.lockfile ? 'lockfile-confirmed' : 'package-json-only',
      reasons: evidence.lockfile
        ? ['package.json and lockfile agree on @angular/core']
        : ['no supported lockfile was present; @angular/core is declared but not lockfile-confirmed'],
    },
    included: [
      ...packs.map((pack) => ({ type: 'pack', id: pack.id, reason: requestedPacks.includes(pack.id) ? 'requested profile or capability' : 'transitive pack dependency' })),
      ...compatibleSkills.map(({ skill, packIds, compatibility }) => ({ type: 'skill', id: skill.id, reason: skillReason(compatibilityReason(compatibility, evidence.angular.major), packIds) })),
    ],
    excluded: [
      ...incompatibleSkills.map(({ skill, packIds, compatibility }) => ({ type: 'skill', id: skill.id, reason: skillReason(incompatibilityReason(compatibility, evidence.angular.major), packIds) })),
      { selector: 'angular.upgrade.hops.*', reason: 'migration hops require an explicit migration plan and are never activated by installation resolution' },
      { selector: 'angular.upgrades.21-to-22.*', reason: 'migration hops require an explicit migration plan and are never activated by installation resolution' },
      { selector: 'angular.modernization.*', reason: 'modernization is not implied by the detected Angular version' },
    ],
  };
}

function listPacks(root) {
  return fs.readdirSync(path.join(root, 'packs'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => readJson(path.join(root, 'packs', name)));
}

function resolvePack(root, packId) {
  const packs = resolvePacks(path.join(root, 'packs'), packId);
  return { packId, packs: packs.map(({ id }) => id), definitions: packs };
}

function inspectProject(root) {
  const packageJson = readJson(path.join(root, 'package.json'));
  return {
    name: packageJson.name,
    version: packageJson.version,
    packageManager: fs.existsSync(path.join(root, 'package-lock.json')) ? 'npm' : undefined,
    skillCount: readCatalog(root).skills.length,
    packCount: listPacks(root).length,
  };
}

function detectStack(root) {
  const packageJson = readJson(path.join(root, 'package.json'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  return {
    node: { minimum: packageJson.engines?.node },
    angular: dependencies['@angular/core'],
    typescript: dependencies.typescript,
    rxjs: dependencies.rxjs,
    packageManager: fs.existsSync(path.join(root, 'package-lock.json')) ? 'npm' : undefined,
  };
}

function compatibilityCheck(root, target) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(target))) {
    throw new Error(`invalid compatibility target: ${target}`);
  }
  const packId = `ngautopilot-${String(target)}`;
  return {
    target,
    packId,
    supported: fs.existsSync(path.join(root, 'packs', `${packId}.json`)),
  };
}

function upgradePlan(root, from, to) {
  const source = Number(from);
  const target = Number(to);
  if (!Number.isInteger(source) || !Number.isInteger(target) || source >= target) {
    throw new Error('upgrade requires ascending Angular major versions');
  }
  if (source === 3 || target === 3) {
    throw new Error('Angular 3 is not a supported upgrade endpoint; use Angular 2 to 4');
  }
  const hops = [];
  for (let major = source; major < target; major += 1) {
    if (major === 2) {
      hops.push('2-to-4');
      major = 3;
    } else {
      hops.push(`${major}-to-${major + 1}`);
    }
  }
  const missing = hops.filter((hop) => !fs.existsSync(path.join(root, 'packs', `ngautopilot-angular-${hop}.json`)));
  return { from: source, to: target, hops, supported: missing.length === 0, missing };
}

function validateRepositoryReadOnly(root) {
  const catalog = readCatalog(root);
  const skillsDirectory = path.join(root, 'skills');
  const sourceSkills = fs.existsSync(skillsDirectory) ? listSkillPaths(root) : undefined;
  const errors = [];
  if (sourceSkills) {
    const catalogPaths = new Set(catalog.skills.map(({ path: skillPath }) => skillPath));
    if (catalogPaths.size !== sourceSkills.size || [...catalogPaths].some((skillPath) => !sourceSkills.has(skillPath)) || [...sourceSkills].some((skillPath) => !catalogPaths.has(skillPath))) {
      errors.push('catalog skill paths do not match source skills');
    }
  }
  for (const pack of listPacks(root)) {
    try {
      resolvePacks(path.join(root, 'packs'), pack.id);
    } catch (error) {
      errors.push(error.message);
    }
  }
  return { valid: errors.length === 0, errors, mutatesRepository: false };
}

function readCatalog(root) {
  return readJson(path.join(root, 'catalog.json'));
}

function locateProjectPackage(projectRoot) {
  let current = path.resolve(projectRoot);
  while (true) {
    const packageJsonPath = path.join(current, 'package.json');
    if (fs.existsSync(packageJsonPath)) return { root: current, packageJsonPath };
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`package.json not found from project root: ${projectRoot}`);
    current = parent;
  }
}

function selectPackSkills(catalogSkills, packs) {
  const selected = new Map();
  for (const pack of packs) {
    const includedPrefixes = pack.includes?.skills ?? [];
    const excludedPrefixes = pack.excludes ?? [];
    for (const skill of catalogSkills) {
      const included = includedPrefixes.some((prefix) => skill.id.startsWith(prefix));
      const excluded = excludedPrefixes.some((prefix) => skill.id.startsWith(prefix));
      if (!included || excluded) continue;
      const selection = selected.get(skill.id) ?? { skill, packIds: [] };
      if (!selection.packIds.includes(pack.id)) selection.packIds.push(pack.id);
      selected.set(skill.id, selection);
    }
  }
  return selected;
}

function readAngularEvidence(project) {
  const packageJson = readJson(project.packageJsonPath);
  const declared = { ...packageJson.peerDependencies, ...packageJson.dependencies, ...packageJson.devDependencies };
  const angularDeclarations = Object.entries(declared)
    .filter(([name]) => name === '@angular/core' || /^@angular\/(?:common|compiler|compiler-cli|forms|platform-[a-z-]+|router|animations)$/.test(name))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => ({ name, version: parseDeclaredVersion(value) }));
  const core = angularDeclarations.find(({ name }) => name === '@angular/core');
  if (!core) throw new Error('@angular/core is not declared in package.json');
  if (angularDeclarations.some(({ version }) => version.major !== core.version.major)) {
    throw new Error('contradictory Angular major versions are declared in package.json');
  }

  const lockfile = findSupportedLockfile(project);
  const lockedVersion = lockfile ? readLockedAngularCore(lockfile, project.root) : undefined;
  if (lockfile && !lockedVersion) throw new Error(`@angular/core is not recorded in ${path.basename(lockfile.path)}`);
  if (lockedVersion && !isDeclaredVersionSatisfied(core.version, lockedVersion)) {
    throw new Error(`package.json @angular/core ${core.version.raw} contradicts lockfile ${lockedVersion.raw}`);
  }

  const resolved = lockedVersion ?? core.version;
  return {
    packageJson: project.packageJsonPath,
    lockfile: lockfile ? { path: lockfile.path, kind: lockfile.kind, version: lockedVersion.raw } : undefined,
    angular: {
      version: resolved.raw,
      major: resolved.major,
      minor: resolved.minor,
      source: lockedVersion ? 'package.json + lockfile' : 'package.json',
      declarations: angularDeclarations.map(({ name, version }) => ({ name, version: version.raw })),
    },
  };
}

function findSupportedLockfile(project) {
  let current = path.resolve(project.root);
  while (true) {
    const npmLock = path.join(current, 'package-lock.json');
    if (fs.existsSync(npmLock)) {
      if (current === project.root || workspaceOwnsProject(current, project.root)) {
        return { path: npmLock, kind: 'npm' };
      }
    }
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

function workspaceOwnsProject(workspaceRoot, projectRoot) {
  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return false;
  const packageJson = readJson(packageJsonPath);
  const workspaces = Array.isArray(packageJson.workspaces)
    ? packageJson.workspaces
    : packageJson.workspaces?.packages;
  if (!Array.isArray(workspaces)) return false;
  const relativeProject = path.relative(workspaceRoot, projectRoot).split(path.sep).join('/');
  const positive = workspaces.filter((workspace) => typeof workspace === 'string' && !workspace.startsWith('!'));
  const negative = workspaces.filter((workspace) => typeof workspace === 'string' && workspace.startsWith('!'));
  return positive.some((workspace) => workspacePatternMatches(workspace, relativeProject))
    && !negative.some((workspace) => workspacePatternMatches(workspace.slice(1), relativeProject));
}

function workspacePatternMatches(pattern, relativeProject) {
  if (typeof pattern !== 'string') return false;
  const normalizedPattern = pattern.replace(/^\.\//, '').replace(/\/$/, '');
  let expression = '^';
  for (let index = 0; index < normalizedPattern.length; index += 1) {
    const character = normalizedPattern[index];
    if (character === '*' && normalizedPattern[index + 1] === '*') {
      expression += '.*';
      index += 1;
    } else if (character === '*') {
      expression += '[^/]*';
    } else {
      expression += character.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`${expression}/?$`).test(relativeProject);
}

function readLockedAngularCore(lockfile, projectRoot) {
  const contents = readJson(lockfile.path);
  const relativeProject = path.relative(path.dirname(lockfile.path), projectRoot).split(path.sep).join('/');
  const workspaceEntry = relativeProject && `${relativeProject}/node_modules/@angular/core`;
  const workspaceVersion = workspaceEntry && contents.packages?.[workspaceEntry]?.version;
  if (workspaceVersion) return parseExactVersion(workspaceVersion, `${path.basename(lockfile.path)} @angular/core`);

  const projectLocalPackage = path.join(projectRoot, 'node_modules', '@angular', 'core', 'package.json');
  if (relativeProject && fs.existsSync(projectLocalPackage)) return undefined;

  if (relativeProject && !contents.packages?.[relativeProject]) return undefined;

  const version = contents.packages?.['node_modules/@angular/core']?.version
    ?? contents.dependencies?.['@angular/core']?.version;
  return version ? parseExactVersion(version, `${path.basename(lockfile.path)} @angular/core`) : undefined;
}

function parseDeclaredVersion(value) {
  if (typeof value !== 'string') throw new Error('Angular dependency versions must be strings');
  const match = value.match(/^([~^]|>=?)?(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!match) throw new Error(`unsupported Angular dependency version: ${value}`);
  return {
    raw: value,
    operator: match[1] ?? '',
    major: Number(match[2]),
    minor: Number(match[3]),
    patch: Number(match[4] ?? 0),
    hasPatch: match[4] !== undefined,
    prerelease: match[5] ? match[5].split('.') : [],
  };
}

function deriveOmittedAngularTarget({ major, minor: detectedMinor, declarations }) {
  const parsedDeclarations = declarations.map(({ version }) => parseDeclaredVersion(version));
  const candidateMinors = [...new Set(parsedDeclarations.flatMap((declaration) => [
    declaration.minor,
    ...(declaration.operator === '>' && !declaration.hasPatch ? [declaration.minor + 1] : []),
  ]))].sort((left, right) => left - right);
  const firstSatisfiableMinor = candidateMinors.find((candidateMinor) => parsedDeclarations.every((declaration) => (
    isTargetCompatibleWithDeclaration(declaration, {
      major,
      minor: candidateMinor,
      patch: 0,
      prerelease: [],
    })
  )));

  // Preserve the evidence-derived value when declarations have no common target
  // so the existing declaration-specific validation error remains authoritative.
  return {
    major,
    minor: firstSatisfiableMinor ?? detectedMinor,
  };
}

function parseExactVersion(value, label) {
  if (typeof value !== 'string') throw new Error(`${label} must be a version string`);
  const match = value.match(/^(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!match) throw new Error(`unsupported ${label} version: ${value}`);
  return {
    raw: value,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] ?? 0),
    hasPatch: match[3] !== undefined,
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

function isDeclaredVersionSatisfied(declaration, locked) {
  const comparison = compareVersions(locked, declaration);
  if (declaration.operator === '^') {
    const upper = declaration.major > 0
      ? { major: declaration.major + 1, minor: 0, patch: 0, prerelease: [] }
      : declaration.minor > 0
        ? { major: 0, minor: declaration.minor + 1, patch: 0, prerelease: [] }
        : { major: 0, minor: 0, patch: declaration.patch + 1, prerelease: [] };
    return comparison >= 0 && compareVersions(locked, upper) < 0;
  }
  if (declaration.operator === '~') {
    const upper = { major: declaration.major, minor: declaration.minor + 1, patch: 0, prerelease: [] };
    return comparison >= 0 && compareVersions(locked, upper) < 0;
  }
  if (declaration.operator === '>=') return comparison >= 0;
  if (declaration.operator === '>') {
    if (!declaration.hasPatch) {
      const lowerBound = { ...declaration, minor: declaration.minor + 1, patch: 0, prerelease: [] };
      return compareVersions(locked, lowerBound) >= 0;
    }
    return comparison > 0;
  }
  if (!declaration.hasPatch) return locked.major === declaration.major && locked.minor === declaration.minor;
  return comparison === 0;
}

function isTargetCompatibleWithDeclaration(declaration, target) {
  if (declaration.operator === '' && declaration.major === target.major && declaration.minor === target.minor) return true;
  if (declaration.operator === '>' && !declaration.hasPatch
    && declaration.major === target.major
    && declaration.minor === target.minor) return false;
  const candidate = {
    ...target,
    patch: declaration.major === target.major && declaration.minor === target.minor ? declaration.patch : 0,
    prerelease: declaration.major === target.major && declaration.minor === target.minor ? declaration.prerelease : [],
  };
  if (declaration.operator === '>'
    && declaration.major === target.major
    && declaration.minor === target.minor) candidate.patch += 1;
  return isDeclaredVersionSatisfied(declaration, candidate);
}

function compareVersions(left, right) {
  for (const field of ['major', 'minor', 'patch']) {
    if (left[field] !== right[field]) return left[field] - right[field];
  }
  if (left.prerelease.length === 0 && right.prerelease.length > 0) return 1;
  if (left.prerelease.length > 0 && right.prerelease.length === 0) return -1;
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index += 1) {
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];
    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    if (leftPart === rightPart) continue;
    const leftNumber = /^\d+$/.test(leftPart);
    const rightNumber = /^\d+$/.test(rightPart);
    if (leftNumber && rightNumber) return Number(leftPart) - Number(rightPart);
    if (leftNumber) return -1;
    if (rightNumber) return 1;
    return leftPart < rightPart ? -1 : 1;
  }
  return 0;
}

function parseAngularTarget(value) {
  if (typeof value === 'number' && Number.isInteger(value)) return { major: value };
  if (typeof value === 'string') {
    const match = value.match(/^(\d+)(?:\.(\d+))?$/);
    if (match) return { major: Number(match[1]), ...(match[2] === undefined ? {} : { minor: Number(match[2]) }) };
  }
  if (value && typeof value === 'object' && Number.isInteger(value.major)
    && (value.minor === undefined || Number.isInteger(value.minor))) {
    return value.minor === undefined ? { major: value.major } : { major: value.major, minor: value.minor };
  }
  throw new Error('Angular target must be a major or major.minor version');
}

function formatTarget(target) {
  return target.minor === undefined ? String(target.major) : `${target.major}.${target.minor}`;
}

function readAngularCompatibility(repositoryRoot, skillPath) {
  const content = fs.readFileSync(path.join(repositoryRoot, skillPath), 'utf8');
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`missing skill frontmatter: ${skillPath}`);
  let inCompatibility = false;
  let inAngular = false;
  const result = {};
  for (const line of frontmatter[1].split(/\r?\n/)) {
    if (/^compatibility:\s*$/.test(line)) {
      inCompatibility = true;
      continue;
    }
    if (inCompatibility && /^\S.*:$/.test(line)) break;
    if (inCompatibility && /^\s{2}angular:\s*$/.test(line)) {
      inAngular = true;
      continue;
    }
    if (inAngular && /^\s{2}\S.*:$/.test(line)) break;
    const bound = inAngular && line.match(/^\s{4}(min|max):\s*["']?(\d+)["']?\s*$/);
    if (bound) result[bound[1]] = Number(bound[2]);
  }
  return result;
}

function isAngularCompatible({ min, max }, major) {
  return (min === undefined || major >= min) && (max === undefined || major <= max);
}

function compatibilityReason({ min, max }, major) {
  if (min === undefined && max === undefined) return 'no declared Angular compatibility bound';
  if (min !== undefined && max !== undefined) return `compatible with Angular ${major}; declared range ${min}-${max}`;
  return min !== undefined ? `compatible with Angular ${major}; declared minimum ${min}` : `compatible with Angular ${major}; declared maximum ${max}`;
}

function skillReason(reason, packIds) {
  return packIds.length === 0 ? reason : `${reason}; selected by ${packIds.join(', ')}`;
}

function incompatibilityReason({ min, max }, major) {
  if (min !== undefined && major < min) return `requires Angular >=${min}; detected ${major}`;
  return `requires Angular <=${max}; detected ${major}`;
}

function listSkillPaths(root, directory = path.join(root, 'skills')) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((paths, entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return new Set([...paths, ...listSkillPaths(root, target)]);
    if (entry.name === 'SKILL.md') paths.add(path.relative(root, target).split(path.sep).join('/'));
    return paths;
  }, new Set());
}

function searchable(skill) {
  return [skill.id, skill.name, skill.category, ...(skill.stack ?? []), ...(skill.triggers ?? [])].join(' ').toLowerCase();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
