import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(repositoryRoot, 'bin', 'ngautopilot.mjs');

test('Angular 12 dry-run returns selection evidence without migration hops', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const result = run(projectRoot, 'install', '--agent', 'codex', '--angular', '12.2', '--profile', 'testing', '--capabilities', 'ui,testing', '--dry-run', '--json');

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.dryRun, true);
  assert.equal(output.selection.profile, 'testing');
  assert.deepEqual(output.selection.capabilities, ['testing', 'ui']);
  assert.ok(output.selection.selection.sourcePacks.some(item => item.id === 'ngautopilot-angular-testing'));
  assert.ok(output.selection.excluded.some((item) => item.selector === 'angular.upgrade.hops.*'));
  assert.equal(output.selection.included.some((item) => item.id.includes('angular.upgrade.hops')), false);
});

test('rejects contradictory pack and Angular selection', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const result = run(projectRoot, 'install', '--agent', 'codex', '--pack', 'ngautopilot-core', '--angular', '12.2', '--profile', 'core');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /mutually exclusive/);
});

test('filtered Angular installation cannot reintroduce skills excluded by source packs', (t) => {
  const projectRoot = createAngularProject(t, '14.1.3');
  const result = run(projectRoot, 'install', '--agent', 'codex', '--angular', '14.1', '--profile', 'essentials', '--capabilities', 'ui,state', '--yes', '--json');
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, '.ngautopilot-manifest.json'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'catalog.json'), 'utf8'));
  for (const excluded of output.selection.excluded.filter(item => item.type === 'skill')) {
    const skill = catalog.skills.find(skill => skill.id === excluded.id);
    if (skill) assert.equal(manifest.files.some(file => file.path.endsWith(skill.path.slice('skills/'.length))), false, excluded.id);
  }
  assert.equal(manifest.files.some(file => /functional-guards|signals-fundamentals/.test(file.path)), false);
});

test('updates the persisted Angular selection without activating migration hops', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const install = run(projectRoot, 'install', '--agent', 'codex', '--angular', '12.2', '--profile', 'migration', '--yes', '--json');
  assert.equal(install.status, 0, install.stderr);
  const manifestPath = path.join(projectRoot, '.ngautopilot-manifest.json');
  const initialManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(initialManifest.angularSelection, { target: { major: 12, minor: 2 }, profile: 'migration', capabilities: [] });
  assert.equal(initialManifest.files.some((file) => file.path.includes('upgrades/hops') || file.path.includes('upgrades/angularjs')), false);

  const update = run(projectRoot, 'update', '--agent', 'codex', '--json');
  assert.equal(update.status, 0, update.stderr);
  const updatedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(updatedManifest.angularSelection, initialManifest.angularSelection);
  assert.equal(updatedManifest.files.some((file) => file.path.includes('upgrades/hops') || file.path.includes('upgrades/angularjs')), false);
});

function createAngularProject(t, angularVersion) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-cli-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify({ private: true, dependencies: { '@angular/core': `^${angularVersion}`, '@angular/common': `^${angularVersion}` } }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/@angular/core': { version: angularVersion } } }, null, 2)}\n`);
  return root;
}

function run(cwd, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}
