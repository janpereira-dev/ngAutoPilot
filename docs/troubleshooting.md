# Troubleshooting

## `init` is deprecated

Use `install` instead:

```bash
ngautopilot install --agent codex --pack ngautopilot-core --scope project
```

## `Error: --agent is required`

List available agents:

```bash
ngautopilot adapters
```

## `Error: --pack is required`

List available packs:

```bash
ngautopilot packs
```

## `Error: Adapter "X" does not support scope "user"`

Not all adapters support user scope. Check the adapter matrix:

```bash
ngautopilot adapters
```

Adapters with `scope=project` only (Copilot, Cursor, Pi, Hermes, OpenClaw) cannot install to user scope.

## `uninstall refused: user modified since install`

The file was edited after NgAutoPilot installed it. The installer refuses to delete user-modified files. Options:

- Keep the file: ignore the warning.
- Force removal: `ngautopilot uninstall --agent <id> --force`.
- Backup first: `ngautopilot backup --agent <id>` before `--force`.

## `verify failed: missing files`

Files listed in the manifest were deleted after install. Re-run `install` to restore them.

## `verify failed: mismatches`

Files were modified after install. Re-run `install` to update them, or `update` to refresh.

## Codex does not discover installed skills

For a project-scoped Codex install, skills must be under `.agents/skills/` and the managed instruction file is `AGENTS.md` at the repository root. For a user install, skills are under `~/.agents/skills/` and instructions are in `~/.codex/AGENTS.md`. Re-run the current installer if an older release placed skills under `.codex/skills/`.

MCP registration is independent of skill installation. Register the bundled stdio server with `codex mcp add`; see [MCP and ChatGPT Integration](mcp-and-chatgpt.md#codex-cli-registration).

## No namespace conflicts

If `npm run consistency:validate` fails, a skill exists in the catalog but not in any plugin bundle, or vice versa. Run:

```bash
npm run skills:catalog
npm run plugins:sync
npm run consistency:validate
```

## Pre-commit hook fails on Windows

`.githooks/pre-commit` is a Bash script. On Windows, it requires Git Bash (bundled with Git for Windows). Alternatively:

```bash
npm run hooks:install
```

This installs the hooks via Node.js where available.

## Stop hook error (`invalid stop hook JSON output`)

This is **not** a NgAutoPilot issue. NgAutoPilot does not ship a stop hook. The error originates from your AI agent's global configuration (e.g. `~/.config/opencode/tui.json`). Check for missing or broken TUI plugin references in your agent config.
