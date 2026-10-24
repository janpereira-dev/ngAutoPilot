import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { syncNpxSkills, validateNpxSkills } from '../../lib/npx-skills.mjs';

const ROOT = path.resolve(path.join(import.meta.dirname, '..', '..'));
const PUBLIC_ROOT = path.join(ROOT, '.agents', 'skills');
const CONFIG = path.join(ROOT, 'config', 'npx-skills.json');

const EXPECTED = [
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

test('npx skills exposes exactly the curated public gateways', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'SKILL.md')), false, 'root SKILL.md would collapse repository discovery to one entry');
  assert.equal(fs.existsSync(CONFIG), true, 'missing npx skills bundle config');

  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  assert.deepEqual(config.bundles.map(({ id }) => id), EXPECTED);
  assert.equal(new Set(config.bundles.map(({ id }) => id)).size, EXPECTED.length);

  const publicEntries = fs.readdirSync(PUBLIC_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(PUBLIC_ROOT, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(publicEntries, [...EXPECTED].sort());

  for (const id of EXPECTED) {
    const skill = path.join(PUBLIC_ROOT, id, 'SKILL.md');
    const content = fs.readFileSync(skill, 'utf8');
    assert.match(content, new RegExp(`^name:\\s*["']?${id}["']?\\s*$`, 'm'), `${id} must expose its stable public name`);
    assert.equal(findNestedSkillFiles(path.join(PUBLIC_ROOT, id)).length, 1, `${id} must not leak nested SKILL.md entrypoints`);
    assert.equal(fs.existsSync(path.join(PUBLIC_ROOT, id, 'references', 'index.md')), true, `${id} must include its route index`);
    assert.equal(fs.existsSync(path.join(PUBLIC_ROOT, id, 'references', 'skills')), true, `${id} must bundle canonical procedure references`);
  }
});

test('all source families have internal discovery boundaries', () => {
  for (const family of ['', '_core', 'angular', 'css', 'frontend', 'javascript', 'quality', 'typescript']) {
    const boundary = path.join(ROOT, 'skills', family, 'SKILL.md');
    assert.equal(fs.existsSync(boundary), true, `missing internal marker in ${family}`);
    assert.match(fs.readFileSync(boundary, 'utf8'), /^\s+internal:\s*true\s*$/m);
  }
  const marketplace = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.ok(marketplace.plugins.every(plugin => plugin.source?.source === 'git-subdir'));
});

test('Angular era gateways cover every supported major hop without inventing Angular 3', () => {
  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  const byId = new Map(config.bundles.map((bundle) => [bundle.id, bundle]));
  const eras = [
    ['ngautopilot-angular-2-5', ['ngautopilot-angular-2-to-4', 'ngautopilot-angular-4-to-5']],
    ['ngautopilot-angular-6-8', ['ngautopilot-angular-5-to-6', 'ngautopilot-angular-6-to-7', 'ngautopilot-angular-7-to-8']],
    ['ngautopilot-angular-9-12', ['ngautopilot-angular-8-to-9', 'ngautopilot-angular-9-to-10', 'ngautopilot-angular-10-to-11', 'ngautopilot-angular-11-to-12']],
    ['ngautopilot-angular-13-15', ['ngautopilot-angular-12-to-13', 'ngautopilot-angular-13-to-14', 'ngautopilot-angular-14-to-15']],
    ['ngautopilot-angular-16-17', ['ngautopilot-angular-15-to-16', 'ngautopilot-angular-16-to-17']],
    ['ngautopilot-angular-18-19', ['ngautopilot-angular-17-to-18', 'ngautopilot-angular-18-to-19']],
    ['ngautopilot-angular-20-22', ['ngautopilot-angular-19-to-20', 'ngautopilot-angular-20-to-21', 'ngautopilot-angular-21-to-22']],
  ];

  for (const [id, packs] of eras) {
    assert.deepEqual(byId.get(id)?.packs, packs, `${id} must resolve the documented bounded hops`);
  }
  assert.equal(JSON.stringify(config).includes('angular-2-to-3'), false);
  assert.equal(JSON.stringify(config).includes('angular-3-to-4'), false);
});

test('gateway bundles preserve canonical procedure bodies without exposing nested skills', () => {
  const source = path.join(ROOT, 'skills', 'angular', 'upgrades', 'hops', 'angular-14-to-15', 'SKILL.md');
  const bundled = path.join(
    PUBLIC_ROOT,
    'ngautopilot-angular-13-15',
    'references',
    'skills',
    'angular--upgrade--hops--angular-14-to-15',
    'procedure.md',
  );
  assert.equal(fs.existsSync(bundled), true);
  assert.equal(fs.readFileSync(bundled, 'utf8'), fs.readFileSync(source, 'utf8'));

  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
  const fullReferences = fs.readdirSync(path.join(PUBLIC_ROOT, 'ngautopilot-full', 'references', 'skills'))
    .filter((name) => fs.existsSync(path.join(PUBLIC_ROOT, 'ngautopilot-full', 'references', 'skills', name, 'procedure.md')));
  assert.equal(fullReferences.length, catalog.skills.length);
});

test('bundled design procedures preserve local access to referenced documentation', () => {
  for (const bundle of ['ngautopilot-frontend', 'ngautopilot-full']) {
    const location = path.join(PUBLIC_ROOT, bundle);
    const source = path.join(ROOT, 'docs', 'design-excellence-guide.md');
    const guide = path.join(location, 'references', 'docs', 'design-excellence-guide.md');
    assert.equal(fs.existsSync(guide), true);
    assert.deepEqual(fs.readFileSync(guide), fs.readFileSync(source));

    const skill = path.join(location, 'references', 'skills',
      'frontend--design--design-quality-orchestrator', 'procedure.md');
    const content = fs.readFileSync(skill, 'utf8');
    assert.match(content, /\]\(\.\.\/\.\.\/docs\/design-excellence-guide\.md\)/);
    assert.equal(fs.existsSync(path.resolve(path.dirname(skill), '../../docs/design-excellence-guide.md')), true);
  }
});

test('Pi consumes the same curated public surface', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.deepEqual(pkg.pi?.skills, ['./.agents/skills']);
  assert.equal(pkg.files.includes('SKILL.md'), false);
});

test('public gateway generation is deterministic and repository validation is clean', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-npx-skills-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temp, 'config'), { recursive: true });
  fs.copyFileSync(CONFIG, path.join(temp, 'config', 'npx-skills.json'));
  fs.copyFileSync(path.join(ROOT, 'catalog.json'), path.join(temp, 'catalog.json'));
  fs.cpSync(path.join(ROOT, 'packs'), path.join(temp, 'packs'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'skills'), path.join(temp, 'skills'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'agents'), path.join(temp, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(temp, 'docs'));
  fs.copyFileSync(path.join(ROOT, 'docs', 'prompts-and-guardrails.md'), path.join(temp, 'docs', 'prompts-and-guardrails.md'));
  fs.mkdirSync(path.join(temp, '.claude-plugin'));
  fs.copyFileSync(path.join(ROOT, '.claude-plugin', 'marketplace.json'), path.join(temp, '.claude-plugin', 'marketplace.json'));

  syncNpxSkills({ root: temp });
  const snapshot = snapshotTree(path.join(temp, '.agents', 'skills'));
  syncNpxSkills({ root: temp });
  assert.deepEqual(snapshotTree(path.join(temp, '.agents', 'skills')), snapshot);

  assert.deepEqual(validateNpxSkills({ root: ROOT }).errors, []);
});

function snapshotTree(directory) {
  return Object.fromEntries(fs.readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(directory, file), fs.readFileSync(file, 'utf8')];
    }));
}

function findNestedSkillFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return findNestedSkillFiles(target);
    return entry.isFile() && entry.name === 'SKILL.md' ? [target] : [];
  });
}
