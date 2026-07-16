# Updating NgAutoPilot

## Update an installation

```bash
ngautopilot update --agent codex --scope project
```

This re-reads the pack from the manifest, plans the latest skill sources, and applies changes. Files with matching SHA-256 checksums are skipped. User-modified files are refused unless `--force` is passed.

## Update from a new NgAutoPilot version

```bash
# Update the package
npm install ngautopilot@latest

# Re-run install (same pack, same agent)
ngautopilot install --agent codex --pack ngautopilot-core --scope project
```

## Check what changed

```bash
ngautopilot update --agent codex --scope project --dry-run
```

## Backup before update

```bash
ngautopilot backup --agent codex --scope project
ngautopilot update --agent codex --scope project
```

## After update

```bash
ngautopilot verify --agent codex --scope project
```

## Rollback

```bash
ngautopilot restore --backup <backup-path>
```