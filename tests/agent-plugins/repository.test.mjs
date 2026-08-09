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
