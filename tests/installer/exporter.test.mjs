import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { exportAdapter, loadNativeLayouts } from '../../adapters/_shared/exporter.mjs';
import { sha256 } from '../../adapters/_shared/safe-fs.mjs';
const root = path.resolve(import.meta.dirname, '../..');
// Independent oracle: changes in the registry must not silently change expectations.
const expected = {
  claude: ['.claude/skills', 'CLAUDE.md'], codex: ['.agents/skills', 'AGENTS.md'],
  copilot: ['.github/skills', '.github/copilot-instructions.md'], cursor: ['.cursor/skills', 'AGENTS.md'],
  gemini: ['.gemini/skills', 'GEMINI.md'], generic: ['skills', 'AGENTS.md'],
  hermes: ['.hermes/skills', 'AGENTS.md'], openclaw: ['skills', 'AGENTS.md'],
  opencode: ['.opencode/skills', 'AGENTS.md'], pi: ['.agents/skills', 'AGENTS.md'],
};
function temporary(t) {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-export-test-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  return output;
}
const snapshot = output => JSON.parse(fs.readFileSync(path.join(output, '.ngautopilot-export.json'), 'utf8'));
test('native registry covers exactly ten source-backed adapters', () => {
  const registry = loadNativeLayouts(root);
  assert.deepEqual(Object.keys(registry.adapters).sort(), Object.keys(expected).sort());
  assert.equal(registry.hostInvocation, 'not-verified');
});
for (const [agent, [skillsRoot, instructions]] of Object.entries(expected)) {
  test(`${agent} CLI exports portable skills, instructions, resources, and a checksum record`, (t) => {
    const output = temporary(t);
    const result = JSON.parse(execFileSync(process.execPath, ['bin/ngautopilot.mjs', 'export', '--agent', agent, '--pack', 'ngautopilot-angular-testing', '--output', output, '--json'], { cwd: root, encoding: 'utf8' }));
    assert.equal(result.ok, true);
    const record = snapshot(output);
    assert.equal(record.agent, agent);
    assert.ok(record.files.some(file => file.path === instructions));
    const index = JSON.parse(fs.readFileSync(path.join(output, 'NGAUTOPILOT-CATALOG.json'), 'utf8'));
    assert.equal(index.pack, 'ngautopilot-angular-testing');
    for (const skill of index.skills) assert.ok(fs.existsSync(path.join(output, skill.path)), 'every routed skill path must exist');
    const guidance = fs.readFileSync(path.join(output, instructions), 'utf8');
    const pointer = guidance.match(/index at `([^`]+)`/)[1];
    assert.ok(fs.existsSync(path.resolve(output, path.posix.dirname(instructions), pointer)));
    assert.ok(!guidance.includes('skills/angular/upgrades/'), 'do not route exports through historical source paths');
    const entrypoints = record.files.filter(file => file.path.endsWith('/SKILL.md'));
    assert.ok(entrypoints.length > 10);
    for (const file of entrypoints) {
      assert.ok(file.path.startsWith(`${skillsRoot}/`));
      const name = path.posix.basename(path.posix.dirname(file.path));
      assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.ok(name.length <= 64);
      assert.ok(fs.readFileSync(path.join(output, file.path), 'utf8').includes(`name: ${name}\n`));
    }
    const reference = record.files.find(file => file.path.endsWith('/references/rxjs-search-contract.md'));
    assert.ok(reference, 'supporting files must be exported');
    assert.deepEqual(fs.readFileSync(path.join(output, reference.path)), fs.readFileSync(path.join(root, 'skills/angular/testing/jest-angular-unit-testing/references/rxjs-search-contract.md')));
    for (const file of record.files) assert.equal(sha256(fs.readFileSync(path.join(output, file.path))), file.checksum);
    for (const invalid of ['opencode.json', 'openclaw.json', '.ngautopilot-manifest.json']) assert.equal(fs.existsSync(path.join(output, invalid)), false);
    const before = fs.readFileSync(path.join(output, '.ngautopilot-export.json'));
    assert.equal(exportAdapter({ sourceRoot: root, agent, packId: 'ngautopilot-angular-testing', output }).ok, true);
    assert.deepEqual(fs.readFileSync(path.join(output, '.ngautopilot-export.json')), before);
  });
}
test('export refuses local edits and pack-switch removals without writing content', (t) => {
  const output = temporary(t);
  exportAdapter({ sourceRoot: root, agent: 'codex', packId: 'ngautopilot-angular-testing', output });
  const skill = snapshot(output).files.find(file => file.path.includes('jest-angular-unit-testing/SKILL.md'));
  assert.ok(skill);
  const edited = path.join(output, skill.path);
  fs.appendFileSync(edited, '\nUser edit\n');
  const before = fs.readFileSync(path.join(output, '.ngautopilot-export.json'));
  for (const packId of ['ngautopilot-angular-testing', 'ngautopilot-core']) {
    const result = exportAdapter({ sourceRoot: root, agent: 'codex', packId, output });
    assert.equal(result.ok, false);
    assert.ok(result.warnings.length);
    assert.match(fs.readFileSync(edited, 'utf8'), /User edit/);
    assert.deepEqual(fs.readFileSync(path.join(output, '.ngautopilot-export.json')), before);
  }
});
test('export preserves unmanaged instructions and reports nonzero CLI status', (t) => {
  const output = temporary(t);
  fs.writeFileSync(path.join(output, 'AGENTS.md'), 'User guidance\n');
  const result = spawnSync(process.execPath, ['bin/ngautopilot.mjs', 'export', '--agent', 'codex', '--pack', 'ngautopilot-core', '--output', output, '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).ok, false);
  assert.deepEqual(fs.readdirSync(output), ['AGENTS.md']);
});
test('legacy export entrypoint uses the same ten-adapter engine', (t) => {
  const output = temporary(t);
  const result = JSON.parse(execFileSync(process.execPath, ['scripts/export-adapter.mjs', 'hermes', 'ngautopilot-core', output], { cwd: root, encoding: 'utf8' }));
  assert.equal(result.ok, true);
  assert.ok(fs.existsSync(path.join(output, 'AGENTS.md')));
});
test('export rejects symlinked destination parents without writing outside the snapshot', (t) => {
  const output = temporary(t);
  const outside = temporary(t);
  fs.symlinkSync(outside, path.join(output, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => exportAdapter({ sourceRoot: root, agent: 'codex', packId: 'ngautopilot-core', output }));
  assert.deepEqual(fs.readdirSync(outside), []);
});
test('export rejects a different adapter ownership record instead of adopting it', (t) => {
  const output = temporary(t);
  assert.equal(exportAdapter({ sourceRoot: root, agent: 'codex', packId: 'ngautopilot-core', output }).ok, true);
  const before = fs.readFileSync(path.join(output, '.ngautopilot-export.json'));
  assert.throws(() => exportAdapter({ sourceRoot: root, agent: 'pi', packId: 'ngautopilot-core', output }), /record does not match/);
  assert.deepEqual(fs.readFileSync(path.join(output, '.ngautopilot-export.json')), before);
});
test('external Markdown links cannot export adjacent repository credentials', (t) => {
  const sourceRoot = temporary(t);
  const output = temporary(t);
  fs.cpSync(path.join(root, 'adapters'), path.join(sourceRoot, 'adapters'), { recursive: true });
  fs.mkdirSync(path.join(sourceRoot, 'packs'));
  fs.mkdirSync(path.join(sourceRoot, 'skills/_core/example'), { recursive: true });
  fs.writeFileSync(path.join(sourceRoot, 'skills/_core/example/SKILL.md'), '---\nid: _core.example\nname: Example\ndescription: Test a public source boundary.\nversion: 0.9.0\n---\n\n[Credentials](../../../.env)\n');
  fs.writeFileSync(path.join(sourceRoot, '.env'), 'PRIVATE_CREDENTIAL_DATA');
  fs.writeFileSync(path.join(sourceRoot, 'catalog.json'), JSON.stringify({ skills: [{ id: '_core.example', path: 'skills/_core/example/SKILL.md', version: '0.9.0' }] }));
  fs.writeFileSync(path.join(sourceRoot, 'packs/ngautopilot-core.json'), JSON.stringify({ id: 'ngautopilot-core', includes: { skills: ['_core.'] } }));
  assert.throws(() => exportAdapter({ sourceRoot, agent: 'generic', packId: 'ngautopilot-core', output }), /not public documentation/);
  assert.deepEqual(fs.readdirSync(output), []);
  assert.equal(fs.readFileSync(path.join(sourceRoot, '.env'), 'utf8'), 'PRIVATE_CREDENTIAL_DATA');
});
test('full export bundles external documentation without changing the source catalog', (t) => {
  const output = temporary(t);
  const before = sha256(fs.readFileSync(path.join(root, 'catalog.json')));
  assert.equal(exportAdapter({ sourceRoot: root, agent: 'generic', packId: 'ngautopilot-full', output }).ok, true);
  assert.equal(snapshot(output).files.filter(file => /^skills\/[^/]+\/SKILL\.md$/.test(file.path)).length, JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8')).skills.length);
  assert.equal(snapshot(output).files.filter(file => file.path.endsWith('/SKILL.md')).length, JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8')).skills.length, 'nested skills must not be duplicated under a parent');
  assert.ok(snapshot(output).files.some(file => file.path.includes('/references/ngautopilot-source/docs/')));
  assert.equal(sha256(fs.readFileSync(path.join(root, 'catalog.json'))), before);
});

test('native export excludes private local skill resources but preserves public fixtures and binary assets', (t) => {
  const sourceRoot = temporary(t);
  const output = temporary(t);
  fs.cpSync(path.join(root, 'adapters'), path.join(sourceRoot, 'adapters'), { recursive: true });
  const directory = path.join(sourceRoot, 'skills/_core/example');
  fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(path.join(sourceRoot, 'packs'));
  fs.writeFileSync(path.join(directory, 'SKILL.md'), '---\nname: Example\ndescription: Export fixture.\n---\n\nPublic skill.\n');
  fs.writeFileSync(path.join(sourceRoot, 'catalog.json'), JSON.stringify({ skills: [{ id: '_core.example', path: 'skills/_core/example/SKILL.md', version: '0.9.0', description: 'Export fixture.' }] }));
  fs.writeFileSync(path.join(sourceRoot, 'packs/ngautopilot-core.json'), JSON.stringify({ id: 'ngautopilot-core', includes: { skills: ['_core.'] } }));
  for (const relative of ['.env', '.env.local', '.npmrc', '.git/config', '.hg/hgrc', '.svn/private', '.bzr/private', 'references/capture.private.json', 'provider.local.yaml', 'raw-prompts/private.md', 'raw-responses/private.json', 'node_modules/secret.json', '.cache/secret.json', 'runtime.log']) {
    fs.mkdirSync(path.dirname(path.join(directory, relative)), { recursive: true });
    fs.writeFileSync(path.join(directory, relative), 'PRIVATE_LOCAL_DATA');
  }
  fs.writeFileSync(path.join(directory, '.env.example'), 'PUBLIC_FIXTURE');
  fs.writeFileSync(path.join(directory, 'asset.bin'), Buffer.from([0, 255, 128, 1]));
  assert.equal(exportAdapter({ sourceRoot, agent: 'generic', packId: 'ngautopilot-core', output }).ok, true);
  for (const file of snapshot(output).files) assert.equal(fs.readFileSync(path.join(output, file.path)).includes(Buffer.from('PRIVATE_LOCAL_DATA')), false, file.path);
  assert.equal(fs.readFileSync(path.join(output, 'skills/core-example/.env.example'), 'utf8'), 'PUBLIC_FIXTURE');
  assert.deepEqual(fs.readFileSync(path.join(output, 'skills/core-example/asset.bin')), Buffer.from([0, 255, 128, 1]));
});
