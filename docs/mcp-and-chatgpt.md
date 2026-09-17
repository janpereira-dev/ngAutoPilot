# MCP and ChatGPT Integration

NgAutoPilot ships a read-only stdio Model Context Protocol server as part of the `ngautopilot-tools` Agent Plugin. It reads bundled catalog metadata (including generated compatibility and content signals), pack, adapter, subagent, and distribution metadata; it does not edit applications, install dependencies, run migrations, or change Git state.

## Available tools

- `catalog.search` — find catalog skills.
- `catalog.quality` — inspect deterministic structural content signals. It is not a semantic-quality claim.
- `pack.list` and `pack.resolve` — inspect packs and dependencies.
- `platform.inventory` — list skill families, Angular-hop coverage, packs, adapters, subagents, distribution surfaces, and content-signal totals.
- `project.inspect` and `stack.detect` — inspect repository metadata.
- `angular.installation.resolve` — read a supplied local Angular project's package metadata and lockfile to resolve compatible non-migration guidance.
- `skill.route`, `compatibility.check`, and `upgrade.plan` — select relevant guidance.
- `repository.validate` — validate catalog and pack consistency.

`angular.installation.resolve` can read only the local path explicitly supplied
to the MCP host. Treat that path as local project metadata and do not supply a
directory containing secrets or material that is outside the task scope.

## Supported transport

The published entry point is stdio. The generated plugin contains its configuration in `agent-plugins/ngautopilot-tools/mcp.json`; hosts remain responsible for registration, approval, and execution of local MCP tools.

```bash
npm run agent-plugins:sync
npm run agent-plugins:validate
npm run agent-plugins:smoke
```

This repository does not ship an HTTP MCP server or a ChatGPT connector registration flow. ChatGPT web cannot connect to this local stdio process. A future HTTP deployment must provide its own authentication, TLS, request limits, and host controls before it is connected to any remote client.

## Codex CLI registration

Installing a pack does not register an MCP server. First install the npm package where the server can be resolved, then register its root MCP entry point with Codex:

```bash
npm install --global ngautopilot
# Replace <absolute-package-path> with the directory reported by `npm root -g` plus `/ngautopilot`.
codex mcp add ngautopilot -- node <absolute-package-path>/mcp/server-entry.mjs
```

The command writes the equivalent user configuration to `~/.codex/config.toml`:

```toml
[mcp_servers.ngautopilot]
command = "node"
args = ["<absolute-package-path>/mcp/server-entry.mjs"]
```

For a trusted project-specific configuration, put the same `[mcp_servers.ngautopilot]` block in `.codex/config.toml` and use an absolute server path appropriate for that project. The Agent Plugin's `mcp.json` describes MCP behavior for plugin-capable hosts; it does not register the npm package with Codex.

For current OpenAI guidance on connectors and skills, see [Connect and test a ChatGPT app](https://developers.openai.com/plugins/deploy/connect-chatgpt) and [Build skills](https://learn.chatgpt.com/docs/build-skills).

## Release check

Run `npm pack --dry-run --json` and confirm that `mcp/`, `lib/agent-plugins/`, and `agent-plugins/` are present while `skill-lab/` is absent.
