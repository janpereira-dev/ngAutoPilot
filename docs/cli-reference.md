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

Install either a named pack or an Angular-version-aware profile for an agent.

```bash
ngautopilot install \
  --agent codex \
  --pack ngautopilot-angular \
  --scope project \
  [--dry-run] [--yes] [--force] [--json]
```

For Angular-aware installation, replace `--pack` with `--angular` and choose a
profile:

```bash
ngautopilot install --agent codex --angular 22 --profile essentials --dry-run
ngautopilot install --agent codex --angular 22 --profile testing --capabilities ui,testing --yes
```

| Flag | Description |
| --- | --- |
| `--agent <id>` | Required. Adapter ID: `claude`, `codex`, `copilot`, `cursor`, `gemini`, `generic`, `hermes`, `openclaw`, `opencode`, or `pi`. Run `ngautopilot adapters` for scope and status. |
| `--pack <id>` | Select one named pack. Mutually exclusive with `--angular`, `--profile`, and `--capabilities`. Use this for an explicit pack or a version-hop pack. |
| `--angular <major[.minor]>` | Resolve the project's Angular and toolchain evidence and compose a compatible installation. Mutually exclusive with `--pack`. |
| `--profile <name>` | Angular profile: `essentials`, `architecture`, `performance`, `testing`, `migration`, or `core`. Requires `--angular`. |
| `--capabilities a,b` | Additional Angular capabilities. Requires `--angular`; use comma-separated capability IDs. |
| `--scope project\|user` | Install scope. Default: project. |
| `--dry-run` | Show what would happen without writing. |
| `--yes` | Skip confirmation. |
| `--force` | Overwrite unmanaged files. |
| `--json` | Output JSON. |

Dependencies are resolved automatically. Installing a different pack at same agent and scope removes prior unchanged managed files; user-modified files are preserved and reported.

`--dry-run` never writes. Without `--yes`, an install that needs confirmation reports an approval requirement and does not write; `--yes` applies the approved plan. `--force` only affects unmanaged-file overwrite behavior.

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

## Angular migration gates

### `ngautopilot migrate setup`

Prepare an approved Angular major-hop plan without changing source, packages, or
Git state. The alias `ngautopilot migrador` has the same contract.

```bash
ngautopilot migrate setup --from 12 --to 22 --agent codex --yes --dry-run
ngautopilot migrador --from 12 --to 22 --agent codex --yes
```

Setup is plan-only: it records evidence and ordered hop guidance; it is not a
code migration. Omit `--yes` to inspect the approval-required response. Use
`--dry-run` to avoid writing `.ngautopilot/migration-plan.json`.

### `ngautopilot migrate run` and `resume`

Run validates at most one approved hop and persists a checkpoint. It does not
claim to transform Angular source. When no authorized executable transformer is
available, the run stops at `awaiting-executor` and records a blocked gate.

```bash
ngautopilot migrate run --plan .ngautopilot/migration-plan.json --agent codex --yes
ngautopilot migrate resume --run <run-id> --agent codex --plan .ngautopilot/migration-plan.json --yes
```

`resume` revalidates the persisted evidence and cannot bypass a failed or
blocked gate. It cannot advance to another hop while the current checkpoint is
blocked.

## Bounded work planning

### `ngautopilot work plan`

Prepare an approval-gated, read-only assignment for inventory, inspection,
validation, or reporting. It does not execute the goal or permit arbitrary shell,
Git, package, or source changes.

```bash
ngautopilot work plan --goal "Review Angular tests and quality" --agent codex --yes --dry-run
ngautopilot work plan --goal "Review Angular tests and quality" --agent codex --yes
```

Without `--yes`, the command returns `approval-required`; `--dry-run` never
writes `.ngautopilot/work-plan.json`.

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
