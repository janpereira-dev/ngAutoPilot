import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { createRepositoryTools } from './repository.mjs';

export function createMcpServer({ root, version }) {
  const server = new McpServer({ name: 'ngautopilot-tools', version });
  const tools = createRepositoryTools({ root });

  register(server, 'catalog.search', 'Search NgAutoPilot catalog skills without changing repository files.', z.object({ query: z.string().min(1).max(256), limit: z.number().int().min(1).max(50).optional() }), ({ query, limit }) => tools.catalogSearch({ query, limit }));
  register(server, 'pack.list', 'List NgAutoPilot packs without changing repository files.', z.object({}), () => tools.packList());
  register(server, 'pack.resolve', 'Resolve a NgAutoPilot pack and transitive dependencies without changing repository files.', z.object({ packId: z.string().min(1).max(128) }), ({ packId }) => tools.packResolve({ packId }));
  register(server, 'project.inspect', 'Inspect repository metadata without changing repository files.', z.object({}), () => tools.projectInspect());
  register(server, 'stack.detect', 'Detect repository stack metadata without changing repository files.', z.object({}), () => tools.stackDetect());
  register(server, 'skill.route', 'Route a request to relevant NgAutoPilot skills without changing repository files.', z.object({ request: z.string().min(1).max(2048) }), ({ request }) => tools.skillRoute({ request }));
  register(server, 'compatibility.check', 'Check whether a named NgAutoPilot compatibility target is supported.', z.object({ target: z.string().min(1).max(128) }), ({ target }) => tools.compatibilityCheck({ target }));
  register(server, 'upgrade.plan', 'Plan supported Angular major upgrade hops without changing repository files.', z.object({ from: z.number().int().min(2).max(99), to: z.number().int().min(3).max(99) }), ({ from, to }) => tools.upgradePlan({ from, to }));
  register(server, 'repository.validate', 'Validate repository catalog and pack consistency without changing repository files.', z.object({}), () => tools.repositoryValidate());

  return server;
}

function register(server, name, description, inputSchema, handler) {
  server.registerTool(name, { description, inputSchema }, async (input) => {
    try {
      return { content: [{ type: 'text', text: JSON.stringify(handler(input), null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }] };
    }
  });
}
