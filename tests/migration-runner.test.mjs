import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'ngautopilot.mjs');

test('run requires approval and writes no run state', (t) => {
  const project = projectFixture(t);
  const setup = run(project, 'migrate', 'setup', '--from', '12', '--to', '14', '--agent', 'codex', '--yes');
  assert.equal(setup.status, 0, setup.stderr);
  fs.rmSync(path.join(project, '.ngautopilot', 'migration-run.json'), { force: true });
  const result = run(project, 'migrate', 'run', '--plan', '.ngautopilot/migration-plan.json', '--agent', 'codex', '--json');
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, 'approval-required');
  assert.equal(fs.existsSync(path.join(project, '.ngautopilot', 'migration-run.json')), false);
});

test('run checkpoints exactly one hop and blocks before source mutation', (t) => {
  const project = projectFixture(t);
  run(project, 'migrate', 'setup', '--from', '12', '--to', '14', '--agent', 'codex', '--yes');
  const before = sourceState(project);
  const result = run(project, 'migrate', 'run', '--plan', '.ngautopilot/migration-plan.json', '--agent', 'codex', '--yes', '--json');
  const output = JSON.parse(result.stdout);
  assert.equal(result.status, 1);
  assert.equal(output.status, 'blocked');
  assert.equal(output.run.selectedHop.id, '12-to-13');
  assert.equal(output.run.phaseStatuses.execution, 'awaiting-executor');
  assert.deepEqual(sourceState(project), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(project, '.ngautopilot/migration-run.json'))).runId, output.run.runId);
});

test('tampered plan, pack, evidence, and resume mismatch fail closed', (t) => {
  const project = projectFixture(t);
  run(project, 'migrate', 'setup', '--from', '12', '--to', '14', '--agent', 'codex', '--yes');
  const plan = path.join(project, '.ngautopilot/migration-plan.json');
  const original = fs.readFileSync(plan, 'utf8');
  fs.writeFileSync(plan, original.replace('"agent": "codex"', '"agent": "other"'));
  let result = run(project, 'migrate', 'run', '--plan', plan, '--agent', 'codex', '--yes', '--json');
  assert.equal(result.status, 1);
  assert.match(JSON.parse(result.stdout).reason.code, /agent|hash|evidence/);
  fs.writeFileSync(plan, original);
  const packageFile = path.join(project, 'package.json');
  const packageText = fs.readFileSync(packageFile, 'utf8');
  fs.appendFileSync(packageFile, ' ');
  result = run(project, 'migrate', 'run', '--plan', plan, '--agent', 'codex', '--yes', '--json');
  assert.equal(JSON.parse(result.stdout).reason.code, 'package_evidence_stale');
  fs.writeFileSync(packageFile, packageText);
  const planJson = JSON.parse(original);
  planJson.route.hops[0].pack.contentHash = '0'.repeat(64);
  fs.writeFileSync(plan, JSON.stringify(planJson));
  result = run(project, 'migrate', 'run', '--plan', plan, '--agent', 'codex', '--yes', '--json');
  assert.equal(JSON.parse(result.stdout).reason.code, 'pack_tampered');
  fs.writeFileSync(plan, original);
  run(project, 'migrate', 'run', '--plan', plan, '--agent', 'codex', '--yes', '--json');
  const runState = JSON.parse(fs.readFileSync(path.join(project, '.ngautopilot/migration-run.json')));
  result = run(project, 'migrate', 'resume', '--run', 'wrong', '--plan', plan, '--agent', 'codex', '--yes', '--json');
  assert.equal(result.status, 1);
  assert.match(JSON.parse(result.stdout).reason.code, /run|hash|tamper/);
  result = run(project, 'migrate', 'resume', '--run', runState.runId, '--plan', plan, '--agent', 'codex', '--yes', '--json');
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).reason.code, 'awaiting-executor');
});

test('rejects a plan whose evidence root escapes the execution project', (t) => {
  const project = projectFixture(t);
  run(project, 'migrate', 'setup', '--from', '12', '--to', '14', '--agent', 'codex', '--yes');
  const plan = path.join(project, '.ngautopilot', 'migration-plan.json');
  const value = JSON.parse(fs.readFileSync(plan, 'utf8'));
  value.projectRoot = path.dirname(project);
  fs.writeFileSync(plan, JSON.stringify(value));
  const result = run(project, 'migrate', 'run', '--plan', plan, '--agent', 'codex', '--yes', '--json');
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).reason.code, 'project_mismatch');
  assert.equal(fs.existsSync(path.join(project, '.ngautopilot', 'migration-run.json')), false);
});

function projectFixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-run-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ private: true, dependencies: { '@angular/core': '^12.2.17', '@angular/common': '^12.2.17' } }));
  fs.writeFileSync(path.join(dir, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/@angular/core': { version: '12.2.17' } } }));
  return dir;
}
function sourceState(dir) { return ['package.json', 'package-lock.json'].map((file) => fs.readFileSync(path.join(dir, file), 'utf8')); }
function run(cwd, ...args) { return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' }); }
