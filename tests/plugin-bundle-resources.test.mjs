import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/sync-plugin-bundles.mjs', import.meta.url));

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-bundle-resources-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const category of [
    '_core', 'angular/testing', 'angular/microfrontends', 'angular/styles',
    'frontend/testing', 'javascript/modules', 'quality/eslint', 'quality/sonarqube', 'typescript/strict-types',
  ]) {
    const source = path.join(root, 'skills', category, 'example');
    const id = `${category.replaceAll('/', '.')}.example`.replace('_core', 'core');
    fs.mkdirSync(source, { recursive: true });
    fs.writeFileSync(path.join(source, 'SKILL.md'), `---\nid: ${id}\nname: Example\ndescription: A focused example.\n---\nRead [guide](references/guide.md).\n`);
    fs.mkdirSync(path.join(source, 'references'), { recursive: true });
    fs.writeFileSync(path.join(source, 'references', 'guide.md'), '# Contract evidence\n');
  }
  fs.mkdirSync(path.join(root, '.agents', 'plugins'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude-plugin'), { recursive: true });
  return root;
}

test('classic plugin sync retains nested skill resources and exact entrypoint content', (t) => {
  const root = fixture(t);
  const source = path.join(root, 'skills', 'angular', 'testing', 'example');
  fs.mkdirSync(path.join(source, 'references', 'nested'));
  fs.writeFileSync(path.join(source, 'references', 'nested', 'data.json'), '{"verified":true}\n');
  // Catalog skill trees may contain a parent entrypoint and independent child skills.
  fs.mkdirSync(path.join(source, 'children', 'child'), { recursive: true });
  fs.writeFileSync(path.join(source, 'children', 'child', 'SKILL.md'),
    '---\nid: angular.testing.child\nname: Child\ndescription: Independent child.\n---\n');
  const run = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  const target = path.join(root, 'plugins', 'ngautopilot-angular', 'skills', 'angular--testing--example');
  for (const file of ['SKILL.md', 'references/guide.md', 'references/nested/data.json']) {
    assert.equal(fs.readFileSync(path.join(target, file), 'utf8'), fs.readFileSync(path.join(source, file), 'utf8'));
  }
  assert.equal(fs.existsSync(path.join(target, 'children', 'child', 'SKILL.md')), false);
  assert.equal(fs.existsSync(path.join(root, 'plugins', 'ngautopilot-angular', 'skills', 'angular--testing--child', 'SKILL.md')), true);
});

test('classic plugin sync rejects linked skill resources instead of copying outside files', (t) => {
  const root = fixture(t);
  const outside = path.join(root, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'private.txt'), 'Not distributable');
  const link = path.join(root, 'skills', 'angular', 'testing', 'example', 'references', 'linked');
  fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
  const run = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /symbolic links are not supported/);
  const leaked = path.join(root, 'plugins', 'ngautopilot-angular', 'skills', 'angular--testing--example', 'references', 'linked', 'private.txt');
  assert.equal(fs.existsSync(leaked), false);
});
