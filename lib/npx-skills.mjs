import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseFrontmatter, resolvePackSkills } from './agent-plugins/pack-resolver.mjs';

export const NPX_PUBLIC_SKILL_IDS = [
  'ngautopilot-core',
  'ngautopilot-angular',
  'ngautopilot-angular-upgrades',
  'ngautopilot-angular-microfrontends',
  'ngautopilot-frontend',
  'ngautopilot-performance',
  'ngautopilot-quality',
  'ngautopilot-angular-2-5',
  'ngautopilot-angular-6-8',
  'ngautopilot-angular-9-12',
  'ngautopilot-angular-13-15',
  'ngautopilot-angular-16-17',
  'ngautopilot-angular-18-19',
  'ngautopilot-angular-20-22',
  'ngautopilot-full',
];

export function loadNpxSkillsConfig(root = process.cwd()) {
  const file = path.join(root, 'config', 'npx-skills.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (config?.$schemaVersion !== '1.0.0' || !Array.isArray(config?.bundles)) {
    throw new Error('config/npx-skills.json must declare $schemaVersion 1.0.0 and bundles');
  }
  const ids = config.bundles.map(({ id }) => id);
  if (new Set(ids).size !== ids.length) throw new Error('npx skills bundle IDs must be unique');
  if (JSON.stringify(ids) !== JSON.stringify(NPX_PUBLIC_SKILL_IDS)) {
    throw new Error(`npx skills public surface changed unexpectedly: ${ids.join(', ')}`);
  }
  return config;
}

export function resolveNpxBundleSkills(root, bundle) {
  const catalogPath = path.join(root, 'catalog.json');
  const packsRoot = path.join(root, 'packs');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const selected = new Map();

  for (const packId of bundle.packs ?? []) {
    for (const skill of resolvePackSkills({ catalogPath, packsRoot, sourceRoot: root, packId })) {
      selected.set(skill.id, skill);
    }
  }

  for (const skill of catalog.skills ?? []) {
    if (!(bundle.prefixes ?? []).some((prefix) => skill.id.startsWith(prefix))) continue;
    const source = path.join(root, skill.path);
    const metadata = parseFrontmatter(fs.readFileSync(source, 'utf8'));
    selected.set(skill.id, { ...skill, description: metadata.description, metadata });
  }

  return [...selected.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function renderNpxGateway(root, bundle) {
  const skills = resolveNpxBundleSkills(root, bundle);
  if (skills.length === 0) throw new Error(`${bundle.id}: public gateway selects no canonical skills`);
  const era = bundle.angularRange
    ? `This gateway covers Angular ${bundle.angularRange.min}-${bundle.angularRange.max}. Angular 3 was never released; the historical 2-5 gateway therefore routes 2→4→5.`
    : '';
  const native = (bundle.nativePacks ?? bundle.packs ?? []).map((pack) => `\`${pack}\``).join(', ');
  const packLines = (bundle.packs ?? []).map((pack) => `- \`${pack}\``).join('\n');

  return `---
name: ${bundle.id}
description: ${JSON.stringify(bundle.description)}
---

# ${bundle.title}

## Purpose

${bundle.description}

This is a curated NgAutoPilot **gateway skill** for \`npx skills\` and other public discovery surfaces. It keeps hundreds of canonical micro-skills out of the install picker while preserving deterministic routing to the underlying catalog.

${era}

## Workflow

1. Inspect the receiving repository before proposing changes.
2. Detect Angular, Node.js, TypeScript, RxJS, package-manager, test, and workspace evidence that matters to the task.
3. Read \`references/index.md\` and choose the smallest matching canonical route.
4. For Angular upgrades, move one supported major hop at a time and keep modernization separate until the hop is stable.
5. Apply compatibility and risk gates before editing.
6. Make the smallest reversible change.
7. Run the receiving repository's real validation commands and report evidence, failures, and residual risk.

## Canonical coverage

This gateway indexes **${skills.length} canonical skills**. The source catalog remains under \`skills/\`; this public gateway intentionally does not duplicate every procedure into the discovery surface.

Selected source packs:

${packLines || '- Prefix-selected canonical skills'}

For a full-fidelity project installation, the corresponding native pack route is: ${native || 'use the NgAutoPilot CLI pack list and select the narrowest matching pack'}.

## Progressive disclosure

- Start with \`references/index.md\`.
- If the receiving repository already contains NgAutoPilot canonical skills, open the exact \`SKILL.md\` path listed in the index.
- If only this gateway is installed, use the index to route and do **not** invent omitted version-specific procedure details. Ask for or install the matching native pack when the exact canonical procedure is required.
- Do not load unrelated skill families merely because they are available.

## Safety

- Do not guess framework compatibility.
- Do not install dependencies unless the task requires them and the receiving project approves the change.
- Do not mix unrelated refactors with upgrade work.
- Do not claim validation that was not executed.
- Treat generated guidance as assistance, not as a replacement for tests, review, or security gates.

## Expected output

Return the selected canonical route, compatibility/risk notes, changed files, validation commands and results, and any remaining blockers.
`;
}

export function renderNpxIndex(root, bundle) {
  const skills = resolveNpxBundleSkills(root, bundle);
  const rows = skills.map((skill) => {
    const triggers = Array.isArray(skill.triggers) ? skill.triggers.join(', ') : '';
    const compatibility = skill.compatibility?.min || skill.compatibility?.max
      ? `${skill.compatibility?.min ?? '*'}..${skill.compatibility?.max ?? '*'}`
      : '';
    return `| \`${escapeCell(skill.id)}\` | ${escapeCell(skill.name)} | ${escapeCell(skill.category)} | ${escapeCell(compatibility)} | \`${escapeCell(skill.path)}\` | ${escapeCell(triggers)} |`;
  }).join('\n');

  return `# ${bundle.title} — canonical route index

Generated from \`catalog.json\` and \`config/npx-skills.json\`. Do not treat this index as a replacement for a canonical skill body.

| Skill ID | Name | Category | Angular | Source | Triggers |
| --- | --- | --- | --- | --- | --- |
${rows}
`;
}

export function syncNpxSkills({ root = process.cwd() } = {}) {
  const config = loadNpxSkillsConfig(root);
  const publicRoot = path.join(root, '.agents', 'skills');
  fs.mkdirSync(path.dirname(publicRoot), { recursive: true });
  const stagingParent = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-npx-skills-'));
  const staging = path.join(stagingParent, 'skills');
  fs.mkdirSync(staging);

  try {
    for (const bundle of config.bundles) {
      const directory = path.join(staging, bundle.id);
      fs.mkdirSync(path.join(directory, 'references'), { recursive: true });
      fs.writeFileSync(path.join(directory, 'SKILL.md'), renderNpxGateway(root, bundle), 'utf8');
      fs.writeFileSync(path.join(directory, 'references', 'index.md'), renderNpxIndex(root, bundle), 'utf8');
    }

    fs.rmSync(publicRoot, { recursive: true, force: true });
    fs.renameSync(staging, publicRoot);
  } finally {
    fs.rmSync(stagingParent, { recursive: true, force: true });
  }

  return { bundles: config.bundles.length, publicRoot };
}

export function validateNpxSkills({ root = process.cwd() } = {}) {
  const errors = [];
  let config;
  try {
    config = loadNpxSkillsConfig(root);
  } catch (error) {
    return { errors: [error.message], bundles: 0 };
  }

  if (fs.existsSync(path.join(root, 'SKILL.md'))) {
    errors.push('root SKILL.md must not exist because it collapses npx skills repository discovery to one root entry');
  }

  const boundary = path.join(root, 'skills', 'SKILL.md');
  if (!fs.existsSync(boundary)) {
    errors.push('skills/SKILL.md internal discovery boundary is missing');
  } else {
    const content = fs.readFileSync(boundary, 'utf8');
    if (!/^name:\s*ngautopilot-internal-catalog\s*$/m.test(content) || !/^\s+internal:\s*true\s*$/m.test(content)) {
      errors.push('skills/SKILL.md must be the internal catalog discovery boundary');
    }
  }

  const publicRoot = path.join(root, '.agents', 'skills');
  const actual = fs.existsSync(publicRoot)
    ? fs.readdirSync(publicRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(publicRoot, entry.name, 'SKILL.md')))
      .map((entry) => entry.name)
      .sort()
    : [];
  const expected = [...NPX_PUBLIC_SKILL_IDS].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`public npx skills mismatch; expected ${expected.join(', ')}, found ${actual.join(', ')}`);
  }

  for (const bundle of config.bundles) {
    let selected = [];
    try {
      selected = resolveNpxBundleSkills(root, bundle);
    } catch (error) {
      errors.push(`${bundle.id}: ${error.message}`);
      continue;
    }
    if (selected.length === 0) errors.push(`${bundle.id}: selects no canonical skills`);

    const directory = path.join(publicRoot, bundle.id);
    const skillFile = path.join(directory, 'SKILL.md');
    const indexFile = path.join(directory, 'references', 'index.md');
    if (!fs.existsSync(skillFile)) {
      errors.push(`${bundle.id}: missing SKILL.md`);
      continue;
    }
    if (fs.readFileSync(skillFile, 'utf8') !== renderNpxGateway(root, bundle)) {
      errors.push(`${bundle.id}: SKILL.md is out of sync; run npm run npx-skills:sync`);
    }
    if (!fs.existsSync(indexFile) || fs.readFileSync(indexFile, 'utf8') !== renderNpxIndex(root, bundle)) {
      errors.push(`${bundle.id}: references/index.md is out of sync; run npm run npx-skills:sync`);
    }
    const nested = findSkillFiles(directory);
    if (nested.length !== 1 || path.resolve(nested[0]) !== path.resolve(skillFile)) {
      errors.push(`${bundle.id}: must expose exactly one SKILL.md entrypoint`);
    }
  }

  return { errors, bundles: config.bundles.length };
}

function findSkillFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return findSkillFiles(target);
    return entry.isFile() && entry.name === 'SKILL.md' ? [target] : [];
  });
}

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}
