import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const packs = findJson('packs').map(readJson);
const adapters = findJson('adapters').filter((file) => path.basename(file) === 'manifest.json').map(readJson);
const catalog = readJson('catalog.json');
const skillIds = new Set(catalog.skills.map((skill) => skill.id));

if (packs.length < 10) errors.push(`expected at least 10 packs, found ${packs.length}`);
if (adapters.length !== 10) errors.push(`expected 10 adapters, found ${adapters.length}`);

for (const pack of packs) {
  if (!/^ngautopilot-[a-z0-9-]+$/.test(pack.id ?? '')) errors.push(`invalid pack id: ${pack.id}`);
  if (pack.status !== 'stable') errors.push(`pack is not stable: ${pack.id}`);
  if (pack.version !== catalog.version) errors.push(`pack version mismatch: ${pack.id}`);
  for (const prefix of pack.includes?.skills ?? []) {
    if (![...skillIds].some((id) => id.startsWith(prefix))) errors.push(`pack ${pack.id} selects no skills for ${prefix}`);
  }
  for (const asset of [...(pack.includes?.agents ?? []), ...(pack.includes?.prompts ?? [])]) {
    if (!findAsset('agents', asset)) errors.push(`pack ${pack.id} references missing agent asset: ${asset}`);
  }
  for (const dependency of pack.dependsOn ?? []) {
    if (!packs.some((candidate) => candidate.id === dependency)) errors.push(`pack ${pack.id} has unknown dependency: ${dependency}`);
  }
}

for (const adapter of adapters) {
  if (!/^[a-z][a-z0-9-]*$/.test(adapter.id ?? '')) errors.push(`invalid adapter id: ${adapter.id}`);
  if (!['native', 'adapter', 'plugin', 'export-only', 'experimental', 'unverified'].includes(adapter.status)) errors.push(`invalid adapter status: ${adapter.id}`);
  const directory = path.join(root, 'adapters', adapter.id);
  if (!fs.existsSync(directory)) errors.push(`missing adapter directory: ${adapter.id}`);
  if (!fs.readdirSync(directory).some((entry) => entry.endsWith('.template.md')) && !fs.existsSync(path.join(root, 'adapters', 'generic', 'AGENT.template.md'))) errors.push(`adapter has no instruction template: ${adapter.id}`);
}

if (errors.length) {
  console.error(`Distribution contract validation failed:\n${errors.map((entry) => `- ${entry}`).join('\n')}`);
  process.exit(1);
}
console.log(`Distribution contract validation passed for ${packs.length} packs and ${adapters.length} adapters.`);

function findJson(relative) {
  const target = path.join(root, relative);
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith('.json') ? [target] : [];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => findJson(path.join(relative, entry.name)));
}

function findAsset(relative, id) {
  return findJson(relative).length === 0 && !fs.existsSync(path.join(root, relative)) ? false : walk(path.join(root, relative)).some((file) => file.endsWith(`-${id}.md`));
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function readJson(relative) {
  const target = path.isAbsolute(relative) ? relative : path.join(root, relative);
  return JSON.parse(fs.readFileSync(target, 'utf8'));
}
