# NgAutoPilot 0.6.0 Agent Plugins Design

## Goal

Release a complete Agent Plugins 1.0 preview without replacing current client-specific bundles, adapters, or marketplaces. `skills/` remains canonical and `packs/` becomes the sole selection policy for portable plugins.

## Scope

Generate these skill plugins:

- `ngautopilot-core`
- `ngautopilot-angular-architecture`
- `ngautopilot-angular-testing`
- `ngautopilot-angular-21-to-22`

Generate a separate read-only MCP plugin:

- `ngautopilot-tools`

Include portable validation, reproducible ZIP distribution with SHA-256 checksums, source-to-artifact traceability, documentation, release integration, and version synchronization to `0.6.0`.

Do not reduce adapters, retire marketplaces, add client-specific installation validation, or add mutating MCP tools.

## Architecture

```text
skills/ + packs/
  -> lib/agent-plugins/
  -> agent-plugins.config.json
  -> agent-plugins/<plugin>/
  -> dist/agent-plugins/*.zip + SHA256SUMS
```

`agent-plugins.config.json` declares only plugin identity, pack ID, and enabled state. Skill lists are derived by resolving pack dependencies and catalog prefixes. Every specialized plugin therefore contains its transitive Core skills.

Existing `plugins/`, `.agents/plugins/marketplace.json`, `.claude-plugin/marketplace.json`, adapters, and CLI installation flow remain independent and unchanged in behavior.

## Portable Plugin Format

Each skill plugin contains:

```text
plugin.json
skills/<portable-skill-name>/SKILL.md
```

Each generated `plugin.json` uses Agent Plugins schema `1.0.0` and only valid portable root fields. Skill discovery relies on fixed `skills/`; no `skills` manifest field is emitted.

The renderer copies the complete source-skill directory, then replaces only `SKILL.md` frontmatter. Portable names derive from canonical IDs by lowercasing, replacing non-alphanumerics with one hyphen, and rejecting empty, over-64-character, or colliding results. Source metadata is retained as string values under `metadata`.

## MCP Plugin

`ngautopilot-tools` is a separate portable plugin with root `plugin.json`, root `mcp.json`, `bin/server.mjs`, and an operational skill. It uses `@modelcontextprotocol/sdk` and Zod on Node 18+.

It exposes only these deterministic read-only tools:

- `catalog.search`
- `pack.list`
- `pack.resolve`
- `project.inspect`
- `stack.detect`
- `skill.route`
- `compatibility.check`
- `upgrade.plan`
- `repository.validate`

The server reuses internal catalog, pack, stack, route, and validation functions where practical. It does not mutate a repository, install dependencies, execute upgrades, access secrets, or perform Git writes.

`mcp.json` uses `stdio`, a plugin-contained command, `${PLUGIN_ROOT}` for bundled resources, and `${PLUGIN_DATA}` only for client-provided persistent data. No credentials, headers, or ambient configuration are embedded.

## Safety and Failure Boundaries

- Every copied, discovered, or launched path must resolve within its plugin root.
- Symlinks, junctions, and reparse points escaping root fail generation or validation.
- Relative file references in portable skill bodies must resolve inside their skill directory.
- Invalid plugin manifests fail that plugin.
- Invalid skills skip only that skill during smoke validation.
- Invalid MCP configuration disables only MCP validation for that plugin; skill plugins remain independently valid.
- Generator execution performs no MCP process launch and no network access.

## Validation

Dedicated tests and validation cover:

- Agent Plugins manifest schema, names, and unknown fields.
- Agent Skills frontmatter, directory-name matching, and string-only metadata.
- Pack selection and transitive Core inclusion.
- Whole-directory copy, collisions, reference integrity, and path containment.
- Deterministic sync and reproducible archives.
- Archive file inventory and SHA-256 manifest.
- MCP `tools/list`, valid calls, invalid inputs, and no write operations.
- Existing catalog, native plugin bundles, marketplaces, CLI, and release validations.

`release:validate` adds Agent Plugin synchronization and validation before packaging. Browser/editor/client conformance testing remains an explicit release-close activity outside this change.

## Release Contract

`0.6.0` is NgAutoPilot version, not Agent Plugins version. Version synchronization covers package metadata, catalog, all source skills, packs, native bundles, marketplaces, portable plugins, docs, and generated distribution artifacts.

## Acceptance Criteria

- Four pack-driven portable skill plugins and one separate MCP plugin exist under `agent-plugins/`.
- No manually maintained portable skill list exists outside packs.
- Generated skills satisfy Agent Skills requirements.
- Portable manifests satisfy Agent Plugins 1.0 requirements.
- Existing native plugin and marketplace outputs remain valid.
- Distribution archives are deterministic and checksummed.
- MCP tools are read-only, schema-validated, and tested.
- Release validation passes without client-by-client installation checks.
