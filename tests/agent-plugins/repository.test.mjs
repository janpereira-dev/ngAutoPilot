import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createRepositoryTools } from '../../lib/agent-plugins/repository.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('searches catalog and resolves packs without writes', () => {
  const tools = createRepositoryTools({ root });

  assert.ok(tools.catalogSearch({ query: 'typed forms' }).matches.some(({ id }) => id.includes('typed-forms')));
  assert.deepEqual(tools.packResolve({ packId: 'ngautopilot-angular-testing' }).packs, ['ngautopilot-core', 'ngautopilot-angular-testing']);
  assert.equal(tools.repositoryValidate().mutatesRepository, false);
});

test('derives stack, route, compatibility, and upgrade data from repository files', () => {
  const tools = createRepositoryTools({ root });

  assert.equal(tools.stackDetect().node.minimum, '>=24.0.0 <25');
  assert.ok(tools.skillRoute({ request: 'Angular typed forms' }).matches.length > 0);
  assert.equal(tools.compatibilityCheck({ target: 'angular-21-to-22' }).supported, true);
  assert.throws(() => tools.compatibilityCheck({ target: 'x/../../package' }), /invalid compatibility target/);
  assert.deepEqual(tools.upgradePlan({ from: 20, to: 22 }).hops, ['20-to-21', '21-to-22']);
  assert.throws(() => tools.upgradePlan({ from: 2, to: 3 }), /Angular 3/);
});

test('reports platform assets and deterministic content signals without semantic-quality claims', () => {
  const tools = createRepositoryTools({ root });
  const inventory = tools.platformInventory();
  const quality = tools.catalogQuality();

  assert.equal(inventory.skills.count, 413);
  assert.equal(inventory.angular.unsupportedMajor.includes(3), true);
  assert.equal(inventory.angular.upgradeHops.some(({ from, to }) => from === 2 && to === 4), true);
  assert.equal(inventory.adapters.length, 10);
  assert.equal(inventory.subagents.length, 8);
  assert.equal(inventory.distribution.mcpServer, true);
  assert.equal(quality.summary.skillCount, 413);
  assert.match(quality.semanticEvaluation, /does not claim semantic value/);
  assert.ok(quality.skills.every(({ signals }) => signals.requiredSections));
});
