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
  assert.deepEqual(initialManifest.angularSelection, { projectRoot, target: { major: 12, minor: 2 }, profile: 'migration', capabilities: [] });
  assert.equal(initialManifest.files.some((file) => file.path.includes('upgrades/hops') || file.path.includes('upgrades/angularjs')), false);

  const update = run(projectRoot, 'update', '--agent', 'codex', '--yes', '--json');
  assert.equal(update.status, 0, update.stderr);
  const updatedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(updatedManifest.angularSelection, initialManifest.angularSelection);
  assert.equal(updatedManifest.files.some((file) => file.path.includes('upgrades/hops') || file.path.includes('upgrades/angularjs')), false);
});

test('install, update, and uninstall require explicit approval even with force', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const pending = run(projectRoot, 'install', '--agent', 'codex', '--pack', 'ngautopilot-core', '--force', '--json');
  assert.equal(pending.status, 1, pending.stderr);
  assert.equal(JSON.parse(pending.stdout).status, 'approval-required');
  const manifestPath = path.join(projectRoot, '.ngautopilot-manifest.json');
  assert.equal(fs.existsSync(manifestPath), false);
  assert.equal(fs.existsSync(path.join(projectRoot, '.agents')), false);
  const installed = run(projectRoot, 'install', '--agent', 'codex', '--pack', 'ngautopilot-core', '--yes', '--json');
  assert.equal(installed.status, 0, installed.stderr);
  const before = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(before);
  const firstSkill = path.join(projectRoot, manifest.files.find(file => file.path.endsWith('SKILL.md')).path);
  fs.appendFileSync(firstSkill, '\nUser customization\n');
  const edited = fs.readFileSync(firstSkill, 'utf8');
  for (const command of ['update', 'uninstall']) {
    const result = run(projectRoot, command, '--agent', 'codex', '--force', '--json');
    assert.equal(result.status, 1, result.stderr);
    assert.equal(JSON.parse(result.stdout).status, 'approval-required');
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), before);
    assert.equal(fs.readFileSync(firstSkill, 'utf8'), edited);
    const preview = run(projectRoot, command, '--agent', 'codex', '--dry-run', '--force', '--json');
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), before);
    assert.equal(fs.readFileSync(firstSkill, 'utf8'), edited);
  }
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

test('workspace-root update reuses the original nested Angular package', (t) => {
  const root = createAngularProject(t, '22.0.0');
  fs.mkdirSync(path.join(root, '.git'));
  const nested = path.join(root, 'packages', 'legacy');
  fs.mkdirSync(nested, { recursive: true });
  for (const file of ['package.json', 'package-lock.json']) {
    fs.writeFileSync(path.join(nested, file), fs.readFileSync(path.join(createAngularProject(t, '12.2.17'), file)));
  }
  const install = run(nested, 'install', '--agent', 'codex', '--angular', '12.2', '--profile', 'testing', '--yes', '--json');
  assert.equal(install.status, 0, install.stderr);
  const update = run(root, 'update', '--agent', 'codex', '--yes', '--json');
  assert.equal(update.status, 0, update.stderr);
  assert.equal(JSON.parse(update.stdout).selection.projectRoot, nested);
  assert.equal(JSON.parse(update.stdout).selection.evidence.angular.version, '12.2.17');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.ngautopilot-manifest.json'), 'utf8'));
  assert.equal(manifest.angularSelection.projectRoot, nested);
});

test('user-scope update from another project retains original Angular evidence', (t) => {
  const original = createAngularProject(t, '12.2.17');
  const other = createAngularProject(t, '22.0.0');
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-angular-home-'));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const invoke = (cwd, ...args) => spawnSync(process.execPath, [cli, ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, USERPROFILE: home, HOME: home },
  });
  const install = invoke(original, 'install', '--agent', 'codex', '--scope', 'user', '--angular', '12.2', '--profile', 'testing', '--yes', '--json');
  assert.equal(install.status, 0, install.stderr);
  const update = invoke(other, 'update', '--agent', 'codex', '--scope', 'user', '--yes', '--json');
  assert.equal(update.status, 0, update.stderr);
  assert.equal(JSON.parse(update.stdout).selection.projectRoot, original);
  assert.equal(JSON.parse(update.stdout).selection.evidence.angular.version, '12.2.17');
});

test('unbound and unavailable Angular project evidence fails without changing installation', (t) => {
  const root = createAngularProject(t, '12.2.17');
  assert.equal(run(root, 'install', '--agent', 'codex', '--angular', '12.2', '--profile', 'testing', '--yes', '--json').status, 0);
  const manifestPath = path.join(root, '.ngautopilot-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const projectRoot of [undefined, path.join(root, 'missing')]) {
    manifest.angularSelection.projectRoot = projectRoot;
    const before = `${JSON.stringify(manifest, null, 2)}\n`;
    fs.writeFileSync(manifestPath, before);
    const update = run(root, 'update', '--agent', 'codex', '--force', '--yes', '--json');
    assert.equal(update.status, 1);
    assert.match(update.stderr, /original project root|Original Angular project/);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), before);
  }
});
