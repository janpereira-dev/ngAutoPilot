import fs from 'node:fs';
import path from 'node:path';

import { resolvePacks } from './pack-resolver.mjs';

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
