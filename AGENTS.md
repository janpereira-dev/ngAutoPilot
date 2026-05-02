# NgAutoPilot Agent Instructions

This repository is a catalog of reusable micro-skills and plugin bundles for AI coding agents.

## Operating rules

- Inspect the repository before editing.
- Prefer the smallest reversible change.
- Do not invent APIs, commands, or compatibility data.
- Keep Angular upgrade hops separate from modernization work.
- Do not add dependencies unless they are required for the task.
- Preserve the separation between source skills in `skills/` and distributable bundles in `plugins/`.

## Repo layout

- `skills/` is the source catalog.
- `plugins/` contains distributable plugin bundles.
- `.claude-plugin/marketplace.json` is the Claude Code marketplace manifest.
- `.agents/plugins/marketplace.json` is the Codex marketplace manifest.

## Validation

- Use the existing `npm run skills:validate` and `npm run skills:catalog` scripts for catalog changes.
- Use `claude plugin validate .` for Claude marketplace validation.
- For Codex, validate the marketplace manifest structure directly and keep the docs aligned with the installed CLI.

## Change policy

- Avoid broad refactors when a narrow fix will do.
- Do not move or rename large skill trees without a follow-up migration plan.
- Keep public docs honest about what the local CLI actually supports.
