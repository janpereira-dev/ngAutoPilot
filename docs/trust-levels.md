# NgAutoPilot Trust Levels

<!-- docs:navigation:start -->
[Español](trust-levels.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

## Classification

Every NgAutoPilot capability is classified by risk:

This table is review guidance, not an automatic permission system. Host policy
and user authorization remain the actual control boundary.

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

The skill files themselves are Markdown guidance; they do not directly execute
code or make requests. The operations they recommend may involve local writes,
network access, or publishing. Classify the intended action, not just its
Markdown container. The host's permissions and the user's authorization remain
the actual control boundary.

The installer (`bin/ngautopilot.mjs`) is `local-write`. Apply/uninstall use
adapter-declared roots. Backup snapshots use a separate temporary destination
and restore reads that snapshot; backups are not read-only operations.

## Installer and package behavior

- No `postinstall` script in `package.json`.
- Guidance must not recommend untrusted remote execution pipelines.
- The installer reads packaged sources locally. Acquiring npm packages may require the network. Use `export` for an offline snapshot; this branch has no `--offline` flag.
- No telemetry.
- No embedded credentials. The optional HTTPS integration has a separate caller-supplied TLS/authorization contract.
- No remote code execution.

## Installer safety guarantees

| Guarantee | How |
| --- | --- |
| Bounded paths | `safe-fs.mjs` resolves paths through `createRootGuard` and rejects escapes from the intended root. |
| No symlink escape | `safe-fs.mjs` uses `lstatSync` and `realpathSync` with containment checks. |
| Unmanaged-file overwrite protection | Installer refuses unmanaged files without `--force`; desired managed files are preserved when locally edited unless explicitly forced. Back up before update. |
| Idempotent | Re-running `install` skips identical files (SHA-256 match). |
| Reversible | `uninstall` removes only manifest-owned files. |
| Managed-file snapshot | `backup` snapshots managed files; it is not a backup of the entire application. |
| Restore | `restore` command re-applies a backup snapshot. |

## What to audit

When reviewing NgAutoPilot skills for safety:

1. Check that no skill instructs the agent to execute `curl | sh`, download scripts, or run `npx` with untrusted packages.
2. Check that no skill hardcodes secrets, tokens, or private URLs.
3. Check that no skill assumes a specific OS, shell, or absolute path.
4. Check that installer code uses `safe-fs.mjs` exclusively for filesystem operations.
5. Check that the `.ngautopilot-manifest.json` is present after install and accurate after update.
