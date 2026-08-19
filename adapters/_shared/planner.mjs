// Planner: build an InstallPlan from pack + adapter + catalog.
//
// Inputs (paths resolved by caller):
//   catalogPath       -> catalog.json (skills set)
//   packPath          -> packs/<pack>.json
//   adaptersRoot      -> adapters/
//   sourceRoot        -> repo root (where skills/, agents/ live)
//
// Output: InstallPlan with PlannedFile entries. Caller decides project/user scope.

import fs from 'node:fs';
import path from 'node:path';
import { loadAdapterManifest } from './adapter-core.mjs';
import { resolveProjectRoot } from './install-roots.mjs';

export function buildPlan({ catalogPath, packPath, adaptersRoot, sourceRoot, agent, scope, cwd, home }) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const packs = resolvePacks(packPath);
  const pack = packs.at(-1);
  const manifest = loadAdapterManifest(adaptersRoot, agent);

  if (!manifest.scope.includes(scope)) {
    throw new Error(`Adapter ${agent} does not support scope "${scope}"`);
  }

  const outputPaths = manifest.outputPaths?.[scope];
  const scopeRoot = scope === 'project'
    ? resolveProjectRoot(cwd || process.cwd())
    : path.resolve(home || safeHome());
  const installRoot = outputPaths
    ? scopeRoot
    : path.resolve(scopeRoot, manifest.paths[scope]);
  const manifestPath = path.join(installRoot, '.ngautopilot-manifest.json');
  const legacyInstallRoot = outputPaths && manifest.paths?.[scope]
    ? path.resolve(scopeRoot, manifest.paths[scope])
    : undefined;

  const matches = uniqueById(packs.flatMap((candidate) => matchSkills(catalog.skills, candidate)));
  const files = [];
  const warnings = [];

  for (const skill of matches) {
    const sourcePath = path.join(sourceRoot, skill.path);
    if (!fs.existsSync(sourcePath)) {
      warnings.push(`source missing: ${skill.path}`);
      continue;
    }
    const destRel = outputPaths
      ? path.posix.join(outputPaths.skills, path.posix.relative('skills', skill.path))
      : skill.path;
    files.push({
      path: destRel,
      source: sourcePath,
      action: fs.existsSync(path.join(installRoot, destRel)) ? 'update' : 'create',
      checksum: undefined,
    });
  }

  // Adapter templates are named independently from their installed instruction file.
  const templateRel = findInstructionTemplate(adaptersRoot, agent);
  if (fs.existsSync(templateRel)) {
    const instructionPath = outputPaths?.instructions ?? manifest.formats.instructions;
    files.push({
      path: instructionPath,
      source: templateRel,
      action: fs.existsSync(path.join(installRoot, instructionPath)) ? 'managed-section' : 'create',
      managedSection: true,
      checksum: undefined,
    });
  }

  for (const agentId of uniqueValues(packs.flatMap((candidate) => candidate.includes?.agents ?? []))) {
    const source = findAsset(sourceRoot, 'agents', agentId);
    if (!source) {
      warnings.push(`agent source missing: ${agentId}`);
      continue;
    }
    files.push({
      path: outputPaths
        ? path.posix.join(outputPaths.agents, path.posix.relative('agents', toPosixPath(path.relative(sourceRoot, source))))
        : path.relative(sourceRoot, source),
      source,
      action: 'create',
      checksum: undefined,
    });
  }

  for (const promptId of uniqueValues(packs.flatMap((candidate) => candidate.includes?.prompts ?? []))) {
    const source = findAsset(sourceRoot, 'agents', promptId);
    if (!source) {
      warnings.push(`prompt source missing: ${promptId}`);
      continue;
    }
    files.push({
      path: outputPaths
        ? path.posix.join(outputPaths.agents, path.posix.relative('agents', toPosixPath(path.relative(sourceRoot, source))))
        : path.relative(sourceRoot, source),
      source,
      action: 'create',
      checksum: undefined,
    });
  }

  return { agent, scope, pack: pack.id, installRoot, manifestPath, legacyInstallRoot, files, warnings };
}

function resolvePacks(packPath, resolving = new Set()) {
  const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));

  if (resolving.has(pack.id)) {
    throw new Error(`pack dependency cycle: ${[...resolving, pack.id].join(' -> ')}`);
  }

  const nextResolving = new Set([...resolving, pack.id]);
  const packs = [];

  for (const dependency of pack.dependsOn ?? []) {
    const dependencyPath = path.join(path.dirname(packPath), `${dependency}.json`);

    if (!fs.existsSync(dependencyPath)) {
      throw new Error(`pack dependency missing: ${dependency}`);
    }

    packs.push(...resolvePacks(dependencyPath, nextResolving));
  }

  return [...uniqueById(packs), pack];
}

function findInstructionTemplate(adaptersRoot, agent) {
  const directory = path.join(adaptersRoot, agent);
  const template = fs.readdirSync(directory, { withFileTypes: true })
    .find((entry) => entry.isFile() && entry.name.endsWith('.template.md'))?.name
    ?? 'AGENT.template.md';
  const candidate = path.join(directory, template);
  return fs.existsSync(candidate) ? candidate : path.join(adaptersRoot, 'generic', template);
}

function findAsset(sourceRoot, root, id) {
  const directory = path.join(sourceRoot, root);
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        const found = visit(target);
        if (found) return found;
      } else if (entry.isFile() && entry.name.endsWith(`-${id}.md`)) return target;
    }
    return undefined;
  };
  return fs.existsSync(directory) ? visit(directory) : undefined;
}

function matchSkills(skills, pack) {
  const included = [];
  const include = pack.includes?.skills || [];
  const exclude = new Set(pack.excludes || []);
  for (const skill of skills) {
    if (include.some((p) => skill.id.startsWith(p))) {
      if (![...exclude].some((p) => skill.id.startsWith(p))) {
        included.push(skill);
      }
    }
  }
  return included;
}

function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function safeHome() {
  return process.env.USERPROFILE || process.env.HOME || '/';
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}
