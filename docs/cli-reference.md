# NgAutoPilot CLI Reference

## Commands

### `ngautopilot help`

Show available commands and options.

### `ngautopilot list [--json]`

List all skills in the catalog.

### `ngautopilot packs [--json]`

List available packs with name, status, and audience.

### `ngautopilot adapters [--json]`

List available agent adapters with status and scope.

### `ngautopilot install`

Install a pack for an agent.

```bash
ngautopilot install \
  --agent codex \
  --pack ngautopilot-angular \
  --scope project \
  [--dry-run] [--yes] [--force] [--json]
```

| Flag | Description |
| --- | --- |
| `--agent <id>` | Required. Adapter id (codex, claude, opencode, copilot, cursor, gemini, generic, pi, hermes, openclaw). |
| `--pack <id>` | Required. Pack id (ngautopilot-core, ngautopilot-angular, ...). |
| `--scope project\|user` | Install scope. Default: project. |
| `--dry-run` | Show what would happen without writing. |
| `--yes` | Skip confirmation. |
| `--force` | Overwrite unmanaged files. |
| `--json` | Output JSON. |

### `ngautopilot update`

Update an existing installation with the latest skill sources.

```bash
ngautopilot update --agent codex --scope project [--pack <id>] [--dry-run] [--yes] [--force] [--json]
```

### `ngautopilot uninstall`

Remove managed files for an agent. User-modified files are refused without `--force`.

```bash
ngautopilot uninstall --agent codex --scope project [--dry-run] [--yes] [--force] [--json]
```

### `ngautopilot verify`

Verify installed files match the manifest checksums.

```bash
ngautopilot verify --agent codex --scope project [--json]
```

### `ngautopilot export`

Export a pack snapshot to a directory for manual installation on unsupported agents.

```bash
ngautopilot export --agent generic --pack ngautopilot-core --output ./export-dir [--json]
```

### `ngautopilot doctor`

Check catalog integrity, adapter count, and pack count.

### `ngautopilot backup`

Backup managed files to a temporary snapshot.

```bash
ngautopilot backup --agent codex --scope project [--json]
```

### `ngautopilot restore`

Restore from a backup snapshot.

```bash
ngautopilot restore --backup <path> [--agent <id>] [--scope project|user] [--json]
```

## Legacy commands (deprecated)

| Command | Replacement |
| --- | --- |
| `ngautopilot init` | `ngautopilot install --agent generic --pack ngautopilot-core` |
| `ngautopilot add <skill-id>` | `ngautopilot install --pack <pack-id>` |
| `ngautopilot adapter <name>` | `ngautopilot install --agent <name> --pack <pack-id>` |

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Success |
| 1 | Error (missing skill, verify failed, uninstall refused, unknown command) |