# Troubleshooting: find the failing layer 🔧

<!-- docs:navigation:start -->
[Español](troubleshooting.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Inspect, choose, approve, validate, report evidence and limits.](../assets/learning-route.svg)

Start with the exact command, installed version, agent, scope, and error output. Do not hide a conflict by adding `--force`.

## Quick diagnosis

| Symptom | Check first | Safe next action |
| --- | --- | --- |
| Command not found | Global vs local vs one-off CLI | Use the matching `npm exec` invocation or local binary |
| Unsupported Node | Installed package's engine requirement | Use a supported environment; do not change app dependencies blindly |
| No files after install | Approval or `--dry-run` | Inspect the plan, then use `--yes` |
| Missing/unknown agent or pack | `adapters` and `packs` output | Copy an exact listed ID |
| Unsupported user scope | Adapter's scope list | Use project scope or a supported adapter |
| Verification mismatch | Edited managed files | Back up and compare; do not immediately overwrite |
| Missing files | Manifest-listed paths | Preview a reinstall using the same selection |
| Agent cannot find skills | Installed destination and host discovery | Check adapter paths and reopen/reload as required by the host |
| Migration blocked | Checkpoint and evidence | Resolve the actual gate; `resume` cannot skip it |

## Install did not write

`--dry-run` never writes. An operation needing approval without `--yes` returns an approval requirement. Old `init` examples are deprecated; use:

```bash
ngautopilot install --agent codex --pack ngautopilot-core --scope project --dry-run
```

Only after inspecting the plan, repeat with `--yes` instead of `--dry-run`.

## Verification or uninstall warnings

`verify` checks files against the manifest, not application tests. Missing files and edited contents are different problems. Back up before reinstalling or updating: desired managed files are preserved when locally edited unless explicitly forced.

Uninstall refuses modified managed files without force. Keep them, copy the modifications elsewhere, or deliberately remove them with `--yes --force` after backup. [Updating](updating.md) · [Uninstalling](uninstalling.md).

## Codex discovery and MCP

Project skills: `.agents/skills/`; instructions: root `AGENTS.md`. User skills: `~/.agents/skills/`; instructions: `~/.codex/AGENTS.md`. This installer does not use `.codex/skills/` as its destination.

MCP registration is separate. Installing a skill pack does not register its server. [MCP registration](mcp-and-chatgpt.md#codex-cli-registration).

## Maintainer consistency failures

Read the validation output; possible causes include mismatched catalog counts, missing bundle coverage, invalid manifests, draft skills, or scaffold placeholders. For source changes:

```bash
npm run skills:catalog
npm run plugins:sync
npm run agent-plugins:sync
npm run consistency:validate
```

Inspect generated diffs. Do not edit generated copies by hand.

## Windows hooks

The pre-commit hook is Bash and requires Git Bash on Windows. `npm run hooks:install` configures Git's hook path; it **does not convert the hook into Node.js**. If that runtime is unavailable, run the validation commands manually and report the limitation. [Cross-platform guide](cross-platform.md).

## Stop-hook errors

NgAutoPilot does not ship a stop hook. Inspect the host's hook configuration and logs before attributing a stop-hook JSON error to this package. Do not delete global configuration or expose tokens while diagnosing.

**Still stuck?** Provide a sanitized command, version, scope, and error—not credentials or private project files.
