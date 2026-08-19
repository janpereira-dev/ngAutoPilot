# MCP and ChatGPT Integration

NgAutoPilot ships a read-only stdio Model Context Protocol server as part of the `ngautopilot-tools` Agent Plugin. It reads bundled catalog and pack metadata; it does not edit applications, install dependencies, run migrations, or change Git state.

## Available tools

- `catalog.search` — find catalog skills.
- `pack.list` and `pack.resolve` — inspect packs and dependencies.
- `project.inspect` and `stack.detect` — inspect repository metadata.
- `skill.route`, `compatibility.check`, and `upgrade.plan` — select relevant guidance.
- `repository.validate` — validate catalog and pack consistency.

## Supported transport

The published entry point is stdio. The generated plugin contains its configuration in `agent-plugins/ngautopilot-tools/mcp.json`; hosts remain responsible for registration, approval, and execution of local MCP tools.

```bash
npm run agent-plugins:sync
npm run agent-plugins:validate
npm run agent-plugins:smoke
```

This repository does not ship an HTTP MCP server or a ChatGPT connector registration flow. A future HTTP deployment must provide its own authentication, TLS, request limits, and host controls before it is connected to any remote client.

For current OpenAI guidance on connectors and skills, see [Connect and test a ChatGPT app](https://developers.openai.com/plugins/deploy/connect-chatgpt) and [Build skills](https://learn.chatgpt.com/docs/build-skills).

## Release check

Run `npm pack --dry-run --json` and confirm that `mcp/`, `lib/agent-plugins/`, and `agent-plugins/` are present while `skill-lab/` is absent.
