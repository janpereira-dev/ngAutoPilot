import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import { createMcpServer } from '../lib/agent-plugins/mcp-server.mjs';

const root = process.env.PLUGIN_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = createMcpServer({ root, version: process.env.NGAUTOPILOT_VERSION ?? '0.6.0' });

await server.connect(new StdioServerTransport());
