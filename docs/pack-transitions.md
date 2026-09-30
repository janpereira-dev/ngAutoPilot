# Safe pack transitions

All known source and destination conflicts are preflighted before any removal or content write. A failed preflight leaves every installed file and the old manifest untouched, rather than partially switching packs. This is not a claim of transactional rollback for arbitrary operating-system failures.

The previous installation checksum is the ownership baseline. Being listed in a manifest is **not** permission to overwrite a local edit.

| Transition | Default behavior |
| --- | --- |
| Core to full, shared file unchanged | Update only when canonical content changed |
| Core to full, shared file locally edited | Preserve bytes, retain the original checksum, warn, return unsuccessful |
| Full to core, excluded file unchanged | Remove the owned file |
| Full to core, excluded file locally edited | Preserve it **and its ownership record**, warn, return unsuccessful |
| Managed instruction section edited | Preserve it and warn; unrelated surrounding prose remains user-owned |
| Dry run | Report the same conflicts without writing content or manifests |
| Explicit `--force` | Permit replacing edited content; malformed section markers still fail safely |

Preserved conflicts remain visible to `verify` as mismatches. Repeating an update must not adopt the edited bytes as a new canonical baseline. Uninstall also refuses to remove edited owned files unless explicitly forced.

## Recovery procedure

```bash
ngautopilot update --agent codex --pack ngautopilot-full --dry-run --json
ngautopilot backup --agent codex --json
# Read warnings and inspect the backup path before choosing to replace any edits.
ngautopilot update --agent codex --pack ngautopilot-full --yes --force --json
ngautopilot restore --backup <reported-backup-path> --agent codex --json
ngautopilot verify --agent codex --json
```

Backup is an explicit command, not an automatic promise or authorization to overwrite. Store the returned path securely: backups can contain local project instructions. Restoring edited bytes also restores their old ownership baseline, so a mismatch afterward can be expected rather than a restore failure.

Native exports follow a separate, stricter rule: conflict preflight refuses the entire content update and leaves the old export record intact. There is no export `--force` shortcut. Use a new output directory after reviewing conflicts.

Behavioral regression coverage lives in `tests/installer/installer.test.mjs` and `tests/installer/exporter.test.mjs`: core/full round trips, retries, excluded ownership, dry runs, bounded instructions, explicit force, backup, and byte-exact restore.

Supporting references, scripts, and assets inside selected skill directories participate in the same ownership checks. Binary assets are hashed, backed up, and restored as original bytes, never decoded/re-encoded as text. The recorded tool version comes from the installed NgAutoPilot package, not the receiving application\'s package.json. Native exports additionally bundle linked public documentation; canonical source installs preserve their original source layout.
