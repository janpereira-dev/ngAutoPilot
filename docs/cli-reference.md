# NgAutoPilot CLI Reference

<!-- docs:navigation:start -->
[Español](cli-reference.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

**Find the action, inspect its options, then approve writes.** This reference describes the current checkout. Check `ngautopilot help` for your installed package or `node bin/ngautopilot.mjs help` inside this repository for branch features.

## Quick path

1. List adapters and packs.
2. Preview writes with `--dry-run`.
3. Apply with `--yes`, then verify.

Replace placeholders such as `<id>`, `<path>`, and `<run-id>`. Brackets in syntax examples indicate optional arguments; do not paste them literally.

## Commands

### `ngautopilot help`

Show available commands and options.

### `ngautopilot list [--json]`

List all skills in the catalog.

### `ngautopilot packs [--json]`

List available packs with name, status, and audience.

### `ngautopilot adapters [--json]`

List available agent adapters with status and scope.

### `ngautopilot angular [--target <major[.minor]>] [--profile <profile>] [--capabilities <comma-list>] [--json]`

Resolve compatible **non-migration** skills for the Angular project at the
current directory, and report the unfiltered source packs that selected them.
The command reads the nearest `package.json` and a
supported lockfile when available. It writes nothing.

```bash
ngautopilot angular --profile core --capabilities ui,testing --json
```

Profiles: `core`, `essentials`, `architecture`, `performance`, `testing`, and
`migration`. Capabilities: `foundations`, `runtime`, `state`, `testing`, and
`ui`. `--target` must agree with lockfile-confirmed Angular evidence, or with
all declared Angular ranges when no lockfile is present.

This resolver does not install files and intentionally excludes upgrade hops
and modernization. Its source-pack list is not an install plan: do not install
one of those unfiltered packs when the resolution has exclusions. Install a
named `ngautopilot-angular-<from>-to-<to>` pack only for the explicit, bounded
migration step.

### `ngautopilot platform [--json]`

Report catalog families, Angular upgrade-hop coverage, packs, adapters,
subagents, distribution surfaces, and deterministic quality totals without
writing files.

### `ngautopilot quality [--json]`

Report structural content signals for every source skill. It verifies no
semantic usefulness by itself; use the Skill Lab and human review before
promoting a changed skill.

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
ngautopilot install --agent codex --angular 22 --profile essentials --yes
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
| `--yes` | Approve the write; required when the plan needs approval. |
| `--force` | Permit unmanaged overwrites and removal of modified obsolete managed files. Does not replace approval. |
| `--json` | Output JSON. |

Dependencies are resolved automatically. Installing a different pack at the same agent and scope removes prior unchanged obsolete managed files; modified obsolete files are preserved and reported unless forced. Desired managed files can still be refreshed even if edited.

`--dry-run` never writes. Without `--yes`, an install that needs confirmation reports an approval requirement and does not write; `--yes` applies the approved plan. Desired managed files can be refreshed even if edited in this branch. Back up before reinstalling or updating. Modified obsolete-file removal and desired-file refresh have different policies.

### `ngautopilot update`

Update an existing installation using sources from the CLI package you are running. This does not automatically download a new npm release.

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
