import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, test } from 'vitest';

const repository = path.resolve(import.meta.dirname, '../..');
const roots = [];
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-script-unit-'));
  roots.push(root);
  return root;
}

function writeSkill(root, directory, id, compatibility = '') {
  const target = path.join(root, 'skills', directory);
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'SKILL.md'), `---\nid: ${id}\nname: Focused skill\ndescription: Verify one contract.\nstack:\n  - Angular\ncategory: testing\nstatus: stable\nversion: 0.9.0\nowner: NgAutoPilot\ntriggers:\n  - focused test\n${compatibility}---\n\n${['Purpose', 'When to Use', 'Do', 'Do Not', 'Review Checklist', 'Expected Output'].map((section) => `## ${section}\n\nA specific contract.\n`).join('\n')}`);
  return target;
}

function runScript(root, name) {
  return spawnSync(process.execPath, [path.join(repository, 'scripts', name)], { cwd: root, encoding: 'utf8' });
}

test('release version checks distinguish dependency versions from project release references', () => {
  const root = fixture();
  const write = (relative, content) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  const lock = { version: '0.9.0', packages: { '': { version: '0.9.0' }, 'node_modules/example': { version: '0.3.31' } } };
  write('package.json', JSON.stringify({ version: '0.9.0' }));
  write('package-lock.json', JSON.stringify(lock));
  write('agent-plugins/tools/data/package-lock.json', JSON.stringify(lock));
  write('catalog.json', JSON.stringify({ version: '0.9.0', skills: [] }));
  write('openai/plugin.json', JSON.stringify({ version: '0.9.0' }));
  fs.mkdirSync(path.join(root, 'openai/submission/0.9.0'), { recursive: true });
  for (const file of ['.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json']) write(file, JSON.stringify({ plugins: [] }));
  write('skill-lab/python/pyproject.toml', 'version = "0.9.0"\n');
  write('skill-lab/python/ngautopilot_skillopt/__init__.py', '__version__ = "0.9.0"\n');
  expect(runScript(root, 'check-release-version.mjs').status).toBe(0);
  write('docs/stale.md', 'Install ngautopilot 0.3.31');
  expect(runScript(root, 'check-release-version.mjs').status).toBe(1);
  fs.unlinkSync(path.join(root, 'docs/stale.md'));
  lock.packages[''].version = '0.8.0';
  write('package-lock.json', JSON.stringify(lock));
  expect(runScript(root, 'check-release-version.mjs').status).toBe(1);
});

describe('catalog processing', () => {
  test('preserves major/minor compatibility and emits stable ordering without mutating source', () => {
    const root = fixture();
    const skill = writeSkill(root, 'angular/z', 'angular.testing.z', 'compatibility:\n  angular:\n    min: "16.1"\n    max: "21"\n');
    writeSkill(root, 'angular/a', 'angular.testing.a');
    const before = fs.readFileSync(path.join(skill, 'SKILL.md'));
    expect(runScript(root, 'generate-catalog.mjs').status).toBe(0);
    const output = fs.readFileSync(path.join(root, 'catalog.json'), 'utf8');
    const catalog = JSON.parse(output);
    expect(catalog.skills.map((entry) => entry.id)).toEqual(['angular.testing.a', 'angular.testing.z']);
    expect(catalog.skills[1].compatibility).toEqual({ min: 16, minMinor: 1, max: 21 });
    expect(catalog.skills[1].contentSignals.requiredSections).toBe(true);
    expect(fs.readFileSync(path.join(skill, 'SKILL.md'))).toEqual(before);
    expect(runScript(root, 'generate-catalog.mjs').status).toBe(0);
    expect(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8')).toBe(output);
  });

  test('rejects missing frontmatter without replacing a previous valid catalog', () => {
    const root = fixture();
    const source = writeSkill(root, 'angular/example', 'angular.testing.example');
    expect(runScript(root, 'generate-catalog.mjs').status).toBe(0);
    const before = fs.readFileSync(path.join(root, 'catalog.json'));
    fs.writeFileSync(path.join(source, 'SKILL.md'), 'No metadata');
    const result = runScript(root, 'generate-catalog.mjs');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('missing frontmatter');
    expect(fs.readFileSync(path.join(root, 'catalog.json'))).toEqual(before);
  });
});

test('bundle processing generates ten consistent manifests and retains reference assets', () => {
  const root = fixture();
  for (const directory of ['_core', 'angular/testing', 'angular/microfrontends', 'angular/styles', 'frontend/testing', 'javascript/modules', 'quality/eslint', 'quality/sonarqube', 'typescript/types']) {
    const source = writeSkill(root, `${directory}/example`, `${directory.replaceAll('/', '.').replace('_core', 'core')}.example`);
    fs.mkdirSync(path.join(source, 'references'));
    fs.writeFileSync(path.join(source, 'references', 'contract.md'), '# Verified resource\n');
  }
  fs.mkdirSync(path.join(root, '.agents/plugins'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude-plugin'));
  const result = runScript(root, 'sync-plugin-bundles.mjs');
  expect(result.status, result.stderr).toBe(0);
  const codex = JSON.parse(fs.readFileSync(path.join(root, '.agents/plugins/marketplace.json')));
  const claude = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin/marketplace.json')));
  expect(codex.plugins).toHaveLength(10);
  expect(codex.plugins.map((plugin) => plugin.name)).toEqual(claude.plugins.map((plugin) => plugin.name));
  for (const plugin of codex.plugins) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, plugin.source.path, '.codex-plugin/plugin.json')));
    expect(manifest.name).toBe(plugin.name);
    expect(manifest.version).toBe('0.9.0');
  }
  expect(fs.readFileSync(path.join(root, 'plugins/ngautopilot-angular/skills/angular--testing--example/references/contract.md'), 'utf8')).toBe('# Verified resource\n');
});
