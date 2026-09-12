import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('exposes exactly ten read-only MCP tools', async (t) => {
  const client = new Client({ name: 'ngautopilot-test', version: '0.6.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(root, 'agent-plugins', 'ngautopilot-tools', 'bin', 'server.mjs')],
    cwd: root,
  });
  t.after(async () => client.close());

  await client.connect(transport);
  const { tools } = await client.listTools();

  assert.deepEqual(tools.map(({ name }) => name).sort(), [
    'angular.resolve', 'catalog.search', 'compatibility.check', 'pack.list', 'pack.resolve', 'project.inspect',
    'repository.validate', 'skill.route', 'stack.detect', 'upgrade.plan',
  ]);

  const invalid = await client.callTool({ name: 'pack.resolve', arguments: { packId: 'missing' } });
  assert.equal(invalid.isError, true);

  const catalog = await client.callTool({ name: 'catalog.search', arguments: { query: 'typed forms' } });
  assert.equal(catalog.isError, undefined);

  const resolved = await client.callTool({ name: 'angular.resolve', arguments: {
    snapshot: {
      manifest: { dependencies: { '@angular/core': '^16.2.12', '@angular/common': '^16.2.12' } },
      lockfile: { kind: 'npm', packages: { '@angular/core': '16.2.12', '@angular/common': '16.2.12' } },
      workspace: { angularJson: true },
    },
    target: '16.2',
  } });
  assert.equal(resolved.isError, undefined);
  const result = JSON.parse(resolved.content[0].text);
  assert.equal(result.evidence.packageJson.provenance, 'snapshot.manifest');
  assert.equal(result.evidence.workspace.provenance, 'snapshot.workspace');

  const invalidSnapshot = await client.callTool({ name: 'angular.resolve', arguments: {
    snapshot: { manifest: { dependencies: { '@angular/core': '^16.2.12' } }, projectRoot: 'C:\\private' },
    target: 16,
  } });
  assert.equal(invalidSnapshot.isError, true);
});
