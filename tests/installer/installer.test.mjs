import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildPlan } from '../../adapters/_shared/planner.mjs';
import { applyPlan, verifyInstall, uninstall, backup, restore, loadManifest } from '../../adapters/_shared/installer.mjs';
import { listAdapters } from '../../adapters/_shared/adapter-core.mjs';

const REPO = path.resolve(path.join(import.meta.dirname, '..', '..'));

function makeWorkdir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-test-'));
  return dir;
}

function planFor(workdir, agent = 'codex', scope = 'project') {
  return buildPlan({
    catalogPath: path.join(REPO, 'catalog.json'),
    packPath: path.join(REPO, 'packs', 'ngautopilot-core.json'),
    adaptersRoot: path.join(REPO, 'adapters'),
    sourceRoot: REPO,
    agent,
    scope,
    cwd: workdir,
    home: workdir,
  });
}

function planForPack(workdir, packId, agent = 'codex', scope = 'project') {
  return buildPlan({
    catalogPath: path.join(REPO, 'catalog.json'),
    packPath: path.join(REPO, 'packs', `${packId}.json`),
    adaptersRoot: path.join(REPO, 'adapters'),
    sourceRoot: REPO,
    agent,
    scope,
    cwd: workdir,
    home: workdir,
  });
}

test('adapter registry lists 10 adapters', () => {
  const ids = listAdapters(path.join(REPO, 'adapters'));
  assert.equal(ids.length, 10, `expected 10 adapters, got ${ids.length}: ${ids.join(', ')}`);
  for (const id of ['codex', 'claude', 'opencode', 'copilot', 'cursor', 'gemini', 'generic', 'pi', 'hermes', 'openclaw']) {
    assert.ok(ids.includes(id), `missing adapter: ${id}`);
  }
});

test('planner resolves core pack and emits only _core skills', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  assert.equal(plan.agent, 'codex');
  assert.equal(plan.scope, 'project');
  assert.equal(plan.pack, 'ngautopilot-core');
  assert.ok(plan.files.length > 0, 'plan must have files');
  const skillFiles = plan.files.filter((f) => f.path.startsWith('skills/'));
  assert.ok(skillFiles.length > 0, 'plan must include skill files');
  assert.ok(skillFiles.every((f) => f.path.includes('_core')), 'core pack must only include _core skills');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('planner includes transitive pack dependencies', () => {
  const workdir = makeWorkdir();
  const plan = planForPack(workdir, 'ngautopilot-angular-microfrontends');
  const skillFiles = plan.files.filter((file) => file.path.startsWith('skills/'));

  assert.ok(skillFiles.some((file) => file.path.startsWith('skills/_core/')));
  assert.ok(skillFiles.some((file) => file.path.includes('skills/angular/microfrontends/')));
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('every pack resolves to at least one skill', () => {
  const workdir = makeWorkdir();
  const packIds = fs.readdirSync(path.join(REPO, 'packs'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.basename(file, '.json'));

  for (const packId of packIds) {
    const plan = planForPack(workdir, packId);
    assert.ok(plan.files.some((file) => file.path.startsWith('skills/')), `${packId} must include skills`);
  }

  fs.rmSync(workdir, { recursive: true, force: true });
});

test('install is idempotent: re-run creates no extra writes', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  const r1 = applyPlan(plan);
  assert.ok(r1.ok);
  assert.ok(r1.created > 0, 'first run must create files');
  const r2 = applyPlan(plan);
  assert.ok(r2.ok);
  assert.equal(r2.created, 0, 'second run must not create');
  assert.equal(r2.updated, 0, 'second run must not update');
  assert.equal(r2.skipped, plan.files.length, 'second run must skip all');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('switching packs removes prior managed files outside the new plan', () => {
  const workdir = makeWorkdir();
  const foundations = planForPack(workdir, 'ngautopilot-angular-foundations');
  const state = planForPack(workdir, 'ngautopilot-angular-state');
  applyPlan(foundations);

  const foundationOnly = foundations.files.find((file) => file.path.includes('skills/angular/architecture/'));
  assert.ok(foundationOnly, 'foundations pack must include architecture skills');
  assert.equal(fs.existsSync(path.join(foundations.installRoot, foundationOnly.path)), true);

  const result = applyPlan(state);
  assert.ok(result.removed > 0, 'switching packs must remove prior managed files');
  assert.equal(fs.existsSync(path.join(foundations.installRoot, foundationOnly.path)), false);
  assert.ok(verifyInstall(state).ok, 'new pack manifest must verify');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('verifyInstall passes after install', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  applyPlan(plan);
  const v = verifyInstall(plan);
  assert.ok(v.ok, `verify failed: missing=${v.missingFiles} mismatch=${v.hashMismatches}`);
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('uninstall removes managed files and manifest', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  applyPlan(plan);
  const pre = fs.existsSync(path.join(plan.installRoot, '.ngautopilot-manifest.json'));
  assert.ok(pre, 'manifest must exist before uninstall');
  const u = uninstall(plan);
  assert.ok(u.ok, `uninstall refused: ${JSON.stringify(u.refused)}`);
  assert.ok(u.removed.length > 0, 'must have removed files');
  const post = fs.existsSync(path.join(plan.installRoot, '.ngautopilot-manifest.json'));
  assert.equal(post, false, 'manifest must be removed');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('uninstall refuses user-modified files without force', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  applyPlan(plan);
  // Modify one managed file.
  const firstFile = plan.files[0];
  const dest = path.join(plan.installRoot, firstFile.path);
  fs.writeFileSync(dest, '// user edit\n', 'utf8');
  const u = uninstall(plan);
  assert.equal(u.ok, false, 'must refuse when content changed');
  assert.ok(u.refused.length > 0, 'must have refused at least one');
  const uForce = uninstall(plan, { force: true });
  assert.ok(uForce.ok, 'force must succeed');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('backup and restore roundtrip', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  applyPlan(plan);
  const b = backup(plan, { backupDir: path.join(workdir, '.backups') });
  assert.ok(b.ok);
  assert.ok(b.backedUp.length > 0, 'must have backed up files');
  // Corrupt the install: uninstall everything.
  uninstall(plan, { force: true });
  const r = restore({ backupPath: b.backupPath }, plan.installRoot);
  assert.ok(r.ok);
  assert.ok(r.restoredFiles > 0, 'must restore files');
  const postRestore = verifyInstall(plan);
  assert.ok(postRestore.ok, 'verify must pass after restore');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('dry-run writes no files', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  const r = applyPlan(plan, { dryRun: true });
  assert.ok(r.ok);
  const manifestExists = fs.existsSync(path.join(plan.installRoot, '.ngautopilot-manifest.json'));
  assert.equal(manifestExists, false, 'dry-run must not write manifest');
  assert.equal(fs.existsSync(plan.installRoot), false, 'dry-run must not create install root');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('planner refuses scope not declared by adapter', () => {
  const workdir = makeWorkdir();
  assert.throws(() => planFor(workdir, 'copilot', 'user'), /does not support scope "user"/);
  fs.rmSync(workdir, { recursive: true, force: true });
});
