# Uninstall without deleting your own work 🧹

<!-- docs:navigation:start -->
[Español](uninstalling.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

**Outcome:** remove NgAutoPilot-managed installation content, then optionally remove the CLI package.

## 1. Back up and preview

Run for the same agent and scope used at installation:

```bash
ngautopilot backup --agent codex --scope project
ngautopilot uninstall --agent codex --scope project --dry-run
```

Review the list before approving. Other independently created application files are outside the uninstall selection.

## 2. Approve removal

```bash
ngautopilot uninstall --agent codex --scope project --yes
```

Only manifest-owned files or the managed instruction section are removed. Modified managed files are refused without `--force`. Instructions outside NgAutoPilot's section stay in place. The manifest disappears when no managed files remain.

If removal is refused, inspect and save your changes. Only when you intend to discard them, repeat with `--yes --force`; forcing can delete edited managed files. Do not delete a whole agent directory to bypass the manifest.

## 3. Check the result

Inspect the reported removals and remaining files. A later `verify` can report a missing manifest after complete removal; that is not evidence that removal failed. Uninstall is per project/agent/scope: repeat only for other installations you actually want removed.

## 4. Remove the global package, if installed

```bash
npm uninstall --global ngautopilot
```

This removes the global CLI, not installed guidance in projects. For a project-local npm dependency, use the matching local package-management workflow instead. [Installation](installation.md) · [Updating and restore](updating.md).
