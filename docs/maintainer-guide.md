# Maintainer Guide

<!-- docs:navigation:start -->
[Español](maintainer-guide.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

![Validate, index, sync, compare, then review the generated diff and full release checklist.](../assets/ngautopilot-flow.svg)

This document is for repository maintenance, catalog governance, packaging, and release operations. The public landing page stays in the root `README.md`.

## Quick path

1. Edit the owning source, not a generated bundle.
2. Validate and regenerate the affected distribution.
3. Review diffs and evidence before publication.

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
npm run plugins:sync
npm run agent-plugins:sync
npm run consistency:validate
npm run marketplaces:validate
npm run skills:publish:pack
npm run publish:validate
npm run pack:dry
```

For documentation, run `npm run docs:index` and `npm run docs:validate`.
For release preparation, also use the broad `npm run release:validate` gate
and the [release checklist](release-checklist.md). Individual checks do not
prove external publication.

## Workflow Intent

- `ci.yml` regenerates the catalog and plugin bundles, checks drift, builds publish bundles, and validates those bundles.
- `release-gates.yml` validates skills, plugin coverage, consistency, marketplaces, and package dry runs.
- `release.yml` publishes the exact npm tarball and complete release artifacts on `release.published` or a manual dispatch with publish enabled. Both routes require the exact reviewed main-history tag, the protected `release-security` approval and its `RELEASE_NPM_TOKEN`; approving a GitHub-release run is approval to publish npm, not an artifacts-only action.
- Marketplace workflows validate the Claude Code and Codex manifests and the packaged plugin roots.

## Documentation Boundaries

- `README.md` is the public landing page.
- `docs/getting-started.md` and `docs/cli-reference.md` are user-facing.
- `docs/release-checklist.md` is the operational release checklist.
- Keep deep maintainer detail out of the root README unless it directly helps first-time adoption.
- Maintain English originals and complete `.es.md` companions together.
- Preserve dates and decisions in historical records; they are not current feature guarantees.
- Keep runtime instructions and generated copies canonical, not separately translated operational catalogs.

## Skill Lab fixture manifests

Skill Lab fixtures are historical test data, not npm projects. Store simulated
package manifests as `package.fixture.json`, never `package.json`, and do not
run a package manager or create lockfiles inside fixture directories. This
preserves historical dependency versions without allowing dependency scanners
to mistake fixtures for product dependencies.

Before publishing, inspect `npm pack --dry-run --json` and confirm that
`skill-lab/` is absent from the package tarball.

## Marketplace Notes

- Keep the public docs aligned with the CLI behavior that is actually available.
- Keep `plugins/` generated from `skills/` with `npm run plugins:sync`; every source skill must be present in at least one marketplace bundle.
- Validate marketplace manifest structure directly for Codex.
- Use `claude plugin validate .` when validating Claude marketplace behavior locally.
- Do not claim direct publication to external marketplaces when the repo only prepares deterministic artifacts for upload.

## Maintaining documentation graphics

SVG diagrams are generated from `scripts/documentation-graphics.mjs`, with an English and a Spanish edition. They need no remote fonts or dependencies. Edit copy and composition in that file, not in the generated SVGs.

```bash
node scripts/documentation-graphics.mjs
node scripts/documentation-graphics.mjs --check
npm run docs:validate
```

Check both editions at reading size. Preserve meaningful alt text, contrast, and equivalent Markdown content. Only the route marker uses decorative one-pass motion, disabled for reduced motion. All other diagrams are static.
