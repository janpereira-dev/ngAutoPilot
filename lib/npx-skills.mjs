import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

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

export function renderNpxGateway(bundle) {
  const era = bundle.angularRange
    ? `This gateway covers Angular ${bundle.angularRange.min}-${bundle.angularRange.max}. Angular 3 was never released; the historical 2-5 gateway therefore routes 2→4→5.`
    : '';
  const sourcePacks = (bundle.packs ?? []).map((pack) => `- \`${pack}\``).join('\n') || '- Prefix-selected canonical guidance';
  const prefixes = (bundle.prefixes ?? []).map((prefix) => `- \`${prefix}*\``).join('\n');
  const native = (bundle.nativePacks ?? bundle.packs ?? []).map((pack) => `- \`${pack}\``).join('\n');

  return `---
name: ${bundle.id}
description: ${JSON.stringify(bundle.description)}
---

# ${bundle.title}

## Purpose

${bundle.description}

This is a curated NgAutoPilot **gateway skill** for \`npx skills\`, Pi, and other broad discovery surfaces. It deliberately presents one capability boundary instead of hundreds of canonical micro-skills.

${era}

## Workflow

1. Inspect the receiving repository before proposing changes.
2. Detect Angular, Node.js, TypeScript, RxJS, package-manager, test, and workspace evidence relevant to the task.
3. Read \`references/index.md\` and choose the narrowest route for the task.
4. For Angular upgrades, move one supported major hop at a time and keep modernization separate until the hop is stable.
5. Apply compatibility and risk gates before editing.
6. Make the smallest reversible change.
7. Run the receiving repository's real validation commands and report evidence, failures, and residual risk.

## Routes represented by this gateway

Source packs:

${sourcePacks}
${prefixes ? `\nCanonical ID prefixes:\n\n${prefixes}\n` : ''}
For the complete canonical procedures, use the NgAutoPilot CLI and install the narrowest matching native pack:

${native}

Example:

\`\`\`bash
npm exec --package=ngautopilot -- ngautopilot install --agent <agent> --pack <pack-id> --scope project --dry-run
\`\`\`

Replace \`<agent>\` and \`<pack-id>\` with IDs returned by \`ngautopilot adapters\` and \`ngautopilot packs\`.

## Progressive disclosure

- Start with this gateway and \`references/index.md\`.
- Do not load unrelated capability families merely because they exist in the repository.
- This gateway is intentionally a routing layer, not a duplicate of the 413 canonical skill bodies.
- If an exact version-specific procedure is required, install or open the corresponding canonical pack rather than inventing missing detail.

## Safety

- Do not guess framework compatibility.
- Do not install dependencies unless the task requires them and the receiving project approves the change.
- Do not mix unrelated refactors with upgrade work.
- Do not claim validation that was not executed.
- Treat generated guidance as assistance, not as a replacement for tests, review, or security gates.

## Expected output

Return the selected route, compatibility/risk notes, changed files, validation commands and results, and any remaining blockers.
`;
}

export function renderNpxIndex(bundle) {
  const packs = (bundle.packs ?? []).map((pack) => `- \`${pack}\``).join('\n') || '- none';
  const native = (bundle.nativePacks ?? bundle.packs ?? []).map((pack) => `- \`${pack}\``).join('\n') || '- none';
  const prefixes = (bundle.prefixes ?? []).map((prefix) => `- \`${prefix}*\``).join('\n') || '- none';
  const era = bundle.angularRange ? `${bundle.angularRange.min}-${bundle.angularRange.max}` : 'not version-bounded';

  return `# ${bundle.title} — route index

Generated from \`config/npx-skills.json\`. This index describes routing boundaries; it does not duplicate canonical skill bodies.

## Angular era

${era}

## Source pack routes

${packs}

## Canonical ID prefixes

${prefixes}

## Full-fidelity native pack routes

${native}

## Routing contract

1. Inspect project evidence before choosing a route.
2. Prefer the smallest matching pack or exact major hop.
3. Keep Angular upgrade hops separate from modernization.
4. Open canonical skill bodies when detailed procedure or compatibility evidence is required.
5. Validate in the receiving repository and report what actually ran.
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
      fs.writeFileSync(path.join(directory, 'SKILL.md'), renderNpxGateway(bundle), 'utf8');
      fs.writeFileSync(path.join(directory, 'references', 'index.md'), renderNpxIndex(bundle), 'utf8');
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
    const boundaryContent = fs.readFileSync(boundary, 'utf8');
    if (!/^name:\s*ngautopilot-internal-catalog\s*$/m.test(boundaryContent) || !/^\s+internal:\s*true\s*$/m.test(boundaryContent)) {
      errors.push('skills/SKILL.md must be the internal catalog discovery boundary');
    }
  }

  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
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
    for (const pack of bundle.packs ?? []) {
      if (!fs.existsSync(path.join(root, 'packs', `${pack}.json`))) errors.push(`${bundle.id}: missing source pack ${pack}`);
    }
    for (const prefix of bundle.prefixes ?? []) {
      if (!(catalog.skills ?? []).some((skill) => skill.id.startsWith(prefix))) errors.push(`${bundle.id}: prefix selects no canonical skills: ${prefix}`);
    }

    const directory = path.join(publicRoot, bundle.id);
    const skillFile = path.join(directory, 'SKILL.md');
    const indexFile = path.join(directory, 'references', 'index.md');
    if (!fs.existsSync(skillFile)) {
      errors.push(`${bundle.id}: missing SKILL.md`);
      continue;
    }
    if (fs.readFileSync(skillFile, 'utf8') !== renderNpxGateway(bundle)) {
      errors.push(`${bundle.id}: SKILL.md is out of sync; run npm run npx-skills:sync`);
    }
    if (!fs.existsSync(indexFile) || fs.readFileSync(indexFile, 'utf8') !== renderNpxIndex(bundle)) {
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
