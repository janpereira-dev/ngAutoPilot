import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { resolvePackSkills } from '../../lib/agent-plugins/pack-resolver.mjs';

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
