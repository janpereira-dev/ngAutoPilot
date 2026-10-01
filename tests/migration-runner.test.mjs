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

test('setup, run, and resume use the same ancestor package root', (t) => {
  const project = projectFixture(t);
  const nested = path.join(project, 'src', 'feature');
  fs.mkdirSync(nested, { recursive: true });
  const setup = run(nested, 'migrate', 'setup', '--from', '12', '--to', '14', '--agent', 'codex', '--yes', '--json');
  assert.equal(setup.status, 0, setup.stderr);
  const planPath = path.join(project, '.ngautopilot', 'migration-plan.json');
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  assert.deepEqual(plan.executionBoundary.supportedCheckpointCommands, ['migrate run', 'migrate resume']);
  assert.deepEqual(plan.executionBoundary.unsupportedCommands, []);
  assert.equal(plan.executionBoundary.sourceTransformExecutor, 'unavailable');
  for (const explicitPlan of [[], ['--plan', planPath]]) {
    fs.rmSync(path.join(project, '.ngautopilot', 'migration-run.json'), { force: true });
    const result = run(nested, 'migrate', 'run', ...explicitPlan, '--agent', 'codex', '--yes', '--json');
    assert.equal(result.status, 1, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.reason.code, 'awaiting-executor');
    const resume = run(nested, 'migrate', 'resume', '--run', output.run.runId, ...explicitPlan, '--agent', 'codex', '--yes', '--json');
    assert.equal(resume.status, 1, resume.stderr);
    assert.equal(JSON.parse(resume.stdout).reason.code, 'awaiting-executor');
  }
  assert.equal(fs.existsSync(path.join(nested, '.ngautopilot')), false);
});

test('workspace checkpoints verify the owning root lockfile and reject forged ownership', (t) => {
  const workspace = projectFixture(t);
  fs.writeFileSync(path.join(workspace, 'package.json'), JSON.stringify({ private: true, workspaces: ['packages/*'] }));
  const project = path.join(workspace, 'packages', 'app');
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ dependencies: { '@angular/core': '^12.1.0' } }));
  fs.writeFileSync(path.join(workspace, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3,
    packages: { 'packages/app': {}, 'node_modules/@angular/core': { version: '12.2.17' } } }));
  const setup = run(project, 'migrate', 'setup', '--from', '12', '--to', '14', '--agent', 'codex', '--yes', '--json');
  assert.equal(setup.status, 0, setup.stderr);
  const planPath = path.join(project, '.ngautopilot', 'migration-plan.json');
  const original = fs.readFileSync(planPath, 'utf8');
  const plan = JSON.parse(original);
  assert.equal(plan.evidence.lockfile.workspaceRoot, workspace);
  assert.equal(plan.evidence.workspacePackageJson.path, path.join(workspace, 'package.json'));
  const result = run(project, 'migrate', 'run', '--agent', 'codex', '--yes', '--json');
  assert.equal(JSON.parse(result.stdout).reason.code, 'awaiting-executor');
  fs.rmSync(path.join(project, '.ngautopilot', 'migration-run.json'));
  plan.evidence.lockfile.workspaceRoot = path.dirname(workspace);
  fs.writeFileSync(planPath, JSON.stringify(plan));
  const forged = run(project, 'migrate', 'run', '--agent', 'codex', '--yes', '--json');
  assert.equal(JSON.parse(forged.stdout).reason.code, 'lockfile_evidence_path_unsafe');
  fs.writeFileSync(planPath, original);
  fs.appendFileSync(path.join(workspace, 'package.json'), ' ');
  const stale = run(project, 'migrate', 'run', '--agent', 'codex', '--yes', '--json');
  assert.equal(JSON.parse(stale.stdout).reason.code, 'workspace_evidence_stale');
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
