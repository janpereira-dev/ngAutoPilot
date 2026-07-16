# NgAutoPilot Installation

## Prerequisites

- Node.js >= 18.18.0
- An AI agent that reads Markdown instructions (Codex, Claude Code, OpenCode, Copilot, Cursor, Gemini, or any AGENTS.md consumer)

## Quick install (project scope)

```bash
# Install Core pack for Codex
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-core --scope project

# Install Angular pack for Claude Code
npm exec --package=ngautopilot -- ngautopilot install --agent claude --pack ngautopilot-angular --scope project
```

## Quick install (user scope)

```bash
# Install Core for OpenCode globally
npm exec --package=ngautopilot -- ngautopilot install --agent opencode --pack ngautopilot-core --scope user
```

## What happens

1. NgAutoPilot reads the pack definition from `packs/<pack-id>.json`.
2. It matches skills from `catalog.json` by ID prefix.
3. It computes the install root for the selected agent and scope.
4. It creates a backup if one does not exist.
5. It copies skill files into the install root.
6. It writes an instruction file (e.g. `AGENTS.md`, `CLAUDE.md`) if the adapter provides a template.
7. It writes `.ngautopilot-manifest.json` listing every file with a SHA-256 checksum.

## Idempotency

Re-running `install` with the same pack and agent is safe. Files with matching checksums are skipped. No duplication occurs.

## Dry run

```bash
ngautopilot install --agent codex --pack ngautopilot-angular --dry-run
```

Shows what would happen without writing any files.

## Force

```bash
ngautopilot install --agent codex --pack ngautopilot-angular --force
```

Overwrites files that NgAutoPilot did not create. Use with caution.

## Update

```bash
ngautopilot update --agent codex --scope project
```

Updates an existing installation with the latest skill sources. Preserves user-modified files unless `--force` is passed.

## Uninstall

```bash
ngautopilot uninstall --agent codex --scope project
```

Removes only files listed in `.ngautopilot-manifest.json`. User-modified managed files are refused unless `--force` is passed. The manifest is removed when the last managed file is gone.

## Verify

```bash
ngautopilot verify --agent codex --scope project
```

Checks every file in the manifest exists and its SHA-256 matches the recorded checksum.

## Backup and restore

```bash
ngautopilot backup --agent codex --scope project
ngautopilot restore --backup <backup-path>
```

## Export (for unsupported agents)

```bash
ngautopilot export --agent generic --pack ngautopilot-core --output ./ngautopilot-export
```

Produces a portable directory with skills, an instruction file, and a README. Copy it into your project manually.

## Offline install

NgAutoPilot does not access the network during install. The `export` command produces a self-contained snapshot that can be copied to an offline machine.
