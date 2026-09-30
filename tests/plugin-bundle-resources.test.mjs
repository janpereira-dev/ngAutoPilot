import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { copyContainedDirectory } from '../lib/agent-plugins/path-safety.mjs';

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

test('nested-skill exclusion rejects linked and broken markers', (t) => {
  const root = fixture(t);
  const source = path.join(root, 'marker-source');
  const nested = path.join(source, 'references');
  fs.mkdirSync(nested, { recursive: true });
  const outside = path.join(root, 'outside-marker');
  fs.mkdirSync(outside);
  // A junction named SKILL.md also exercises Windows without file-symlink privileges.
  const marker = path.join(nested, 'SKILL.md');
  fs.symlinkSync(outside, marker, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => copyContainedDirectory(source, path.join(root, 'target'), { excludeNestedSkills: true }), /symbolic links/);
  fs.rmdirSync(outside);
  assert.throws(() => copyContainedDirectory(source, path.join(root, 'broken-target'), { excludeNestedSkills: true }), /symbolic links/);
});

test('a late resource failure preserves every existing bundle and marketplace', (t) => {
  const root = fixture(t);
  const initial = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  assert.equal(initial.status, 0, initial.stderr);
  const snapshot = () => Object.fromEntries(['plugins', '.agents', '.claude-plugin'].flatMap((directory) =>
    fs.readdirSync(path.join(root, directory), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = path.join(entry.parentPath, entry.name);
        return [path.relative(root, file), fs.readFileSync(file).toString('base64')];
      })));
  const before = snapshot();
  fs.writeFileSync(path.join(root, 'skills', '_core', 'example', 'references', 'guide.md'), 'New unpublished content');
  const outside = path.join(root, 'outside');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(root, 'skills', 'typescript', 'strict-types', 'example', 'references', 'linked'),
    process.platform === 'win32' ? 'junction' : 'dir');
  const run = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /symbolic links are not supported/);
  assert.deepEqual(snapshot(), before);
  assert.equal(fs.readdirSync(root).some((name) => name.startsWith('.plugin-sync-')), false);
});
