import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'ngautopilot.mjs');

test('requires approval and writes nothing', (t) => {
  const project = fixture(t, { name: 'angular-app', angular: '^15.2.0' });
  const result = run(project, 'work', 'plan', '--goal', 'Revisar tests y calidad sin cambiar Angular', '--agent', 'codex', '--json');
  assert.equal(result.status, 1);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, 'approval-required');
  assert.equal(output.plan.status, 'pending');
  assert.equal(fs.existsSync(path.join(project, '.ngautopilot', 'work-plan.json')), false);
});

test('dry-run never writes and persists an honest bounded plan after approval', (t) => {
  const project = fixture(t, { name: 'angular-app', angular: '^15.2.0' });
  const before = sourceState(project);
  const dryRun = run(project, 'work', 'plan', '--goal', 'Revisar tests y calidad sin cambiar Angular', '--agent', 'codex', '--yes', '--dry-run', '--json');
  assert.equal(dryRun.status, 0, dryRun.stderr);
  const output = JSON.parse(dryRun.stdout);
  assert.equal(output.status, 'dry-run');
  assert.equal(output.plan.evidence.angular.angular.major, 15);
  assert.deepEqual(sourceState(project), before);
  assert.equal(fs.existsSync(path.join(project, '.ngautopilot', 'work-plan.json')), false);

  const planned = run(project, 'work', 'plan', '--goal', 'Revisar tests y calidad sin cambiar Angular', '--agent', 'codex', '--yes', '--json');
  assert.equal(planned.status, 0, planned.stderr);
  const stored = JSON.parse(fs.readFileSync(path.join(project, '.ngautopilot', 'work-plan.json'), 'utf8'));
  assert.equal(stored.approvalRequired, true);
  assert.deepEqual(stored.authorizedOperations.map((item) => item.id), ['inventory', 'inspect', 'validate', 'report']);
  assert.equal(stored.constraints.arbitraryShell, 'forbidden');
  assert.equal(stored.constraints.fullPackInstallation, 'forbidden');
  assert.deepEqual(sourceState(project), before);
});

test('rejects missing and oversized goals, validates optional agent, and supports non-Angular projects', (t) => {
  const project = fixture(t, { name: 'node-tool' });
  const missing = run(project, 'work', 'plan', '--yes', '--json');
  assert.equal(missing.status, 1);
  assert.match(JSON.parse(missing.stdout).reason.message, /goal/i);
  const oversized = run(project, 'work', 'plan', '--goal', 'x'.repeat(501), '--yes', '--json');
  assert.equal(oversized.status, 1);
  const badAgent = run(project, 'work', 'plan', '--goal', 'Inspect quality', '--agent', 'missing', '--yes', '--json');
  assert.equal(badAgent.status, 1);
  const nonAngular = run(project, 'work', 'plan', '--goal', 'Inspect quality', '--yes', '--json');
  assert.equal(nonAngular.status, 0, nonAngular.stderr);
  assert.equal(JSON.parse(nonAngular.stdout).plan.evidence.angular, undefined);
});

test('derives work evidence from an owning workspace lockfile rather than a declaration floor', (t) => {
  const workspace = fixture(t, { name: 'workspace', angular: '^12.2.17' });
  fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({ private: true, workspaces: ['packages/*'] }));
  const project = path.join(workspace, 'packages', 'app');
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ dependencies: { '@angular/core': '^12.1.0' } }));
  fs.writeFileSync(path.join(workspace, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3,
    packages: { 'packages/app': {}, 'node_modules/@angular/core': { version: '12.2.17' } } }));
  const result = run(project, 'work', 'plan', '--goal', 'Inspect compatibility', '--yes', '--json');
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(result.stdout).plan.evidence;
  assert.equal(evidence.angular.angular.version, '12.2.17');
  assert.equal(evidence.angular.angular.source, 'package.json + lockfile');
  assert.equal(evidence.lockfile.path, path.join(workspace, 'package-lock.json'));
  assert.equal(evidence.package.packageManager, 'npm');
});

test('Angular peer-only library plans retain compatibility evidence', (t) => {
  const project = fixture(t, { name: 'angular-library' });
  fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ name: 'angular-library', peerDependencies: { '@angular/core': '^15.2.0' } }));
  const result = run(project, 'work', 'plan', '--goal', 'Inspect library API', '--yes', '--json');
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(result.stdout).plan.evidence;
  assert.equal(evidence.angular.angular.major, 15);
  assert.equal(evidence.angular.angular.source, 'package.json');
  assert.equal(evidence.angular.lockfile, undefined);
});

function fixture(t, { name, angular }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-work-plan-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dependencies = angular ? { '@angular/core': angular } : { 'node-fetch': '^3.3.2' };
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify({ name, private: true, dependencies }, null, 2)}\n`);
  if (angular) fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/@angular/core': { version: angular.slice(1) } } }, null, 2)}\n`);
  return root;
}

function sourceState(root) {
  return fs.readdirSync(root).filter((name) => name.endsWith('.json')).sort().map((name) => [name, fs.readFileSync(path.join(root, name), 'utf8')]);
}

function run(cwd, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}
