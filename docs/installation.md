# NgAutoPilot Installation

## Prerequisites

- Node.js >= 18.18.0
- An AI agent with a matching adapter: Claude, Codex, Copilot, Cursor, Gemini, Hermes, OpenClaw, OpenCode, Pi, or generic Markdown export

## Choose Installation Path

Use the NgAutoPilot CLI for bounded installation across supported adapters. `npx skills add janpereira-dev/ngAutoPilot` exposes the entire repository because the third-party `skills` CLI has no pack-selection contract; `skills.sh.json` affects only the web page.

Start by listing exact adapters and packs:

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
```

Read [Pack Selection](packs.md) before choosing an Angular version hop or domain pack.

## Quick Install: Project Scope

```bash
# Inspect Angular 21 to 22 plan for Codex
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-21-to-22 --scope project --dry-run

# Apply the inspected plan
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-21-to-22 --scope project --yes
```

## Quick Install: User Scope

```bash
# Install Signals and RxJS guidance for OpenCode globally
npm exec --package=ngautopilot -- ngautopilot install --agent opencode --pack ngautopilot-angular-state --scope user --yes
```

## What happens

1. NgAutoPilot resolves selected pack and its dependencies from `packs/<pack-id>.json`.
2. It matches skills from `catalog.json` by ID prefix.
3. It computes the install root for selected adapter and scope.
4. It removes unchanged files owned by prior selected pack at same location.
5. It copies selected skill files into install root.
6. It writes instruction file such as `AGENTS.md`, `CLAUDE.md`, or `PI.md` when adapter provides template.
7. It writes `.ngautopilot-manifest.json` with SHA-256 checksum for every managed file.

## Switching Packs

Use one focused pack for current task. Installing a different pack for same agent and scope switches managed selection: files from prior pack are removed only when their checksum matches manifest. User-modified files are preserved and reported. Run `--dry-run` before every switch.

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
