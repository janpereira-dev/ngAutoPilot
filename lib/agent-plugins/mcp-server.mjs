import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { createRepositoryTools } from './repository.mjs';

const packageVersions = z.record(z.string().min(1).max(128), z.string().min(1).max(64));
const angularSnapshotSchema = z.object({
  manifest: z.object({
    peerDependencies: packageVersions.optional(),
    dependencies: packageVersions.optional(),
    devDependencies: packageVersions.optional(),
  }).strict(),
  lockfile: z.object({
    kind: z.literal('npm'),
    packages: packageVersions,
  }).strict().optional(),
  workspace: z.object({
    angularJson: z.boolean().optional(),
    workspaceJson: z.boolean().optional(),
    projectJson: z.boolean().optional(),
  }).strict().optional(),
}).strict();
const angularTargetSchema = z.union([
  z.number().int().min(2).max(99),
  z.string().regex(/^\d+(?:\.\d+)?$/),
  z.object({ major: z.number().int().min(2).max(99), minor: z.number().int().min(0).max(99).optional() }).strict(),
]);

export function createMcpServer({ root, version }) {
  const server = new McpServer({ name: 'ngautopilot-tools', version });
  const tools = createRepositoryTools({ root });

  register(server, 'catalog.search', 'Search NgAutoPilot catalog skills without changing repository files.', z.object({ query: z.string().min(1).max(256), limit: z.number().int().min(1).max(50).optional() }), ({ query, limit }) => tools.catalogSearch({ query, limit }));
  register(server, 'catalog.quality', 'Report deterministic content signals for every NgAutoPilot skill without claiming semantic quality or changing repository files.', z.object({}), () => tools.catalogQuality());
  register(server, 'pack.list', 'List NgAutoPilot packs without changing repository files.', z.object({}), () => tools.packList());
  register(server, 'pack.resolve', 'Resolve a NgAutoPilot pack and transitive dependencies without changing repository files.', z.object({ packId: z.string().min(1).max(128) }), ({ packId }) => tools.packResolve({ packId }));
  register(server, 'platform.inventory', 'List NgAutoPilot skills, Angular upgrade coverage, packs, adapters, subagents, distribution surfaces, and deterministic quality signals without changing repository files.', z.object({}), () => tools.platformInventory());
  register(server, 'project.inspect', 'Inspect repository metadata without changing repository files.', z.object({}), () => tools.projectInspect());
  register(server, 'stack.detect', 'Detect repository stack metadata without changing repository files.', z.object({}), () => tools.stackDetect());
  register(server, 'skill.route', 'Route a request to relevant NgAutoPilot skills without changing repository files.', z.object({ request: z.string().min(1).max(2048) }), ({ request }) => tools.skillRoute({ request }));
  register(server, 'compatibility.check', 'Check whether a named NgAutoPilot compatibility target is supported.', z.object({ target: z.string().min(1).max(128) }), ({ target }) => tools.compatibilityCheck({ target }));
  register(server, 'upgrade.plan', 'Plan supported Angular major upgrade hops without changing repository files.', z.object({ from: z.number().int().min(2).max(99), to: z.number().int().min(3).max(99) }), ({ from, to }) => tools.upgradePlan({ from, to }));
  register(server, 'angular.resolve', 'Resolve Angular guidance from a caller-supplied package, lockfile, and workspace snapshot without reading caller files.', z.object({
    snapshot: angularSnapshotSchema,
    target: angularTargetSchema.optional(),
    profile: z.enum(['core', 'essentials', 'architecture', 'performance', 'testing', 'migration']).optional(),
    capabilities: z.array(z.enum(['foundations', 'runtime', 'state', 'testing', 'ui'])).max(5).optional(),
  }).strict(), ({ snapshot, target, profile, capabilities }) => tools.angularResolve({ snapshot, target, profile, capabilities }));
  register(server, 'angular.installation.resolve', 'Resolve compatible non-migration packs and skills from local Angular project evidence without changing repository files.', z.object({
    projectRoot: z.string().min(1).max(4096),
    target: z.union([z.string().min(1).max(32), z.number().int().min(2).max(99)]).optional(),
    profile: z.string().min(1).max(64).optional(),
    capabilities: z.array(z.string().min(1).max(64)).max(10).optional(),
  }), (options) => tools.angularInstallationResolve(options));
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
