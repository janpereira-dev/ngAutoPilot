import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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
  }
});

test('canonical micro-skills are hidden behind one internal discovery boundary', () => {
  const boundaryPath = path.join(ROOT, 'skills', 'SKILL.md');
  assert.equal(fs.existsSync(boundaryPath), true, 'skills/SKILL.md discovery boundary is required');
  const boundary = fs.readFileSync(boundaryPath, 'utf8');
  assert.match(boundary, /^name:\s*ngautopilot-internal-catalog\s*$/m);
  assert.match(boundary, /^\s+internal:\s*true\s*$/m);
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

function findNestedSkillFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return findNestedSkillFiles(target);
    return entry.isFile() && entry.name === 'SKILL.md' ? [target] : [];
  });
}
