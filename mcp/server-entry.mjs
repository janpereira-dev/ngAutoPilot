import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import { createMcpServer } from '../lib/agent-plugins/mcp-server.mjs';

const pluginRoot = process.env.PLUGIN_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = await (await import('node:fs/promises')).access(path.join(pluginRoot, 'data', 'catalog.json'))
  .then(() => path.join(pluginRoot, 'data'))
  .catch(() => pluginRoot);
const server = createMcpServer({ root, version: process.env.NGAUTOPILOT_VERSION ?? '0.6.0' });

await server.connect(new StdioServerTransport());
