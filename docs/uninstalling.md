# Uninstalling NgAutoPilot

## Remove an installation

```bash
ngautopilot uninstall --agent codex --scope project
```

This removes only files listed in `.ngautopilot-manifest.json`. User-modified managed files are refused without `--force`.

## What is removed

- All SKILL.md files copied by NgAutoPilot
- Instruction files written by NgAutoPilot (e.g. AGENTS.md, CLAUDE.md)
- The `.ngautopilot-manifest.json` file (when the last managed file is removed)

## What is NOT removed

- Files the user created independently
- Files the agent created independently
- Files outside the install root

## Force removal

```bash
ngautopilot uninstall --agent codex --scope project --force
```

Removes all manifest-listed files regardless of user modifications.

## Dry run

```bash
ngautopilot uninstall --agent codex --scope project --dry-run
```

Shows which files would be removed without deleting anything.

## Remove the npm package

```bash
npm uninstall -g ngautopilot
```

This removes the CLI. It does not remove installed files from your projects. Run `uninstall` per project first.