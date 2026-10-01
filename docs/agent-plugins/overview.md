# Agent Plugins Preview 📦

<!-- docs:navigation:start -->
[Español](overview.es.md) · [Map](../README.md) · [Home](../../README.md)

<!-- docs:navigation:end -->

![Delivery routes have different contracts; verify host discovery, publication and MCP integration separately.](../../assets/distribution-routes.svg)

**Generate an artifact, then prove that the target host can discover it.** NgAutoPilot `0.6.0` generates Agent Plugins 1.0 from canonical `skills/` and pack policy in `packs/`. Packaging is not installation evidence.

## What is included?

| Artifact | Purpose |
| --- | --- |
| `ngautopilot-core` | Shared foundations |
| `ngautopilot-angular-architecture` | Focused Angular architecture |
| `ngautopilot-angular-testing` | Focused Angular testing |
| `ngautopilot-angular-21-to-22` | Bounded upgrade guidance |
| `ngautopilot-tools` | Separate stdio MCP inspection server |

Focused skill plugins include transitive Core skills. The tools plugin registers **ten** inspection tools in this checkout: `catalog.search`, `pack.list`, `pack.resolve`, `project.inspect`, `stack.detect`, `skill.route`, `compatibility.check`, `upgrade.plan`, `angular.resolve`, and `repository.validate`.

These tools do not apply upgrades, change dependencies or edit Git state. `angular.resolve` accepts a caller-supplied snapshot, rather than reading the caller's application files.

## Maintainer route

Run from this repository:

```bash
npm run agent-plugins:sync
npm run agent-plugins:validate
npm run agent-plugins:smoke
npm run agent-plugins:pack
```

Inspect ZIP artifacts and `SHA256SUMS` under `dist/agent-plugins/`. Sync generates output; validate checks structure; smoke tests the local protocol; packing creates archives. **None proves discovery in every client.**

Native `plugins/`, marketplaces, adapters and CLI installation remain separate distribution paths. Agent Plugins describes artifact format, not universal installation or marketplace behavior. Continue with the [compatibility evidence](compatibility.md).
