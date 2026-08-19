# npm Package Guide

The npm package is the cross-agent distribution. It contains the CLI, catalog, packs, adapters, skills, Agent Plugin artifacts, MCP entry point, and public documentation required to inspect or install NgAutoPilot without cloning this repository.

## One-off and global use

```bash
npm exec --package=ngautopilot -- ngautopilot doctor
npm exec --package=ngautopilot -- ngautopilot packs
npm install --global ngautopilot
ngautopilot help
```

Pin an exact version for reproducible automation. Use `npm exec` in CI rather than relying on a global installation.

## Verify a release artifact

```bash
npm run release:validate
npm pack --dry-run --json
```

The `package.json#files` allowlist controls the result. Confirm the JSON includes `bin/`, `lib/`, `mcp/`, `skills/`, `packs/`, `adapters/`, `agent-plugins/`, `docs/`, and release metadata. It must not include `skill-lab/`.

For an end-to-end local check, create the tarball outside fixture directories, install it in a temporary project, and run `npx ngautopilot doctor`. Do not commit tarballs or `node_modules/`.

## Install a focused pack

```bash
ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --dry-run
ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --yes
ngautopilot verify --agent codex --scope project
```

For Codex, project installs place skills in `.agents/skills/` and managed instructions in the project-root `AGENTS.md`. User installs place skills in `~/.agents/skills/` and instructions in `~/.codex/AGENTS.md`. Registering the bundled stdio MCP server is a separate step; follow [MCP and ChatGPT Integration](mcp-and-chatgpt.md#codex-cli-registration).

Run `ngautopilot packs --json` before selecting a pack. The public CLI supports named packs; it does not currently accept `--angular` or upgrade-range selectors.
