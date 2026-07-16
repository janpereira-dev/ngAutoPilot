# NgAutoPilot Trust Levels

## Classification

Every NgAutoPilot capability is classified by risk:

| Level | Description | Default policy |
| --- | --- | --- |
| `documentation` | Markdown-only guidance an agent reads for context | permitted |
| `local-readonly` | Reading files and configuration | permitted |
| `local-write` | Writing or modifying files in the project directory | requires visible plan |
| `network-read` | Fetching documentation or data from the internet | requires declaration |
| `network-write` | Sending data to external services | requires explicit confirmation |
| `deployment` | Publishing, deploying, or pushing to remote | blocked by default |
| `credential-sensitive` | Handling tokens, secrets, or credentials | blocked by default |

## Skill risk assessment

All NgAutoPilot skills are `documentation` or `local-readonly` by design. They are Markdown files that provide guidance to AI agents. No skill executes code, makes network requests, or modifies files directly. The agent reads the skill and decides what to do.

The installer (`bin/ngautopilot.mjs`) is `local-write`. It creates files inside the declared install root only. It never writes outside the project directory or user-scope install base.

## What NgAutoPilot does NOT do

- No `postinstall` script in `package.json`.
- No `curl | sh` patterns.
- No bundled binaries.
- No network access during install (offline mode available with `--offline` concept via `ngautopilot export`).
- No telemetry.
- No credential handling.
- No remote code execution.

## Installer safety guarantees

| Guarantee | How |
| --- | --- |
| No path traversal | `safe-fs.mjs` resolves all paths through `createRootGuard`; `..` segments are rejected. |
| No symlink escape | `safe-fs.mjs` uses `lstatSync` and `realpathSync` with containment checks. |
| No overwrite of user files | Installer reads `.ngautopilot-manifest.json`; refuses unmanaged files without `--force`. |
| Idempotent | Re-running `install` skips identical files (SHA-256 match). |
| Reversible | `uninstall` removes only manifest-owned files. |
| Backup before modify | `backup` command snapshots the install before destructive operations. |
| Restore | `restore` command re-applies a backup snapshot. |

## What to audit

When reviewing NgAutoPilot skills for safety:

1. Check that no skill instructs the agent to execute `curl | sh`, download scripts, or run `npx` with untrusted packages.
2. Check that no skill hardcodes secrets, tokens, or private URLs.
3. Check that no skill assumes a specific OS, shell, or absolute path.
4. Check that installer code uses `safe-fs.mjs` exclusively for filesystem operations.
5. Check that the `.ngautopilot-manifest.json` is present after install and accurate after update.