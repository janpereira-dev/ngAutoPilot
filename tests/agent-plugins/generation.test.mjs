import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { syncAgentPlugins } from '../../scripts/sync-agent-plugins.mjs';
import { validateAgentPlugins } from '../../scripts/validate-agent-plugins.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('generates pack-driven portable skill plugins without native manifest fields', () => {
  const reports = syncAgentPlugins({ root });
  assert.equal(reports.filter(({ kind }) => kind === 'skills').length, 4);

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent-plugins/ngautopilot-core/plugin.json'), 'utf8'));
  assert.equal(manifest.skills, undefined);
  assert.match(manifest.$schema, /plugin\.schema\.json$/);
  assert.equal(validateAgentPlugins({ root }).errors.length, 0);
});
