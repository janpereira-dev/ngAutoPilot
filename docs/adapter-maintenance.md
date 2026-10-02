# Adapter maintenance and native exports

<!-- docs:navigation:start -->
[Español](adapter-maintenance.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

## Authoritative contract

`adapters/native-layouts.json` is the native **project/workspace export** contract for all ten registered adapters. Every entry links to first-party discovery and instruction documentation. The independent expectations in `tests/installer/exporter.test.mjs` exercise the actual CLI, portable frontmatter, supporting resources, hashes, repeated exports, and conflict refusal.

| Adapter | Exported skills root | Exported instruction file |
| --- | --- | --- |
| Claude Code | `.claude/skills` | `CLAUDE.md` |
| Codex | `.agents/skills` | `AGENTS.md` |
| Copilot | `.github/skills` | `.github/copilot-instructions.md` |
| Cursor | `.cursor/skills` | `AGENTS.md` |
| Gemini | `.gemini/skills` | `GEMINI.md` |
| Generic | `skills` | `AGENTS.md` |
| Hermes | `.hermes/skills` | `AGENTS.md` |
| OpenClaw | `skills` | `AGENTS.md` |
| OpenCode | `.opencode/skills` | `AGENTS.md` |
| Pi | `.agents/skills` | `AGENTS.md` |

OpenClaw exports belong in the configured **agent workspace**, not its configuration directory. Hermes project skills require explicit host project trust. Generic discovery is consumer-defined. No export grants trust, starts an agent, or establishes runtime compatibility.

Both entrypoints use the same engine:

```bash
ngautopilot export --agent copilot --pack ngautopilot-angular-testing --output ./copilot-export --json
npm run skills:export -- copilot ngautopilot-angular-testing ./copilot-export
```

The destination is a project-shaped snapshot. Review it before copying. Merge instructions deliberately rather than overwriting an existing project instruction file. An export is not an install: `.ngautopilot-export.json` records checksums but is not consumed by `uninstall`. Native subagent configurations are deliberately not exported; canonical role Markdown is not interchangeable with every host's subagent schema.

Skills are flattened by stable portable ID to prevent ambiguous host discovery and name collisions. Names over 64 characters use a deterministic shortened prefix plus a 12-character SHA-256 suffix. The original ID remains in metadata. Supporting assets retain their bytes; repository-external Markdown links are bundled inside the skill and rewritten to local references. The source tree is never renamed or modified.

## Existing installs and migration boundary

Legacy `install` layouts remain separate from the native export contract. Codex already has split project/user discovery roots; other adapters may retain historical instruction or discovery locations. Do **not** claim the legacy matrix proves current native loading. OpenCode/OpenClaw instruction output is Markdown `AGENTS.md`, never Markdown masquerading as JSON configuration.

Do not silently replace an existing installation with a native snapshot. A migration requires: identify the old owned manifest, back up the original bytes, map paths, compare original checksums, preserve local edits and unrelated instructions, refuse destination conflicts, and test verify/uninstall/restore at both roots. Changing a manifest path without this sequence can orphan managed files.

## Quarterly review

`.github/workflows/adapter-audit.yml` runs at 09:00 UTC on January, April, July, and October 1, and supports manual dispatch. It opens one tracking issue unless a review is already open. A maintainer owns the issue and must:

1. Re-read every linked first-party source, including trust, precedence, scope, skill naming, and instruction loading rules.
2. Record documentation/host versions and changes in the issue. Update `reviewedOn` only after actually reviewing all ten adapters.
3. Update the registry, this table, and the independent integration assertions together.
4. Run `node scripts/audit-adapters.mjs --check-age`, `npm run test:scripts`, and `npm test`.
5. Attach real host discovery/invocation evidence when changing a runtime-support claim. Otherwise retain `hostInvocation: not-verified`.
6. Close the issue only after its evidence-linked change is merged.

The audit script validates coverage and generates a review checklist; it does not scrape docs, infer support, or silently refresh review dates. `--check-age` fails after 100 days so a maintainer can detect overdue reviews. Scheduled workflows become active only after their source is merged into the default branch.

Native instruction exports use `adapters/native-instructions.template.md` and `NGAUTOPILOT-CATALOG.json`, whose paths point only to emitted skills. Historical source-tree and missing-subagent routes are not copied into native instructions. The catalog pointer is relative to the instruction file, including Copilot\'s nested instruction directory.
