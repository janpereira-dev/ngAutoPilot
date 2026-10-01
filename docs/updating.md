# Update safely: back up before refreshing 🔄

<!-- docs:navigation:start -->
[Español](updating.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

**Important:** this branch refreshes selected manifest-owned files even when edited. It preserves modified obsolete files during pack switching unless forced, but that is a different operation. Do not rely on update as customization protection.

## 1. Keep the current selection

Run in the receiving project. Save the path printed by backup:

```bash
ngautopilot backup --agent codex --scope project
ngautopilot update --agent codex --scope project --dry-run
```

Preview the affected paths. Save important custom changes outside managed files and outside the NgAutoPilot instruction section.

## 2. Approve and verify

```bash
ngautopilot update --agent codex --scope project --yes
ngautopilot verify --agent codex --scope project
```

Without `--yes`, an update requiring approval does not write. Matching source contents are skipped. `--force` permits unmanaged overwrites and modified obsolete-file removal; it is not a shortcut for resolving a warning.

## 3. Update the CLI separately

`update` uses the sources available in the CLI package you are running; it does not download a new npm release automatically.

For a global CLI, use `npm install --global ngautopilot@<version>`; for one-off use, use `npm exec --package=ngautopilot@<version> -- ngautopilot help`. Replace `<version>` with a verified release. Do not confuse a local npm dependency with a globally available command.

Changing `--pack` changes the selection, not just its version. See [packs](packs.md).

## 4. Recover if needed

```bash
ngautopilot restore --backup <backup-path>
ngautopilot verify --agent codex --scope project
```

Replace the placeholder with the saved backup path and inspect the restored files. A snapshot restores managed files; it is not a backup of the whole application. [CLI reference](cli-reference.md) · [Troubleshooting](troubleshooting.md).
