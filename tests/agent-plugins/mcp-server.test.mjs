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
  const standalone = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-standalone-tools-'));
  fs.cpSync(path.join(root, 'agent-plugins', 'ngautopilot-tools'), path.join(standalone, 'tools'), { recursive: true });
  const client = new Client({ name: 'ngautopilot-test', version: '0.6.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(standalone, 'tools', 'bin', 'server.mjs')],
    cwd: standalone,
  });
  t.after(async () => {
    await client.close();
    fs.rmSync(standalone, { recursive: true, force: true });
  });

  await client.connect(transport);
  const { tools } = await client.listTools();

  assert.deepEqual(tools.map(({ name }) => name).sort(), [
    'angular.installation.resolve', 'angular.resolve', 'catalog.quality', 'catalog.search', 'compatibility.check',
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
  const snapshot = await client.callTool({ name: 'angular.resolve', arguments: {
    snapshot: { manifest: { dependencies: { '@angular/core': '^16.2.12', '@angular/common': '^16.2.12' } },
      lockfile: { kind: 'npm', packages: { '@angular/core': '16.2.12' } }, workspace: { angularJson: true } }, target: '16.2',
  } });
  assert.equal(snapshot.isError, undefined);
  assert.equal(JSON.parse(snapshot.content[0].text).evidence.packageJson.provenance, 'snapshot.manifest');
  const invalidSnapshot = await client.callTool({ name: 'angular.resolve', arguments: {
    snapshot: { manifest: { dependencies: { '@angular/core': '^16.2.12' } }, projectRoot: 'C:\\private' }, target: 16,
  } });
  assert.equal(invalidSnapshot.isError, true);
  const peerSnapshot = await client.callTool({ name: 'angular.resolve', arguments: {
    snapshot: { manifest: { peerDependencies: { '@angular/core': '^16.2.0' } } },
  } });
  assert.equal(peerSnapshot.isError, undefined);
  assert.equal(JSON.parse(peerSnapshot.content[0].text).evidence.angular.major, 16);
  const contradictory = await client.callTool({ name: 'angular.resolve', arguments: {
    snapshot: { manifest: { dependencies: { '@angular/core': '^16.2.0', '@angular/common': '^16.2.0' } },
      lockfile: { kind: 'npm', packages: { '@angular/core': '16.2.12', '@angular/common': '15.2.10' } } },
  } });
  assert.equal(contradictory.isError, true);
});
