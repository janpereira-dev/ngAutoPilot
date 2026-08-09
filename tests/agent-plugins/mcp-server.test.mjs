import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('exposes exactly nine read-only MCP tools', async (t) => {
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
    'catalog.search', 'compatibility.check', 'pack.list', 'pack.resolve', 'project.inspect',
    'repository.validate', 'skill.route', 'stack.detect', 'upgrade.plan',
  ]);

  const invalid = await client.callTool({ name: 'pack.resolve', arguments: { packId: 'missing' } });
  assert.equal(invalid.isError, true);

  const catalog = await client.callTool({ name: 'catalog.search', arguments: { query: 'typed forms' } });
  assert.equal(catalog.isError, undefined);
});
