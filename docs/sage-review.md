# Sage-oriented review: packet first, external review second

<!-- docs:navigation:start -->
[Español](sage-review.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

NgAutoPilot can generate a review packet for agent instructions, workflow files and publication automation. **Generating that packet does not run an external reviewer or certify safety.**

## When to use it

Review changes to `skills/**/SKILL.md`, `adapters/**`, `.github/workflows/**`, `scripts/*.mjs`, `catalog.json`, publish bundles and release automation.

Look for unsafe shell execution, hidden provider lock-in, broad file copying, secret exposure in workflows, unintended published files and overly permissive instructions. Review file writes, URL access and package installation as separate trust boundaries.

## Three steps

1. Generate from the repository:

   ```bash
   npm run review:sage:pack
   ```

2. Inspect `dist/review/sage/`. Check contents and remove sensitive information before sharing with an external service.
3. If you use Sage, submit the packet through an installed, authorized integration. Verify its current host support and data policy; this repository does not install or authenticate that service.

Record the external review outcome separately from packet creation. A missing integration is an unmet review step, not an automatic pass.

## Keep deterministic validation

Sage or another external reviewer supplements, not replaces:

- `npm run skills:validate`
- `npm run skills:catalog`
- `npm run skills:publish:pack` when published content changes

Use findings to inspect concrete risky behavior before a PR. Do not assume a provider verdict is a security certification.
