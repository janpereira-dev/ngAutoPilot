# MCP and ChatGPT Integration

<!-- docs:navigation:start -->
[Español](mcp-and-chatgpt.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Delivery routes have different contracts; verify host discovery, publication and MCP integration separately.](../assets/distribution-routes.svg)

NgAutoPilot ships a read-only stdio Model Context Protocol server as part of the `ngautopilot-tools` Agent Plugin. It reads bundled catalog and pack metadata; it does not edit applications, install dependencies, run migrations, or change Git state.

## Available tools

- `catalog.search` — find catalog skills.
- `pack.list` and `pack.resolve` — inspect packs and dependencies.
- `project.inspect` and `stack.detect` — inspect repository metadata.
- `skill.route`, `compatibility.check`, and `upgrade.plan` — select relevant guidance.
- `angular.resolve` — resolve Angular guidance from a minimized caller-supplied package manifest, optional npm lockfile evidence, and optional workspace-marker snapshot. It never accepts a project path or reads caller files.
- `repository.validate` — validate catalog and pack consistency.
- `angular.installation.resolve` — read local project evidence; keep this separate from caller snapshots.
- `platform.inventory` and `catalog.quality` — source inventory and deterministic structural signals.

## Supported transport

The published entry point is local read-only stdio. The generated plugin contains its configuration in `agent-plugins/ngautopilot-tools/mcp.json`; hosts remain responsible for registration, approval, and execution of local MCP tools.

```bash
npm run agent-plugins:sync
npm run agent-plugins:validate
npm run agent-plugins:smoke
```

This repository does not ship an HTTP MCP server or a ChatGPT connector registration flow. ChatGPT web cannot connect to this local stdio process. It includes an **opt-in, unbound HTTPS factory** for `POST /v1/angular/resolve`, documented in [`openapi.yaml`](../openapi.yaml), for an integrator that explicitly supplies TLS key/cert material and deny-by-default authorization. The factory is not a deployment or a connector registration; it accepts only the same minimized snapshot input as `angular.resolve`, applies request limits, and never opens workspace access.

HTTPS defaults are a 32 KiB body, a 5-second read timeout, 30 requests per address per 60-second window and at most 10,000 tracked addresses (`maxClients`). Expired windows are cleaned during requests. A full cache refuses new addresses with 429 instead of evicting active limits; idle handlers retain only bounded state. All limit settings must be positive safe integers. These application limits do not replace the deployment's network controls.

## Codex CLI registration

Installing a pack does not register an MCP server. First install the npm package where the server can be resolved, then register its root MCP entry point with Codex:

```bash
npm install --global ngautopilot
# Replace <absolute-package-path> with the directory reported by `npm root -g` plus `/ngautopilot`.
codex mcp add ngautopilot -- node "<absolute-package-path>/mcp/server-entry.mjs"
codex mcp list
```

The command writes the equivalent user configuration to `~/.codex/config.toml`:

```toml
[mcp_servers.ngautopilot]
command = "node"
args = ["<absolute-package-path>/mcp/server-entry.mjs"]
```

For a trusted project-specific configuration, put the same `[mcp_servers.ngautopilot]` block in `.codex/config.toml` and use an absolute server path appropriate for that project. The Agent Plugin's `mcp.json` describes MCP behavior for plugin-capable hosts; it does not register the npm package with Codex.

Official references reviewed on 2026-10-01: [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [Connect and test a ChatGPT app](https://developers.openai.com/plugins/deploy/connect-chatgpt), and [Build skills](https://learn.chatgpt.com/docs/build-skills). Check both configuration and connection state; installing a pack or listing a configured server alone does not prove tool execution.

## Release check

Run `npm pack --dry-run --json` and confirm that `mcp/`, `lib/agent-plugins/`, and `agent-plugins/` are present while `skill-lab/` is absent.
