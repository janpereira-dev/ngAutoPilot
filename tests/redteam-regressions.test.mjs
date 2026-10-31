import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { applyPlan, uninstall, backup, restore, verifyInstall, loadManifest } from '../adapters/_shared/installer.mjs';
import { syncNpxSkills, NPX_PUBLIC_SKILL_IDS } from '../lib/npx-skills.mjs';
import { renderPortableSkill } from '../lib/agent-plugins/portable-skill.mjs';
import { createPluginArchives } from '../lib/agent-plugins/archive.mjs';
import { scanCandidateSecurity } from '../skill-lab/lib/candidate-security.mjs';
import { runAgenticGate } from '../skill-lab/lib/agentic-gate.mjs';
import { createRootGuard, safeWriteFile } from '../adapters/_shared/safe-fs.mjs';

const repo = path.resolve(import.meta.dirname, '..');
const put = (file, content) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
const json = (file, value) => put(file, JSON.stringify(value));
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-redteam-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function simplePlan(dir, content = 'PUBLIC_SKILL\n') {
  const sourceRoot = path.join(dir, 'source');
  const source = path.join(sourceRoot, 'skill.md');
  put(source, content);
  return { sourceRoot, installRoot: path.join(dir, 'project'), agent: 'codex', scope: 'project', pack: 'ngautopilot-core', files: [{ path: '.agents/skills/example/SKILL.md', source, action: 'create' }], warnings: [] };
}

test('R1: npx and portable bundles exclude private resources while retaining public bytes', t => {
  const root = fixture(t);
  const sourceDir = path.join(root, 'skills/example');
  const skill = { id: 'example.safe', name: 'Example', path: 'skills/example/SKILL.md', description: 'Synthetic audit fixture', version: '0.11.0' };
  put(path.join(sourceDir, 'SKILL.md'), '---\nid: example.safe\nname: Example\ndescription: Synthetic audit fixture\n---\n\nPublic instructions.\n');
  json(path.join(root, 'catalog.json'), { skills: [skill] });
  json(path.join(root, 'config/npx-skills.json'), { $schemaVersion: '1.0.0', bundles: NPX_PUBLIC_SKILL_IDS.map(id => ({ id, title: id, description: 'Audit fixture', prefixes: ['example.'] })) });
  for (const readme of ['README.md', 'README.es.md']) put(path.join(root, 'agents/ngautopilot', readme), '# Fixture\n');
  const privateNames = ['.env.local', '.npmrc', '.git/config', 'references/customer.private.json', 'references/.Env', '.cache/secret.txt'];
  for (const name of privateNames) put(path.join(sourceDir, name), 'SYNTHETIC_PRIVATE_MARKER');
  put(path.join(sourceDir, '.env.example'), 'PUBLIC_FIXTURE');
  const binary = Buffer.from([0, 255, 128, 13, 10]);
  put(path.join(sourceDir, 'assets/example.bin'), binary);
  syncNpxSkills({ root });
  const portable = path.join(root, 'portable');
  renderPortableSkill({ sourceDir, targetDir: portable, skill });
  for (const target of [portable, ...NPX_PUBLIC_SKILL_IDS.map(id => path.join(root, '.agents/skills', id, 'references/skills/example--safe'))]) {
    for (const name of privateNames) assert.equal(fs.existsSync(path.join(target, name)), false, name);
    assert.equal(fs.readFileSync(path.join(target, '.env.example'), 'utf8'), 'PUBLIC_FIXTURE');
    assert.deepEqual(fs.readFileSync(path.join(target, 'assets/example.bin')), binary);
  }
});

test('R3: altered backup bytes are rejected before changing any destination', t => {
  const dir = fixture(t);
  const plan = simplePlan(dir);
  assert.equal(applyPlan(plan).ok, true);
  const saved = backup(plan, { backupDir: path.join(dir, 'backups') });
  put(path.join(saved.backupPath, plan.files[0].path), 'CORRUPTED_SYNTHETIC_BACKUP\n');
  const result = restore(saved, plan.installRoot);
  assert.equal(result.ok, false);
  assert.equal(result.restoredFiles, 0);
  assert.equal(verifyInstall(plan).ok, true);
});

test('R7: archive output rejects a linked parent before deleting external content', async t => {
  const dir = fixture(t);
  const root = path.join(dir, 'repository');
  const outside = path.join(dir, 'unrelated');
  const sourceRoot = path.join(root, 'agent-plugins');
  fs.mkdirSync(sourceRoot, { recursive: true });
  const sentinel = path.join(outside, 'agent-plugins/keep.txt');
  put(sentinel, 'UNRELATED_SYNTHETIC_FILE');
  fs.symlinkSync(outside, path.join(root, 'dist'), process.platform === 'win32' ? 'junction' : 'dir');
  try {
    await assert.rejects(createPluginArchives({ sourceRoot, outputRoot: path.join(root, 'dist/agent-plugins'), version: '0.11.0' }), /symbolic|symlink|junction/i);
    assert.equal(fs.readFileSync(sentinel, 'utf8'), 'UNRELATED_SYNTHETIC_FILE');
  } finally { fs.unlinkSync(path.join(root, 'dist')); }
});

test('R4: update does not modify the external member of a hardlink', t => {
  const dir = fixture(t);
  const plan = simplePlan(dir, 'OLD_PUBLIC_CONTENT\n');
  assert.equal(applyPlan(plan).ok, true);
  const target = path.join(plan.installRoot, plan.files[0].path);
  const outside = path.join(dir, 'unrelated/original.txt');
  put(outside, fs.readFileSync(target));
  fs.unlinkSync(target);
  fs.linkSync(outside, target);
  put(plan.files[0].source, 'NEW_PUBLIC_CONTENT\n');
  assert.throws(() => safeWriteFile(createRootGuard(plan.installRoot), plan.files[0].path, 'NEW_PUBLIC_CONTENT\n'), /hardlink_destination/);
  for (const opts of [{}, { dryRun: true }, { force: true }]) assert.throws(() => applyPlan(plan, opts), /hardlink_destination/);
  assert.equal(fs.readFileSync(outside, 'utf8'), 'OLD_PUBLIC_CONTENT\n');
  assert.equal(fs.readFileSync(target, 'utf8'), 'OLD_PUBLIC_CONTENT\n');
});

test('R2: uninstall preserves identical files that predate the installation', t => {
  const plan = simplePlan(fixture(t));
  const target = path.join(plan.installRoot, plan.files[0].path);
  put(target, fs.readFileSync(plan.files[0].source));
  assert.equal(applyPlan(plan).ok, true);
  assert.equal(loadManifest(plan.installRoot).files.some(entry => entry.path === plan.files[0].path), false);
  assert.equal(uninstall(plan).ok, true);
  assert.equal(fs.readFileSync(target, 'utf8'), 'PUBLIC_SKILL\n');
});

test('R5: scanner detects Unicode Tags and multiline shell permissions independently', () => {
  const hidden = [...'SYNTHETIC_INSTRUCTION'].map(char => String.fromCodePoint(0xe0000 + char.codePointAt(0))).join('');
  assert.match(scanCandidateSecurity('Public text.' + hidden).join('\n'), /invisible|Unicode/);
  for (const permissions of ['\n  - Read\n  - Bash', '\n- Read\n- Bash', '[Read, Bash]', '>\n  Read\n  Bash', '\n  - Read\n  - "Bash(git:*)"']) {
    assert.match(scanCandidateSecurity(`---\nname: example\nallowed-tools: ${permissions}\n---\nPublic text.`).join('\n'), /broad shell/, permissions);
  }
  assert.deepEqual(scanCandidateSecurity('---\nname: example\nallowed-tools:\n  - Read\n  - Grep\n---\nPublic text.'), []);
});

test('R6: restore CLI requires an explicit destination and approval', t => {
  const dir = fixture(t);
  const plan = simplePlan(dir);
  assert.equal(applyPlan(plan).ok, true);
  const saved = backup(plan, { backupDir: path.join(dir, 'backups') });
  assert.equal(uninstall(plan).ok, true);
  const manifestPath = path.join(saved.backupPath, '.ngautopilot-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath));
  const outside = path.join(dir, 'backup-selected-unrelated-destination');
  json(manifestPath, { ...manifest, installRoot: outside });
  const invoke = args => spawnSync(process.execPath, [path.join(repo, 'bin/ngautopilot.mjs'), 'restore', '--backup', saved.backupPath, '--json', ...args], { cwd: plan.installRoot, encoding: 'utf8' });
  for (const args of [[], ['--yes'], ['--agent', 'codex']]) {
    const result = invoke(args);
    assert.notEqual(result.status, 0);
    assert.equal(fs.existsSync(outside), false);
    assert.equal(fs.existsSync(path.join(plan.installRoot, plan.files[0].path)), false);
  }
  const approved = invoke(['--agent', 'codex', '--yes']);
  assert.equal(approved.status, 0, approved.stderr);
  assert.equal(JSON.parse(approved.stdout).ok, true);
  assert.equal(fs.existsSync(outside), false);
  assert.equal(verifyInstall(plan).ok, true);
});

test('R8: agentic gate refuses missing candidates even when evidence declares success', t => {
  const dir = fixture(t);
  const previousCwd = process.cwd();
  try {
    process.chdir(dir);
    const runRoot = path.join(dir, 'skill-lab/runs/example');
    const candidate = 'skill-lab/runs/example/optimization/candidate.SKILL.md';
    json(path.join(runRoot, 'agentic/codex/evidence.json'), { harness: 'codex', passed: true, candidate, candidateHash: null, regressions: [] });
    const result = runAgenticGate({ runRoot, harness: 'codex' });
    assert.equal(result.passed, false);
    assert.equal(result.status, 'AGENTIC_GATE_FAILED');
  } finally { process.chdir(previousCwd); }
});
