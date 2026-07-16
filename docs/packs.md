# NgAutoPilot Packs

Packs are declarative selection layers. A pack selects skills, agents, prompts, and guardrails from the canonical source tree. The installer applies packs; plugin bundles distribute them.

## Pack catalog

| Pack | Status | Audience | Contents | Dependencies |
| --- | --- | --- | --- | --- |
| `ngautopilot-core` | stable | Everyone | Routing, intake, compatibility, risk gates | none |
| `ngautopilot-angular` | stable | Angular developers | Full Angular catalog + TypeScript | Core |
| `ngautopilot-angular-upgrades` | stable | Migration teams | Upgrade hops, version gates | Core |
| `ngautopilot-angular-microfrontends` | stable | MFE teams | MFE architecture, federation | Core |
| `ngautopilot-frontend` | stable | Frontend generalists | UX, UI, CSS, a11y, WPO | Core |
| `ngautopilot-css` | stable | CSS developers | Selectors, layout, accessibility-aware styling | Core |
| `ngautopilot-typescript` | stable | TypeScript developers | Strict types, DTO mappers, pure functions | Core |
| `ngautopilot-javascript` | stable | JavaScript developers | Fundamentals, modules, async, compat | Core |
| `ngautopilot-quality` | stable | Quality owners | ESLint, SonarQube, dead code, review | Core |
| `ngautopilot-full` | stable | Maintainers | Entire catalog | all |

## Recommended starting packs

| Scenario | Pack |
| --- | --- |
| New to NgAutoPilot | `ngautopilot-core` |
| Angular developer | `ngautopilot-core` + `ngautopilot-angular` |
| Angular migration | `ngautopilot-core` + `ngautopilot-angular-upgrades` |
| Frontend generalist | `ngautopilot-core` + `ngautopilot-frontend` |
| Quality reviewer | `ngautopilot-core` + `ngautopilot-quality` |
| Maintainer / offline mirror | `ngautopilot-full` (not recommended for daily use) |

## Install

```bash
# Project scope
ngautopilot install --agent codex --pack ngautopilot-core --scope project

# User scope (when supported)
ngautopilot install --agent codex --pack ngautopilot-angular --scope user
```

## Pack definition format

Each pack is a JSON file in `packs/<pack-id>.json`, validated against `schemas/pack.schema.json`:

```json
{
  "id": "ngautopilot-core",
  "name": "NgAutoPilot Core",
  "version": "0.5.1",
  "status": "stable",
  "description": "...",
  "audience": "Everyone",
  "includes": {
    "skills": ["core."],
    "agents": [],
    "prompts": [],
    "guardrails": []
  },
  "excludes": [],
  "dependsOn": []
}
```

Skill selection uses ID prefixes: `"core."` matches `core.autopilot-orchestrator`, `core.compatibility-router`, etc. Excludes are applied after includes.