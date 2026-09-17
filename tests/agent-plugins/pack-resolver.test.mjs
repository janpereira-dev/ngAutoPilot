import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { resolvePackSkills, resolvePacks } from '../../lib/agent-plugins/pack-resolver.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('resolves transitive Core skills and source descriptions from a focused pack', () => {
  const skills = resolvePackSkills({
    catalogPath: path.join(root, 'catalog.json'),
    packsRoot: path.join(root, 'packs'),
    sourceRoot: root,
    packId: 'ngautopilot-angular-testing',
  });

  assert.ok(skills.some(({ id }) => id === 'core.project-intake'));
  assert.ok(skills.some(({ id }) => id === 'angular.testing.angular-component-testing-patterns'));
  assert.equal(typeof skills.find(({ id }) => id === 'core.project-intake').description, 'string');
  assert.ok(skills.every(({ description }) => description.length > 0));
});

test('rejects pack identifiers that escape the packs directory', () => {
  assert.throws(() => resolvePacks(path.join(root, 'packs'), '../package'), /invalid pack ID/);
});

test('resolves packs from a relative root', () => {
  const relativePacksRoot = path.relative(process.cwd(), path.join(root, 'packs')) || '.';
  assert.equal(resolvePacks(relativePacksRoot, 'ngautopilot-core').at(-1).id, 'ngautopilot-core');
});

test('resolves a catalog path with a relative parent directory', () => {
  const relativeRoot = path.relative(process.cwd(), root) || '.';
  const skills = resolvePackSkills({
    catalogPath: path.join(relativeRoot, 'catalog.json'),
    packsRoot: path.join(relativeRoot, 'packs'),
    sourceRoot: root,
    packId: 'ngautopilot-core',
  });
  assert.ok(skills.some(({ id }) => id === 'core.project-intake'));
});

test('rejects a catalog skill whose source path escapes the declared source root', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-pack-resolver-'));
  const packsRoot = path.join(fixture, 'packs');
  fs.mkdirSync(packsRoot);
  fs.writeFileSync(path.join(packsRoot, 'ngautopilot-test.json'), JSON.stringify({
    id: 'ngautopilot-test',
    includes: { skills: ['test.'] },
  }));
  fs.writeFileSync(path.join(fixture, 'catalog.json'), JSON.stringify({
    skills: [{ id: 'test.escape', path: '../outside/SKILL.md' }],
  }));

  assert.throws(() => resolvePackSkills({
    catalogPath: path.join(fixture, 'catalog.json'),
    packsRoot,
    sourceRoot: fixture,
    packId: 'ngautopilot-test',
  }), /source path escapes root/);
  fs.rmSync(fixture, { recursive: true, force: true });
});

test('rejects a catalog skill behind a symlinked source parent', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-pack-resolver-'));
  const packsRoot = path.join(fixture, 'packs');
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ngap-pack-resolver-outside-'));
  fs.mkdirSync(packsRoot);
  fs.mkdirSync(path.join(fixture, 'linked'));
  fs.writeFileSync(path.join(outside, 'SKILL.md'), '---\ndescription: outside\n---\n');
  fs.rmSync(path.join(fixture, 'linked'), { recursive: true });
  try {
    fs.symlinkSync(outside, path.join(fixture, 'linked'), 'junction');
  } catch (error) {
    t.skip(`symlink creation unavailable: ${error.code}`);
    fs.rmSync(fixture, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
    return;
  }
  fs.writeFileSync(path.join(packsRoot, 'ngautopilot-test.json'), JSON.stringify({ id: 'ngautopilot-test', includes: { skills: ['test.'] } }));
  fs.writeFileSync(path.join(fixture, 'catalog.json'), JSON.stringify({ skills: [{ id: 'test.symlink', path: 'linked/SKILL.md' }] }));

  assert.throws(() => resolvePackSkills({ catalogPath: path.join(fixture, 'catalog.json'), packsRoot, sourceRoot: fixture, packId: 'ngautopilot-test' }), /symlinked parent/);
  fs.rmSync(fixture, { recursive: true, force: true });
  fs.rmSync(outside, { recursive: true, force: true });
});
