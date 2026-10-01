# npm Package Guide

<!-- docs:navigation:start -->
[Español](npm-package-guide.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

The npm package is the cross-agent distribution. It contains the CLI, catalog, packs, adapters, skills, Agent Plugin artifacts, MCP entry point, and public documentation required to inspect or install NgAutoPilot without cloning this repository.

Unversioned examples use the package available in the registry. Features described here belong to this documented checkout; verify the exact published version before assuming availability.

## One-off and global use

```bash
npm exec --package=ngautopilot -- ngautopilot doctor
npm exec --package=ngautopilot -- ngautopilot packs
npm install --global ngautopilot
ngautopilot help
```

Pin an exact version for reproducible automation. Use `npm exec` in CI rather than relying on a global installation.

## Verify a release artifact

```bash
npm run release:validate
npm pack --dry-run --json
```

The `package.json#files` allowlist controls the result. Confirm the JSON includes `bin/`, `lib/`, `mcp/`, `skills/`, `packs/`, `adapters/`, `agent-plugins/`, `docs/`, and release metadata. It must not include `skill-lab/`.

For an end-to-end local check, create the tarball outside fixture directories, install it in a temporary project, and run `npm exec -- ngautopilot doctor` there. Do not commit tarballs or `node_modules/`. Inspect both public documentation editions in the archive.

## Install a focused pack

```bash
ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --dry-run
ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --yes
ngautopilot verify --agent codex --scope project
```

For Codex, project installs place skills in `.agents/skills/` and managed instructions in the project-root `AGENTS.md`. User installs place skills in `~/.agents/skills/` and instructions in `~/.codex/AGENTS.md`. Registering the bundled stdio MCP server is a separate step; follow [MCP and ChatGPT Integration](mcp-and-chatgpt.md#codex-cli-registration).

Run `ngautopilot packs --json` before selecting a pack. Named packs remain the
right choice when you need an exact pack or version-hop pack. For project-aware
Angular installation, use the mutually exclusive `--angular` mode:

```bash
ngautopilot install --agent codex --angular 22 --profile essentials --scope project --dry-run
ngautopilot install --agent codex --angular 22 --profile essentials --scope project --yes
```

Profiles are `essentials`, `architecture`, `performance`, `testing`,
`migration`, and `core`. `--profile` and `--capabilities` require `--angular`;
they cannot be combined with `--pack`. `--dry-run` never writes, and `--yes`
is required to approve a write.

For narrower testing/UI guidance, select `--profile testing --capabilities ui,testing` and review a dry-run with that same selection first. Back up edited managed files before updating or switching packs: reinstalling can refresh managed content. See [Updating](updating.md).

Migration commands are controlled evidence gates, not source transformers:

```bash
ngautopilot migrate setup --from 12 --to 22 --agent codex --yes
ngautopilot migrate run --plan .ngautopilot/migration-plan.json --agent codex --yes
ngautopilot migrate resume --run <run-id> --agent codex --yes
ngautopilot work plan --goal "Inspect Angular tests" --agent codex --yes --dry-run
```

`migrate setup` (also `migrador`) creates an approved plan only. `migrate run`
validates at most one hop and stops at `awaiting-executor` when no authorized
transformer exists; `resume` revalidates the checkpoint and cannot bypass a
failed or blocked gate. `work plan` is an approval-gated, read-only assignment
limited to inventory, inspection, validation, and reporting.
