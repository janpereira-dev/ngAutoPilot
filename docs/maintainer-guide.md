# Maintainer Guide

This document is for repository maintenance, catalog governance, packaging, and release operations. The public landing page stays in the root `README.md`.

## Repository Layout

- `skills/` is the source catalog.
- `plugins/` contains distributable plugin bundles.
- `adapters/` contains export templates for agent ecosystems.
- `docs/` contains user-facing and maintainer-facing documentation.
- `.claude-plugin/marketplace.json` is the Claude Code marketplace manifest.
- `.agents/plugins/marketplace.json` is the Codex marketplace manifest.

## Operating Rules

- Inspect the repository before editing.
- Prefer the smallest reversible change.
- Do not invent APIs, commands, or compatibility data.
- Keep Angular upgrade hops separate from modernization work.
- Do not add dependencies unless they are required for the task.
- Preserve the separation between source skills in `skills/` and distributable bundles in `plugins/`.

## Core Validation Commands

```bash
npm run skills:validate
npm run skills:catalog
npm run consistency:validate
npm run marketplaces:validate
npm run skills:publish:pack
npm run publish:validate
npm run pack:dry
```

## Workflow Intent

- `ci.yml` regenerates the catalog, checks drift, builds publish bundles, and validates those bundles.
- `release-gates.yml` validates skills, consistency, marketplaces, and package dry runs.
- `release.yml` prepares release artifacts and only publishes to npm when manually dispatched with publish enabled.
- Marketplace workflows validate the Claude Code and Codex manifests and the packaged plugin roots.

## Documentation Boundaries

- `README.md` is the public landing page.
- `docs/getting-started.md` and `docs/cli-reference.md` are user-facing.
- `docs/release-checklist.md` is the operational release checklist.
- Keep deep maintainer detail out of the root README unless it directly helps first-time adoption.

## Marketplace Notes

- Keep the public docs aligned with the CLI behavior that is actually available.
- Validate marketplace manifest structure directly for Codex.
- Use `claude plugin validate .` when validating Claude marketplace behavior locally.
- Do not claim direct publication to external marketplaces when the repo only prepares deterministic artifacts for upload.
