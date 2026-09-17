import fs from 'node:fs';
import path from 'node:path';

export function resolvePackSkills({ catalogPath, packsRoot, sourceRoot, packId }) {
  const catalogRoot = path.dirname(catalogPath);
  const catalog = readJsonWithin(catalogRoot, path.relative(path.resolve(catalogRoot), path.resolve(catalogPath)));
  const packs = resolvePacks(packsRoot, packId);
  const selected = new Map();

  for (const pack of packs) {
    const excluded = pack.excludes ?? [];
    for (const skill of catalog.skills ?? []) {
      const included = (pack.includes?.skills ?? []).some((prefix) => skill.id.startsWith(prefix));
      if (included && !excluded.some((prefix) => skill.id.startsWith(prefix))) {
        selected.set(skill.id, enrichSkill(skill, sourceRoot));
      }
    }
  }

  return [...selected.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function resolvePacks(packsRoot, packId, resolving = new Set()) {
  if (!/^ngautopilot-[a-z0-9-]+$/.test(packId)) {
    throw new Error(`invalid pack ID: ${packId}`);
  }
  if (resolving.has(packId)) {
    throw new Error(`pack dependency cycle: ${[...resolving, packId].join(' -> ')}`);
  }

  const filePath = `${packId}.json`;
  if (!resolveRegularFileWithin(packsRoot, filePath)) {
    throw new Error(`pack not found: ${packId}`);
  }

  const pack = readJsonWithin(packsRoot, filePath);
  const dependencies = (pack.dependsOn ?? []).flatMap((dependency) => resolvePacks(packsRoot, dependency, new Set([...resolving, packId])));
  return [...new Map([...dependencies, pack].map((candidate) => [candidate.id, candidate])).values()];
}

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error('missing skill frontmatter');
  }

  const metadata = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/);
    if (!field) continue;

    const [, key, rawValue = ''] = field;
    if (rawValue === '>' || rawValue === '|') {
      const values = [];
      while (index + 1 < lines.length && !/^[A-Za-z][A-Za-z0-9_-]*:/.test(lines[index + 1])) {
        index += 1;
        const value = lines[index].trim();
        if (value) values.push(value);
      }
      metadata[key] = values.join(' ');
      continue;
    }
    metadata[key] = rawValue.replace(/^['"]|['"]$/g, '').trim();
  }

  return metadata;
}

function enrichSkill(skill, sourceRoot) {
  const source = resolveRegularFileWithin(sourceRoot, skill.path);
  if (!source) {
    throw new Error(`skill source missing: ${skill.path}`);
  }
  const metadata = parseFrontmatter(fs.readFileSync(source, 'utf8'));
  if (!metadata.description) {
    throw new Error(`skill description missing: ${skill.path}`);
  }
  return { ...skill, description: metadata.description, metadata };
}

function readJsonWithin(root, filePath) {
  const source = resolveRegularFileWithin(root, filePath);
  if (!source) throw new Error(`source file missing: ${filePath}`);
  return JSON.parse(fs.readFileSync(source, 'utf8'));
}

function resolveRegularFileWithin(root, candidate) {
  if (!fs.existsSync(root)) throw new Error(`source root missing: ${root}`);
  const normalizedRoot = fs.realpathSync(root);
  const absoluteCandidate = path.resolve(normalizedRoot, candidate);
  const relative = path.relative(normalizedRoot, absoluteCandidate);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`source path escapes root: ${candidate}`);
  }
  if (!fs.existsSync(absoluteCandidate)) return undefined;
  assertNoSymlinkParentsWithin(normalizedRoot, absoluteCandidate);
  const stat = fs.lstatSync(absoluteCandidate);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`source is not a regular file: ${candidate}`);
  }
  return absoluteCandidate;
}

function assertNoSymlinkParentsWithin(root, candidate) {
  let current = path.dirname(candidate);
  while (current !== root) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`source path has a symlinked parent: ${candidate}`);
    }
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`source path escapes root: ${candidate}`);
    current = parent;
  }
}
