import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(repositoryRoot, 'bin', 'ngautopilot.mjs');

test('creates a pending ten-hop 12-to-22 plan only after approval', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const before = sourceState(projectRoot);
  const pending = run(projectRoot, 'migrate', 'setup', '--from', '12', '--to', '22', '--agent', 'codex', '--json');
  assert.equal(pending.status, 1);
  const pendingOutput = JSON.parse(pending.stdout);
  assert.equal(pendingOutput.status, 'approval-required');
  assert.equal(pendingOutput.plan.status, 'pending');
  assert.equal(pendingOutput.plan.approvalRequired, true);
  assert.equal(pendingOutput.plan.route.hops.length, 10);
  assert.equal(pendingOutput.plan.route.hops[0].id, '12-to-13');
  assert.equal(pendingOutput.plan.route.hops.at(-1).id, '21-to-22');
  assert.match(pendingOutput.plan.route.hops[0].pack.contentHash, /^[a-f0-9]{64}$/);
  assert.equal(fs.existsSync(path.join(projectRoot, '.ngautopilot', 'migration-plan.json')), false);
  assert.deepEqual(sourceState(projectRoot), before);

  const planned = run(projectRoot, 'migrate', 'setup', '--from', '12', '--to', '22', '--agent', 'codex', '--yes', '--json');
  assert.equal(planned.status, 0, planned.stderr);
  const planPath = path.join(projectRoot, '.ngautopilot', 'migration-plan.json');
  const stored = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  assert.equal(stored.executionBoundary.shell, 'forbidden');
  assert.equal(stored.evidence.angular.major, 12);
  assert.deepEqual(sourceState(projectRoot), before);
});

test('migrador is the setup alias and dry-run never writes', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const alias = run(projectRoot, 'migrador', '--from', '12', '--to', '22', '--agent', 'codex', '--yes', '--dry-run', '--json');
  assert.equal(alias.status, 0, alias.stderr);
  const output = JSON.parse(alias.stdout);
  assert.equal(output.status, 'dry-run');
  assert.equal(output.plan.route.hops.length, 10);
  assert.equal(fs.existsSync(path.join(projectRoot, '.ngautopilot', 'migration-plan.json')), false);
});

test('rejects contradictory and non-ascending migration routes', (t) => {
  const projectRoot = createAngularProject(t, '12.2.17');
  const contradictory = run(projectRoot, 'migrate', 'setup', '--from', '15', '--to', '22', '--agent', 'codex');
  assert.equal(contradictory.status, 1);
  assert.match(contradictory.stderr, /contradicts detected/);
  const nonAscending = run(projectRoot, 'migrate', 'setup', '--from', '12', '--to', '12', '--agent', 'codex');
  assert.equal(nonAscending.status, 1);
  assert.match(nonAscending.stderr, /ascending/);
});

function createAngularProject(t, version) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-migration-setup-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), `${JSON.stringify({ private: true, dependencies: { '@angular/core': `^${version}`, '@angular/common': `^${version}` } }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, 'package-lock.json'), `${JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/@angular/core': { version } } }, null, 2)}\n`);
  return root;
}

function sourceState(root) {
  return ['package.json', 'package-lock.json'].map((name) => fs.readFileSync(path.join(root, name), 'utf8'));
}

function run(cwd, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}
