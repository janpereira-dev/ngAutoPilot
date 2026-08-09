# Agent Plugins Preview

NgAutoPilot `0.6.0` generates portable Agent Plugins 1.0 from canonical `skills/` and pack selection policy in `packs/`.

Generated skill plugins are `ngautopilot-core`, `ngautopilot-angular-architecture`, `ngautopilot-angular-testing`, and `ngautopilot-angular-21-to-22`. Each focused plugin includes transitive Core skills.

`ngautopilot-tools` is separate. It exposes a bundled stdio MCP server with nine read-only inspection tools. It cannot modify repository files, dependencies, upgrades, or Git state.

Run `npm run agent-plugins:sync`, `npm run agent-plugins:validate`, `npm run agent-plugins:smoke`, and `npm run agent-plugins:pack` before release. ZIP artifacts and `SHA256SUMS` appear under `dist/agent-plugins/`.

Existing native `plugins/`, marketplaces, adapters, and CLI installation remain supported. Agent Plugins defines artifact format, not universal installation or marketplace behavior.
