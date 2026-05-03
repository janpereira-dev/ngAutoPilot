# CLI Reference

NgAutoPilot ships a small distribution CLI. The product is still the catalog; the CLI is the packaging and installation surface.

## Command Name

- npm package: `ngautopilot`
- CLI command: `ngautopilot`
- generated folder: `.ngautopilot/`

## Commands

### `ngautopilot help`

Shows available commands and examples.

### `ngautopilot list`

Prints all catalog skill IDs and paths from `catalog.json`.

### `ngautopilot init`

Creates `.ngautopilot/` in the current working directory and copies:

- `skills/`
- `adapters/`
- `catalog.json`

### `ngautopilot add <skill-id>`

Copies a single skill from the installed package into `.ngautopilot/`.

Example:

```bash
ngautopilot add angular.performance.onpush-change-detection
```

### `ngautopilot adapter <codex|copilot|claude|cursor|gemini|generic>`

Copies one adapter template into `.ngautopilot/adapters/`.

Example:

```bash
ngautopilot adapter codex
```

### `ngautopilot doctor`

Checks that every `catalog.json` entry exists inside the installed package.

## Recommended Invocation

Use `npm exec` when you want an exact package resolution:

```bash
npm exec --package=ngautopilot -- ngautopilot help
```

## Notes

- The CLI intentionally stays small.
- Validation, catalog generation, bundles, and release checks stay in npm scripts.
- Marketplace management for Codex and Claude Code is documented separately because local CLI support differs by tool and version.
