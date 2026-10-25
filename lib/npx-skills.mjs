import fs from 'node:fs';
import path from 'node:path';
import { resolvePackSkills, parseFrontmatter } from './agent-plugins/pack-resolver.mjs';
import { copyContainedDirectory } from './agent-plugins/path-safety.mjs';

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
Every canonical procedure selected by this gateway is **included locally** under \`references/skills/\`. No second installer is required. External source citations and optional repository documentation links provide further reading; the procedures themselves are installed files.

## Progressive disclosure

- Start with \`references/index.md\`; it links to the exact local \`references/skills/<id>/procedure.md\` needed.
- Those procedures are full copies of the canonical source, not pointers to another repository.
- Activate only the single appropriate procedure or Angular major hop; never load all referenced files into context.
- If the route requires a specialist, consult \`references/agents/\` and \`references/agents/prompts/\` when present.
- Do not load unrelated capability families merely because they are installed.

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

export function procedureRelativePath(skill) {
  const slug = skill.id.replaceAll('.', '--');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('invalid canonical skill id: ' + skill.id);
  return path.posix.join('references', 'skills', slug, 'procedure.md');
}

export function resolveNpxBundleSkills(root, bundle) {
  const catalogPath = path.join(root, 'catalog.json');
  const packsRoot = path.join(root, 'packs');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const selected = new Map();
  for (const packId of bundle.packs ?? []) {
    const matched = resolvePackSkills({ catalogPath, packsRoot, sourceRoot: root, packId });
    for (const skill of matched) selected.set(skill.id, skill);
  }
  for (const skill of catalog.skills ?? []) {
    if (!(bundle.prefixes ?? []).some((prefix) => skill.id.startsWith(prefix))) continue;
    const source = path.join(root, skill.path);
    const metadata = parseFrontmatter(fs.readFileSync(source, 'utf8'));
    selected.set(skill.id, { ...skill, metadata });
  }
  return [...selected.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export function renderNpxIndex(bundle, root = process.cwd()) {
  const skills = resolveNpxBundleSkills(root, bundle);
  const rows = skills.map((skill) => {
    const local = procedureRelativePath(skill).replace(/^references\//, '');
    const angular = skill.compatibility?.min !== undefined || skill.compatibility?.max !== undefined
      ? String(skill.compatibility?.min ?? '*') + '..' + String(skill.compatibility?.max ?? '*')
      : '-';
    const clean = (value) => String(value ?? '').replaceAll('|', '/').replaceAll('\n', ' ');
    return '| ' + clean(skill.id) + ' | [' + clean(skill.name) + '](' + local + ') | ' + clean(skill.category) + ' | ' + angular + ' |';
  });
  return [
    '# ' + bundle.title + ' — local canonical procedures',
    '',
    'This gateway installs **' + skills.length + ' complete canonical procedures**. Open only the one matching your task.',
    'Every link resolves to an installed file; no second download or CLI invocation is needed.',
    '',
    '| ID | Procedure | Category | Angular compatibility |',
    '| --- | --- | --- | --- |',
    ...rows,
    ''
  ].join('\n');
}

export function localizeProcedure({ root, skill }) {
  const source = path.join(root, skill.path);
  const sourceBody = fs.readFileSync(source, 'utf8');
  const docRoot = path.join(root, 'docs');
  const documents = new Map();
  const content = sourceBody.replace(/(!?\[[^\]]+\]\()([^\)]+)(\))/g, (match, before, reference, after) => {
    const [relativePath, ...fragmentParts] = reference.split('#');
    if (!/^(?:\.\.\/)+docs\/[a-zA-Z0-9/_.-]+\.md$/.test(relativePath)) return match;
    const absolute = path.resolve(path.dirname(source), relativePath);
    const relative = path.relative(docRoot, absolute);
    if (!relative || relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) {
      throw new Error('canonical Markdown reference escapes public docs: ' + reference);
    }
    const stat = fs.lstatSync(absolute, { throwIfNoEntry: false });
    if (!stat || !stat.isFile() || stat.isSymbolicLink()) {
      throw new Error('canonical Markdown reference is missing or unsafe: ' + relative);
    }
    documents.set(relative, absolute);
    const local = '../../docs/' + relative.split(path.sep).join('/');
    const fragment = fragmentParts.length ? '#' + fragmentParts.join('#') : '';
    return before + local + fragment + after;
  });
  return { content, documents: [...documents].map(([relative, source]) => ({ relative, source })) };
}

function renderReferenceDocument(root, source) {
  // Repository navigation is optional reading, not an installed procedure dependency.
  return fs.readFileSync(source, 'utf8')
    .replace(/<!-- docs:navigation:start -->[\s\S]*?<!-- docs:navigation:end -->\s*/, '')
    .replace(/(!?\[[^\]]+\]\()([^\)]+)(\))/g, (match, before, reference, after) => {
      if (!reference || reference.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(reference)) return match;
      const [resource, fragment] = reference.split('#');
      const relative = path.relative(root, path.resolve(path.dirname(source), resource)).split(path.sep).join('/');
      if (relative.startsWith('../') || path.isAbsolute(relative)) throw new Error('reference documentation escapes repository: ' + reference);
      return before + 'https://github.com/janpereira-dev/ngAutoPilot/blob/main/' + relative + (fragment ? '#' + fragment : '') + after;
    });
}

export function syncNpxSkills({ root = process.cwd() } = {}) {
  const config = loadNpxSkillsConfig(root);
  const publicRoot = path.join(root, '.agents', 'skills');
  const parent = path.dirname(publicRoot);
  fs.mkdirSync(parent, { recursive: true });
  const stat = fs.lstatSync(publicRoot, { throwIfNoEntry: false });
  if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) {
    throw new Error('refusing unsafe public skill destination: ' + publicRoot);
  }
  // Stage on the same filesystem, so publish is atomic and EXDEV cannot remove good output.
  const stage = fs.mkdtempSync(path.join(parent, '.npx-stage-'));
  let backup;
  let published = false;
  try {
    for (const bundle of config.bundles) {
      const target = path.join(stage, bundle.id);
      fs.mkdirSync(path.join(target, 'references'), { recursive: true });
      fs.writeFileSync(path.join(target, 'SKILL.md'), renderNpxGateway(bundle), 'utf8');
      const selected = resolveNpxBundleSkills(root, bundle);
      if (selected.length === 0) throw new Error(bundle.id + ': no canonical procedures selected');
      fs.writeFileSync(path.join(target, 'references', 'index.md'), renderNpxIndex(bundle, root), 'utf8');

      for (const skill of selected) {
        const source = path.join(root, skill.path);
        const destination = path.join(target, path.dirname(procedureRelativePath(skill)));
        copyContainedDirectory(path.dirname(source), destination, { excludeNestedSkills: true });
        const procedure = path.join(destination, 'procedure.md');
        fs.renameSync(path.join(destination, 'SKILL.md'), procedure);
        const localized = localizeProcedure({ root, skill });
        if (localized.content !== fs.readFileSync(procedure, 'utf8')) fs.writeFileSync(procedure, localized.content, 'utf8');
        for (const doc of localized.documents) {
          const targetDoc = path.join(target, 'references', 'docs', doc.relative);
          fs.mkdirSync(path.dirname(targetDoc), { recursive: true });
          fs.writeFileSync(targetDoc, renderReferenceDocument(root, doc.source), 'utf8');
        }
      }
      if (bundle.id === 'ngautopilot-full') {
        copyContainedDirectory(path.join(root, 'agents', 'ngautopilot'), path.join(target, 'references', 'agents'));
        for (const readme of ['README.md', 'README.es.md']) {
          fs.writeFileSync(path.join(target, 'references', 'agents', readme),
            renderReferenceDocument(root, path.join(root, 'agents', 'ngautopilot', readme)), 'utf8');
        }
        const rules = path.join(root, 'docs', 'prompts-and-guardrails.md');
        if (fs.existsSync(rules)) fs.writeFileSync(path.join(target, 'references', 'guardrails.md'), renderReferenceDocument(root, rules), 'utf8');
      }
    }
    if (stat) {
      backup = fs.mkdtempSync(path.join(parent, '.npx-backup-'));
      fs.rmdirSync(backup);
      fs.renameSync(publicRoot, backup);
    }
    try {
      fs.renameSync(stage, publicRoot);
      published = true;
    } catch (error) {
      if (backup) fs.renameSync(backup, publicRoot);
      backup = undefined;
      throw error;
    }
  } finally {
    if (!published && fs.existsSync(stage)) fs.rmSync(stage, { recursive: true, force: true });
    if (published && backup) fs.rmSync(backup, { recursive: true, force: true });
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

  for (const family of ['', '_core', 'angular', 'css', 'frontend', 'javascript', 'quality', 'typescript']) {
    const boundary = path.join(root, 'skills', family, 'SKILL.md');
    if (!fs.existsSync(boundary) || !/^\s+internal:\s*true\s*$/m.test(fs.readFileSync(boundary, 'utf8'))) {
      errors.push('missing internal discovery boundary: ' + path.relative(root, boundary));
    }
  }
  const marketplace = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  for (const plugin of marketplace.plugins ?? []) {
    if (plugin.source?.source !== 'git-subdir' || plugin.source?.url !== 'janpereira-dev/ngAutoPilot') {
      errors.push('Claude marketplace leaks native plugin skills into npx discovery: ' + plugin.name);
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
    if (!fs.existsSync(indexFile) || fs.readFileSync(indexFile, 'utf8') !== renderNpxIndex(bundle, root)) {
      errors.push(`${bundle.id}: references/index.md is out of sync; run npm run npx-skills:sync`);
    }
    const selected = resolveNpxBundleSkills(root, bundle);
    for (const skill of selected) {
      const bundled = path.join(directory, procedureRelativePath(skill));
      const source = path.join(root, skill.path);
      const localized = localizeProcedure({ root, skill });
      if (!fs.existsSync(bundled) || fs.readFileSync(bundled, 'utf8') !== localized.content) {
        errors.push(bundle.id + ': missing/stale canonical procedure ' + skill.id);
      }
      for (const doc of localized.documents) {
        const targetDoc = path.join(directory, 'references', 'docs', doc.relative);
        if (!fs.existsSync(targetDoc) || fs.readFileSync(targetDoc, 'utf8') !== renderReferenceDocument(root, doc.source)) {
          errors.push(bundle.id + ': missing/stale reference documentation ' + doc.relative);
        }
      }
    }
    if (bundle.id === 'ngautopilot-full') {
      for (const relative of ['references/agents/subagents/primary/01-spartan-contrarian-developer.md', 'references/agents/prompts/codex-integration.md', 'references/guardrails.md']) {
        if (!fs.existsSync(path.join(directory, relative))) errors.push('full bundle missing: ' + relative);
      }
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
