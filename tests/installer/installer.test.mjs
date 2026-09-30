import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildPlan } from '../../adapters/_shared/planner.mjs';
import { applyPlan, verifyInstall, uninstall, backup, restore, loadManifest } from '../../adapters/_shared/installer.mjs';
import { listAdapters } from '../../adapters/_shared/adapter-core.mjs';
import { sha256 } from '../../adapters/_shared/safe-fs.mjs';

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
test('installation metadata uses the tool version, not the receiving application version', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(workdir, 'package.json'), JSON.stringify({ version: '99.0.0' }));
  const cwd = process.cwd();
  try {
    process.chdir(workdir);
    assert.equal(applyPlan(planFor(workdir)).ok, true);
    const expected = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8')).version;
    assert.equal(loadManifest(workdir).ngautopilotVersion, expected);
  } finally {
    process.chdir(cwd);
  }
});
test('install preserves the supporting Jest/RxJS reference and tracks it through pack removal', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planForPack(workdir, 'ngautopilot-angular-testing');
  const reference = plan.files.find(file => file.path.endsWith('/references/rxjs-search-contract.md'));
  assert.ok(reference, 'the plan must include supporting resources, not only entrypoints');
  assert.equal(applyPlan(plan).ok, true);
  assert.deepEqual(fs.readFileSync(path.join(workdir, reference.path)), fs.readFileSync(reference.source));
  assert.equal(verifyInstall(plan).ok, true);
  fs.appendFileSync(path.join(workdir, reference.path), '\nLocal reference note\n');
  assert.equal(applyPlan(planFor(workdir)).ok, false);
  assert.ok(loadManifest(workdir).files.some(file => file.path === reference.path));
});
test('install planning excludes private and VCS skill resources while preserving public examples', (t) => {
  const sourceRoot = makeWorkdir();
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  fs.cpSync(path.join(REPO, 'adapters'), path.join(sourceRoot, 'adapters'), { recursive: true });
  const directory = path.join(sourceRoot, 'skills/_core/example');
  fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(path.join(sourceRoot, 'packs'));
  fs.writeFileSync(path.join(directory, 'SKILL.md'), '# Public skill\n');
  fs.writeFileSync(path.join(sourceRoot, 'catalog.json'), JSON.stringify({ skills: [{ id: '_core.example', path: 'skills/_core/example/SKILL.md' }] }));
  fs.writeFileSync(path.join(sourceRoot, 'packs/ngautopilot-core.json'), JSON.stringify({ id: 'ngautopilot-core', includes: { skills: ['_core.'] } }));
  for (const relative of ['.env.local', '.npmrc', '.git/config', 'references/capture.private.json', 'raw-prompts/private.md', '.cache/private.json']) {
    fs.mkdirSync(path.dirname(path.join(directory, relative)), { recursive: true });
    fs.writeFileSync(path.join(directory, relative), 'PRIVATE_LOCAL_DATA');
  }
  fs.writeFileSync(path.join(directory, '.env.example'), 'PUBLIC_FIXTURE');
  const plan = buildPlan({ sourceRoot, adaptersRoot: path.join(sourceRoot, 'adapters'), catalogPath: path.join(sourceRoot, 'catalog.json'), packPath: path.join(sourceRoot, 'packs/ngautopilot-core.json'), agent: 'codex', scope: 'project', cwd: workdir, home: workdir });
  assert.equal(applyPlan(plan).ok, true);
  const manifest = loadManifest(workdir);
  for (const file of manifest.files) assert.equal(fs.readFileSync(path.join(workdir, file.path)).includes(Buffer.from('PRIVATE_LOCAL_DATA')), false, file.path);
  assert.equal(fs.readFileSync(path.join(workdir, '.agents/skills/_core/example/.env.example'), 'utf8'), 'PUBLIC_FIXTURE');
});

test('binary resources survive install, conflict checks, backup and restore byte-for-byte', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const sourceRoot = path.join(workdir, 'source');
  const installRoot = path.join(workdir, 'install');
  fs.mkdirSync(sourceRoot);
  const bytes = Buffer.from([0, 255, 128, 13, 10, 254, 1]);
  const source = path.join(sourceRoot, 'asset.bin');
  fs.writeFileSync(source, bytes);
  const plan = { sourceRoot, installRoot, agent: 'generic', scope: 'project', pack: 'ngautopilot-core', files: [{ path: 'skills/example/assets/asset.bin', source, action: 'create' }], warnings: [] };
  assert.equal(applyPlan(plan).ok, true);
  const target = path.join(installRoot, plan.files[0].path);
  assert.deepEqual(fs.readFileSync(target), bytes);
  assert.equal(verifyInstall(plan).ok, true);
  assert.equal(applyPlan(plan).skipped, 1);
  const edited = Buffer.from([0, 255, 127, 254, 13, 10, 2]);
  fs.writeFileSync(target, edited);
  assert.equal(applyPlan(plan, { dryRun: true }).ok, false);
  assert.equal(applyPlan(plan).ok, false);
  const saved = backup(plan, { backupDir: path.join(workdir, 'backups') });
  assert.equal(applyPlan(plan, { force: true }).ok, true);
  assert.deepEqual(fs.readFileSync(target), bytes);
  assert.equal(restore(saved, installRoot).ok, true);
  assert.deepEqual(fs.readFileSync(target), edited);
  assert.equal(uninstall(plan).ok, false);
});
test('pack removal preserves malformed bounded instructions even with force', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planFor(workdir);
  assert.equal(applyPlan(plan).ok, true);
  const broken = '<!-- ngautopilot:instructions:start -->\nUser edited section without closing marker\n';
  fs.writeFileSync(path.join(workdir, 'AGENTS.md'), broken);
  const withoutInstructions = { ...plan, files: plan.files.filter(file => !file.managedSection) };
  for (const dryRun of [true, false]) {
    const result = applyPlan(withoutInstructions, { dryRun, force: true });
    assert.equal(result.ok, false);
    assert.match(result.warnings.join('\n'), /invalid managed instructions/);
    assert.equal(fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8'), broken);
  }
  assert.ok(loadManifest(workdir).files.some(file => file.path === 'AGENTS.md'));
});

test('planner resolves core pack and emits only _core skills', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  assert.equal(plan.agent, 'codex');
  assert.equal(plan.scope, 'project');
  assert.equal(plan.pack, 'ngautopilot-core');
  assert.ok(plan.files.length > 0, 'plan must have files');
  const skillFiles = plan.files.filter((f) => f.path.startsWith('.agents/skills/'));
  assert.ok(skillFiles.length > 0, 'plan must include skill files');
  assert.ok(skillFiles.every((f) => f.path.includes('_core')), 'core pack must only include _core skills');
  assert.equal(plan.installRoot, workdir);
  assert.ok(plan.files.some((file) => file.path === 'AGENTS.md'), 'Codex project instructions belong at the project root');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('planner includes transitive pack dependencies', () => {
  const workdir = makeWorkdir();
  const plan = planForPack(workdir, 'ngautopilot-angular-microfrontends');
  const skillFiles = plan.files.filter((file) => file.path.startsWith('.agents/skills/'));

  assert.ok(skillFiles.some((file) => file.path.startsWith('.agents/skills/_core/')));
  assert.ok(skillFiles.some((file) => file.path.includes('.agents/skills/angular/microfrontends/')));
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('every pack resolves to at least one skill', () => {
  const workdir = makeWorkdir();
  const packIds = fs.readdirSync(path.join(REPO, 'packs'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.basename(file, '.json'));

  for (const packId of packIds) {
    const plan = planForPack(workdir, packId);
    assert.ok(plan.files.some((file) => file.path.startsWith('.agents/skills/')), `${packId} must include skills`);
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

test('core -> full -> core preserves modified shared skills and original ownership checksums', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const core = planFor(workdir);
  const full = planForPack(workdir, 'ngautopilot-full');
  applyPlan(core);
  const file = core.files.find((entry) => entry.source && !entry.managedSection);
  const owned = loadManifest(core.installRoot).files.find((entry) => entry.path === file.path);
  const target = path.join(core.installRoot, file.path);
  const edited = fs.readFileSync(target, 'utf8') + '\nLocal customization\n';
  fs.writeFileSync(target, edited);
  for (const plan of [full, core, core]) {
    const result = applyPlan(plan);
    assert.equal(result.ok, false);
    assert.ok(result.warnings.some((warning) => warning.includes(`user-modified file: ${file.path}`)));
    assert.equal(fs.readFileSync(target, 'utf8'), edited);
    assert.equal(loadManifest(plan.installRoot).files.find((entry) => entry.path === file.path).checksum, owned.checksum);
    assert.ok(verifyInstall(plan).hashMismatches.includes(file.path));
  }
});
test('full-to-core conflict preflight leaves every full-only file and the original manifest untouched', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const full = planForPack(workdir, 'ngautopilot-full');
  const core = planFor(workdir);
  assert.equal(applyPlan(full).ok, true);
  const shared = core.files.find(file => !file.managedSection);
  fs.appendFileSync(path.join(workdir, shared.path), '\nUser shared edit\n');
  const manifest = fs.readFileSync(path.join(workdir, '.ngautopilot-manifest.json'));
  const before = new Map(full.files.map(file => [file.path, fs.readFileSync(path.join(workdir, file.path))]));
  for (const dryRun of [true, false]) {
    const result = applyPlan(core, { dryRun });
    assert.equal(result.ok, false);
    if (!dryRun) assert.equal(result.removed, 0);
    assert.deepEqual(fs.readFileSync(path.join(workdir, '.ngautopilot-manifest.json')), manifest);
    for (const [relative, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(workdir, relative)), bytes);
  }
});
test('pack preflight rejects desired, removed and manifest leaf symlinks before any mutation', (t) => {
  for (const leaf of ['desired', 'removed', 'instructions', 'manifest']) {
    const workdir = makeWorkdir();
    const outside = makeWorkdir();
    t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
    t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
    const full = planForPack(workdir, 'ngautopilot-full');
    const core = planFor(workdir);
    assert.equal(applyPlan(full).ok, true);
    const desired = new Set(core.files.map(file => file.path));
    const relative = leaf === 'manifest' ? '.ngautopilot-manifest.json'
      : leaf === 'instructions' ? 'AGENTS.md'
        : leaf === 'desired' ? core.files.find(file => !file.managedSection).path
          : full.files.find(file => !desired.has(file.path)).path;
    const target = path.join(workdir, relative);
    const external = path.join(outside, 'external.md');
    fs.writeFileSync(external, 'External user bytes\n');
    fs.unlinkSync(target);
    fs.symlinkSync(process.platform === 'win32' ? outside : external, target, process.platform === 'win32' ? 'junction' : 'file');
    const before = new Map([...full.files.map(file => file.path), '.ngautopilot-manifest.json']
      .filter(file => file !== relative).map(file => [file, fs.readFileSync(path.join(workdir, file))]));
    for (const dryRun of [true, false]) for (const force of [false, true]) {
      assert.throws(() => applyPlan(core, { dryRun, force }), /symlink_destination/);
      assert.ok(fs.lstatSync(target).isSymbolicLink());
      assert.equal(fs.readFileSync(external, 'utf8'), 'External user bytes\n');
      for (const [file, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(workdir, file)), bytes);
    }
  }
});

test('pack preflight rejects contained and dangling leaf symlinks rather than treating them as missing', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planFor(workdir);
  assert.equal(applyPlan(plan).ok, true);
  const target = path.join(workdir, plan.files.find(file => !file.managedSection).path);
  const internal = path.join(workdir, 'internal');
  fs.mkdirSync(internal);
  const externalFile = path.join(internal, 'bytes.md');
  fs.writeFileSync(externalFile, 'User bytes\n');
  fs.unlinkSync(target);
  fs.symlinkSync(process.platform === 'win32' ? internal : externalFile, target, process.platform === 'win32' ? 'junction' : 'file');
  const manifest = fs.readFileSync(path.join(workdir, '.ngautopilot-manifest.json'));
  for (const dangling of [false, true]) {
    if (dangling) {
      fs.unlinkSync(externalFile);
      fs.rmdirSync(internal);
    }
    for (const dryRun of [true, false]) for (const force of [false, true]) {
      assert.throws(() => applyPlan(plan, { dryRun, force }), /symlink_destination/);
      assert.deepEqual(fs.readFileSync(path.join(workdir, '.ngautopilot-manifest.json')), manifest);
      assert.ok(fs.lstatSync(target).isSymbolicLink());
    }
  }
});

test('preflight rejects dangling destination parents before modifying the manifest or instructions', (t) => {
  const workdir = makeWorkdir();
  const outside = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.symlinkSync(outside, path.join(workdir, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  fs.rmdirSync(outside);
  fs.writeFileSync(path.join(workdir, 'AGENTS.md'), 'User instructions\n');
  const plan = planFor(workdir);
  for (const dryRun of [true, false]) for (const force of [false, true]) {
    assert.throws(() => applyPlan(plan, { dryRun, force }), /symlink_parent/);
    assert.equal(fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8'), 'User instructions\n');
    assert.equal(fs.existsSync(path.join(workdir, '.ngautopilot-manifest.json')), false);
  }
});

test('missing replacement source fails before removing any previously owned file', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planFor(workdir);
  applyPlan(plan);
  const manifest = fs.readFileSync(path.join(workdir, '.ngautopilot-manifest.json'));
  const before = new Map(plan.files.map(file => [file.path, fs.readFileSync(path.join(workdir, file.path))]));
  const replacement = { ...plan, files: [{ path: 'new/SKILL.md', source: path.join(REPO, 'skills/missing/SKILL.md'), action: 'create' }] };
  assert.throws(() => applyPlan(replacement));
  assert.deepEqual(fs.readFileSync(path.join(workdir, '.ngautopilot-manifest.json')), manifest);
  for (const [relative, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(workdir, relative)), bytes);
});

test('pack downgrade retains modified excluded skills in the manifest for safe retry/uninstall', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const full = planForPack(workdir, 'ngautopilot-full');
  const core = planFor(workdir);
  applyPlan(full);
  const corePaths = new Set(core.files.map((file) => file.path));
  const file = full.files.find((entry) => entry.source && !corePaths.has(entry.path));
  const target = path.join(full.installRoot, file.path);
  const edited = 'Local customization\n';
  fs.writeFileSync(target, edited);
  const result = applyPlan(core);
  assert.equal(result.ok, false);
  assert.equal(fs.readFileSync(target, 'utf8'), edited);
  assert.ok(loadManifest(core.installRoot).files.some((entry) => entry.path === file.path));
  assert.ok(uninstall(core).refused.some((entry) => entry.path === file.path));
});

test('dry-run reports the same shared-file conflict without changing file or manifest bytes', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const core = planFor(workdir);
  applyPlan(core);
  const file = core.files.find((entry) => entry.source && !entry.managedSection);
  const target = path.join(core.installRoot, file.path);
  fs.writeFileSync(target, 'User content\n');
  const manifestPath = path.join(core.installRoot, '.ngautopilot-manifest.json');
  const before = fs.readFileSync(manifestPath);
  const result = applyPlan(planForPack(workdir, 'ngautopilot-full'), { dryRun: true });
  assert.equal(result.ok, false);
  assert.ok(result.warnings.some((warning) => warning.includes(`user-modified file: ${file.path}`)));
  assert.deepEqual(fs.readFileSync(manifestPath), before);
  assert.equal(fs.readFileSync(target, 'utf8'), 'User content\n');
});

test('modified managed instruction section is preserved while unrelated user prose survives force', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planFor(workdir);
  applyPlan(plan);
  const target = path.join(plan.installRoot, 'AGENTS.md');
  const customized = 'User preface\n' + fs.readFileSync(target, 'utf8').replace('<!-- ngautopilot:instructions:end -->', 'Local section edit\n<!-- ngautopilot:instructions:end -->') + '\nUser footer\n';
  fs.writeFileSync(target, customized);
  for (const dryRun of [true, false]) {
    const result = applyPlan(plan, { dryRun });
    assert.equal(result.ok, false);
    assert.ok(result.warnings.some((warning) => warning.includes('user-modified instruction section')));
    assert.equal(fs.readFileSync(target, 'utf8'), customized);
  }
  const snapshot = backup(plan, { backupDir: path.join(workdir, '.backups') });
  const forced = applyPlan(plan, { force: true });
  assert.equal(forced.ok, true);
  assert.match(fs.readFileSync(target, 'utf8'), /User preface/);
  assert.match(fs.readFileSync(target, 'utf8'), /User footer/);
  assert.doesNotMatch(fs.readFileSync(target, 'utf8'), /Local section edit/);
  assert.equal(restore(snapshot, plan.installRoot).ok, true);
  assert.equal(fs.readFileSync(target, 'utf8'), customized);
});

test('force replaces modified shared skills only when explicitly requested and backup restores user bytes', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const core = planFor(workdir);
  applyPlan(core);
  const file = core.files.find((entry) => entry.source && !entry.managedSection);
  const target = path.join(core.installRoot, file.path);
  fs.writeFileSync(target, 'User customization\n');
  const snapshot = backup(core, { backupDir: path.join(workdir, '.backups') });
  const result = applyPlan(planForPack(workdir, 'ngautopilot-full'), { force: true });
  assert.equal(result.ok, true);
  assert.notEqual(fs.readFileSync(target, 'utf8'), 'User customization\n');
  assert.equal(restore(snapshot, core.installRoot).ok, true);
  assert.equal(fs.readFileSync(target, 'utf8'), 'User customization\n');
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

test('real CLI update honors an explicit pack and otherwise retains the recorded pack', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  assert.equal(applyPlan(planFor(workdir)).ok, true);
  const run = (...args) => {
    const result = spawnSync(process.execPath, [path.join(REPO, 'bin/ngautopilot.mjs'), 'update', '--agent', 'codex', '--json', ...args], { cwd: workdir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  assert.equal(run('--pack', 'ngautopilot-full', '--dry-run').pack, 'ngautopilot-full');
  assert.equal(loadManifest(workdir).pack, 'ngautopilot-core');
  assert.equal(run('--pack', 'ngautopilot-full').pack, 'ngautopilot-full');
  assert.equal(loadManifest(workdir).pack, 'ngautopilot-full');
  assert.equal(run().pack, 'ngautopilot-full');
  assert.equal(run('--pack', 'ngautopilot-core').pack, 'ngautopilot-core');
  assert.equal(loadManifest(workdir).pack, 'ngautopilot-core');
  assert.equal(verifyInstall(planFor(workdir)).ok, true);
});

test('transition restore removes unchanged post-backup files without orphaning discovered skills', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const core = planFor(workdir);
  const full = planForPack(workdir, 'ngautopilot-full');
  applyPlan(core);
  const saved = backup(core, { backupDir: path.join(workdir, '.backups') });
  const paths = new Set(core.files.map(file => file.path));
  const extras = full.files.filter(file => !paths.has(file.path));
  assert.ok(extras.length);
  assert.equal(applyPlan(full, { force: true }).ok, true);
  const result = restore(saved, workdir);
  assert.equal(result.ok, true, result.warnings.join('\n'));
  assert.equal(result.removedFiles, extras.length);
  assert.equal(loadManifest(workdir).pack, 'ngautopilot-core');
  for (const file of extras) assert.equal(fs.existsSync(path.join(workdir, file.path)), false, file.path);
  assert.equal(verifyInstall(core).ok, true);
});

test('transition restore refuses edited post-backup files before changing any bytes or manifest', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const core = planFor(workdir);
  const full = planForPack(workdir, 'ngautopilot-full');
  applyPlan(core);
  const saved = backup(core, { backupDir: path.join(workdir, '.backups') });
  applyPlan(full);
  const paths = new Set(core.files.map(file => file.path));
  const extra = full.files.find(file => !paths.has(file.path));
  fs.appendFileSync(path.join(workdir, extra.path), '\nUser post-backup edit\n');
  const before = new Map([...full.files.map(file => file.path), '.ngautopilot-manifest.json'].map(file => [file, fs.readFileSync(path.join(workdir, file))]));
  const result = restore(saved, workdir);
  assert.equal(result.ok, false);
  assert.equal(result.restoredFiles, 0);
  assert.match(result.warnings.join('\n'), /user-modified/);
  for (const [file, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(workdir, file)), bytes);
});

test('restore preflights missing snapshot files and edited destinations without any partial write', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planFor(workdir);
  applyPlan(plan);
  const saved = backup(plan, { backupDir: path.join(workdir, '.backups') });
  const file = plan.files.find(entry => !entry.managedSection);
  fs.appendFileSync(path.join(workdir, file.path), '\nUser later edit\n');
  const before = new Map([...plan.files.map(entry => entry.path), '.ngautopilot-manifest.json'].map(relative => [relative, fs.readFileSync(path.join(workdir, relative))]));
  const edited = restore(saved, workdir);
  assert.equal(edited.ok, false);
  assert.equal(edited.restoredFiles, 0);
  for (const [relative, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(workdir, relative)), bytes);
  fs.unlinkSync(path.join(saved.backupPath, file.path));
  const missing = restore(saved, workdir);
  assert.equal(missing.ok, false);
  assert.match(missing.warnings.join('\n'), /backup file missing/);
  for (const [relative, bytes] of before) assert.deepEqual(fs.readFileSync(path.join(workdir, relative)), bytes);
});

test('restore preserves post-backup user prose outside the managed instruction section', (t) => {
  const workdir = makeWorkdir();
  t.after(() => fs.rmSync(workdir, { recursive: true, force: true }));
  const plan = planFor(workdir);
  applyPlan(plan);
  const saved = backup(plan, { backupDir: path.join(workdir, '.backups') });
  fs.appendFileSync(path.join(workdir, 'AGENTS.md'), '\nUser post-backup footer\n');
  assert.equal(restore(saved, workdir).ok, true);
  assert.match(fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8'), /User post-backup footer/);
  assert.equal(verifyInstall(plan).ok, true);
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
  assert.equal(fs.existsSync(path.join(plan.installRoot, '.agents')), false, 'dry-run must not write discoverable Codex paths');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('planner refuses scope not declared by adapter', () => {
  const workdir = makeWorkdir();
  assert.throws(() => planFor(workdir, 'copilot', 'user'), /does not support scope "user"/);
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('Codex user scope keeps skills and instructions in their separate discovery roots', () => {
  const home = makeWorkdir();
  const plan = planFor(home, 'codex', 'user');

  assert.equal(plan.installRoot, home);
  assert.ok(plan.files.some((file) => file.path.startsWith('.agents/skills/')));
  assert.ok(plan.files.some((file) => file.path === '.codex/AGENTS.md'));

  const result = applyPlan(plan);
  assert.ok(result.ok);
  assert.ok(fs.existsSync(path.join(home, '.agents', 'skills')));
  assert.ok(fs.existsSync(path.join(home, '.codex', 'AGENTS.md')));
  assert.ok(verifyInstall(plan).ok);
  fs.rmSync(home, { recursive: true, force: true });
});

test('Codex project scope writes discoverable files at the Git root when run from a subdirectory', () => {
  const repository = makeWorkdir();
  const nestedDirectory = path.join(repository, 'packages', 'app');
  fs.mkdirSync(path.join(repository, '.git'));
  fs.mkdirSync(nestedDirectory, { recursive: true });

  const plan = planFor(nestedDirectory);
  assert.equal(plan.installRoot, repository);
  applyPlan(plan);
  assert.ok(fs.existsSync(path.join(repository, '.agents', 'skills')));
  assert.ok(fs.existsSync(path.join(repository, 'AGENTS.md')));
  assert.equal(fs.existsSync(path.join(nestedDirectory, 'AGENTS.md')), false);
  fs.rmSync(repository, { recursive: true, force: true });
});

test('Codex project install rejects a symlinked .agents parent without writing outside the project', () => {
  const workdir = makeWorkdir();
  const outside = makeWorkdir();
  fs.symlinkSync(outside, path.join(workdir, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');

  assert.throws(() => applyPlan(planFor(workdir)), /symlink_parent/);
  assert.equal(fs.existsSync(path.join(outside, 'skills')), false, 'installer must not follow the symlinked parent');

  fs.rmSync(workdir, { recursive: true, force: true });
  fs.rmSync(outside, { recursive: true, force: true });
});

test('Codex merges a bounded managed section into an existing AGENTS.md and preserves user content', () => {
  const workdir = makeWorkdir();
  fs.writeFileSync(path.join(workdir, 'AGENTS.md'), 'User-owned project instructions\n', 'utf8');
  const plan = planFor(workdir);

  const installed = applyPlan(plan);
  assert.ok(installed.ok, installed.warnings.join('\n'));
  const afterInstall = fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8');
  assert.match(afterInstall, /^User-owned project instructions/m);
  assert.match(afterInstall, /<!-- ngautopilot:instructions:start -->/);
  assert.ok(verifyInstall(plan).ok, 'managed section checksum must verify independently of user content');

  const rerun = applyPlan(plan);
  assert.ok(rerun.ok, rerun.warnings.join('\n'));
  assert.equal(fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8'), afterInstall, 'managed section install must be idempotent');

  const removed = uninstall(plan);
  assert.ok(removed.ok, JSON.stringify(removed.refused));
  assert.equal(fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8').trim(), 'User-owned project instructions');
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('Codex refuses malformed managed instruction markers without overwriting AGENTS.md', () => {
  const workdir = makeWorkdir();
  const malformed = 'User instructions\n<!-- ngautopilot:instructions:start -->\n';
  fs.writeFileSync(path.join(workdir, 'AGENTS.md'), malformed, 'utf8');

  const result = applyPlan(planFor(workdir));
  assert.equal(result.ok, false);
  assert.match(result.warnings.join('\n'), /managed_section_invalid/);
  assert.equal(fs.readFileSync(path.join(workdir, 'AGENTS.md'), 'utf8'), malformed);
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('Codex migrates a legacy .codex manifest and backs it up from its original root', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  const skill = plan.files.find((file) => file.path.startsWith('.agents/skills/'));
  assert.ok(skill, 'Codex plan must include a discoverable skill');
  const legacyRoot = path.join(workdir, '.codex');
  const legacyPath = path.join('skills', skill.path.slice('.agents/skills/'.length));
  const legacyContent = fs.readFileSync(skill.source, 'utf8');
  fs.mkdirSync(path.dirname(path.join(legacyRoot, legacyPath)), { recursive: true });
  fs.writeFileSync(path.join(legacyRoot, legacyPath), legacyContent, 'utf8');
  fs.writeFileSync(path.join(legacyRoot, '.ngautopilot-manifest.json'), JSON.stringify({
    version: 1,
    installationId: 'legacy-installation',
    agent: 'codex',
    scope: 'project',
    pack: 'ngautopilot-core',
    createdAt: '2026-01-01T00:00:00.000Z',
    files: [{ path: legacyPath, checksum: sha256(legacyContent), owner: 'ngautopilot' }],
  }), 'utf8');

  const backupResult = backup({ installRoot: workdir, agent: 'codex', scope: 'project', files: [] }, { backupDir: path.join(workdir, '.backups') });
  assert.ok(backupResult.backedUp.includes(legacyPath), 'backup must read legacy files from .codex');

  const result = applyPlan(plan);
  assert.ok(result.ok, result.warnings.join('\n'));
  const migrated = loadManifest(workdir);
  assert.equal(migrated.installationId, 'legacy-installation');
  assert.equal(fs.existsSync(path.join(legacyRoot, '.ngautopilot-manifest.json')), false, 'legacy manifest must be removed after a complete migration');
  assert.equal(fs.existsSync(path.join(legacyRoot, legacyPath)), false, 'legacy owned skill must be removed after migration');
  assert.ok(fs.existsSync(path.join(workdir, skill.path)), 'new discoverable destination must be installed');
  assert.ok(verifyInstall(plan).ok);
  fs.rmSync(workdir, { recursive: true, force: true });
});

test('Codex preserves legacy files when an unmanaged destination blocks migration', () => {
  const workdir = makeWorkdir();
  const plan = planFor(workdir);
  const skill = plan.files.find((file) => file.path.startsWith('.agents/skills/'));
  const legacyRoot = path.join(workdir, '.codex');
  const legacyPath = path.join('skills', skill.path.slice('.agents/skills/'.length));
  const legacyContent = fs.readFileSync(skill.source, 'utf8');
  fs.mkdirSync(path.dirname(path.join(legacyRoot, legacyPath)), { recursive: true });
  fs.writeFileSync(path.join(legacyRoot, legacyPath), legacyContent, 'utf8');
  fs.writeFileSync(path.join(legacyRoot, '.ngautopilot-manifest.json'), JSON.stringify({
    version: 1, installationId: 'legacy-conflict', agent: 'codex', scope: 'project', pack: 'ngautopilot-core', files: [{ path: legacyPath, checksum: sha256(legacyContent), owner: 'ngautopilot' }],
  }), 'utf8');
  fs.mkdirSync(path.dirname(path.join(workdir, skill.path)), { recursive: true });
  fs.writeFileSync(path.join(workdir, skill.path), 'User-owned conflicting skill\n', 'utf8');

  const result = applyPlan(plan);
  assert.equal(result.ok, false);
  assert.match(result.warnings.join('\n'), /legacy Codex file was preserved because its new destination was not installed/);
  assert.equal(fs.readFileSync(path.join(workdir, skill.path), 'utf8'), 'User-owned conflicting skill\n');
  assert.equal(fs.existsSync(path.join(legacyRoot, legacyPath)), true, 'legacy file must remain until the destination can be installed');
  assert.equal(fs.existsSync(path.join(legacyRoot, '.ngautopilot-manifest.json')), true, 'legacy manifest must remain for a partial migration');
  fs.rmSync(workdir, { recursive: true, force: true });
});
