import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('exposes the complete read-only MCP catalog and platform tools', async (t) => {
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
    'angular.installation.resolve', 'catalog.quality', 'catalog.search', 'compatibility.check',
    'pack.list', 'pack.resolve', 'platform.inventory', 'project.inspect', 'repository.validate',
    'skill.route', 'stack.detect', 'upgrade.plan',
  ]);

  const invalid = await client.callTool({ name: 'pack.resolve', arguments: { packId: 'missing' } });
  assert.equal(invalid.isError, true);

  const catalog = await client.callTool({ name: 'catalog.search', arguments: { query: 'typed forms' } });
  assert.equal(catalog.isError, undefined);

  const inventory = await client.callTool({ name: 'platform.inventory', arguments: {} });
  assert.equal(inventory.isError, undefined);
  const inventoryPayload = JSON.parse(inventory.content[0].text);
  assert.equal(inventoryPayload.distribution.mcpServer.availability, 'npm-and-agent-plugin');
  assert.equal(inventoryPayload.distribution.openaiPackage.availability, 'source-only');

  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-mcp-angular-'));
  t.after(() => fs.rmSync(projectRoot, { recursive: true, force: true }));
  fs.writeFileSync(path.join(projectRoot, 'package.json'), `${JSON.stringify({
    private: true,
    dependencies: { '@angular/core': '^12.2.17', '@angular/common': '^12.2.17' },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(projectRoot, 'package-lock.json'), `${JSON.stringify({
    lockfileVersion: 3,
    packages: { 'node_modules/@angular/core': { version: '12.2.17' } },
  }, null, 2)}\n`);
  const resolved = await client.callTool({
    name: 'angular.installation.resolve',
    arguments: { projectRoot, profile: 'testing', capabilities: ['ui'] },
  });
  assert.equal(resolved.isError, undefined);
});
