# Agent Installation Matrix

NgAutoPilot uses one catalog and pack policy across supported clients. The adapter controls destination layout and instruction filenames; it does not configure the host client itself.

## Recommended flow

Run the commands from the receiving project. Always inspect the plan first:

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --dry-run
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --yes
npm exec --package=ngautopilot -- ngautopilot verify --agent codex --scope project
```

For a multi-major migration, install and validate each named hop in order; the CLI does not currently accept an Angular-version or upgrade-range selector.

## Compatibility matrix

| Client | Adapter ID | Status | Project destination | Instruction file |
| --- | --- | --- | --- | --- |
| Claude Code | `claude` | native | `.claude/` | `CLAUDE.md` |
| OpenAI Codex | `codex` | native | `.codex/` | `AGENTS.md` |
| GitHub Copilot | `copilot` | adapter | `.github/copilot/` | `copilot-instructions.md` |
| Cursor | `cursor` | adapter | `.cursor/` | `.cursorrules` |
| Gemini CLI | `gemini` | adapter | `.gemini/` | `GEMINI.md` |
| OpenCode | `opencode` | native | `.opencode/` | `opencode.json` |
| OpenClaw | `openclaw` | experimental | `.openclaw/` | `openclaw.json` |
| Pi | `pi` | unverified | `.pi/` | `PI.md` |
| Hermes Agent | `hermes` | unverified | `.hermes/` | `HERMES.md` |
| Generic Markdown client | `generic` | export-only | chosen export directory | `AGENTS.md` |

Treat `ngautopilot adapters --json` as the machine-readable source of truth. Experimental and unverified adapters require host-specific verification before team-wide use.

## Pack selection

- Use `ngautopilot-angular` for broad Angular development.
- Use a named `ngautopilot-angular-<from>-to-<to>` pack for one historical upgrade hop.
- Use `ngautopilot-angular-upgrades` for the complete upgrade guidance set.
- Use `ngautopilot export --agent generic --pack <id> --output <dir>` when the client lacks a native adapter.

Pack switching removes only unchanged managed files. Modified managed files are preserved and reported unless `--force` is used explicitly.
