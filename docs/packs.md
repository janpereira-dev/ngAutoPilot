# NgAutoPilot Packs

Packs are agent-neutral, declarative installation batches. They select source skills, role definitions, prompts, and guardrails. Adapters then place that selected batch in the layout for Claude Code, Codex, Copilot, Cursor, Gemini, Hermes, OpenClaw, OpenCode, Pi, or generic Markdown consumers.

`skills.sh.json` groups only the skills.sh web page. Marketplace plugins distribute source skills. Neither replaces pack selection through `ngautopilot install`.

## Start Here

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot install --agent opencode --pack ngautopilot-angular-foundations --dry-run
```

Every focused pack resolves `ngautopilot-core` transitively. Install one pack per agent and scope. Changing packs removes files owned by prior pack when unchanged; user-modified files are left in place and reported rather than overwritten.

## Daily Development

| Pack | Use it for |
| --- | --- |
| `ngautopilot-core` | Intake, stack detection, routing, compatibility, and risk gates on any project |
| `ngautopilot-angular-foundations` | Angular architecture, components, and service design |
| `ngautopilot-angular-state` | Signals, RxJS interoperability, and state boundaries |
| `ngautopilot-angular-ui` | Forms, router, templates, Material, and styles |
| `ngautopilot-angular-runtime` | Build, SSR, resources, performance, security, zones, and zoneless behavior |
| `ngautopilot-angular-testing` | TestBed, component tests, visual validation, and test stability |
| `ngautopilot-angular-modernization` | Standalone, control flow, `@defer`, and zoneless adoption after a stable upgrade |
| `ngautopilot-angular-microfrontends` | Federation, workspace boundaries, and MFE validation |
| `ngautopilot-frontend` | Framework-neutral UX, accessibility, UI, and web performance |
| `ngautopilot-css` | CSS selectors and layout guidance |
| `ngautopilot-typescript` | Strict types, DTOs, and pure functions |
| `ngautopilot-javascript` | JavaScript fundamentals, modules, and async behavior |
| `ngautopilot-quality` | ESLint, SonarQube, dead code, and quality review |

## Angular Upgrades

Choose the exact next major hop. Each hop includes Core, versioning guidance, its bounded executor, and the compatibility-gatekeeper role. Do not install an all-history pack for one upgrade.

| Source | Target | Pack |
| --- | --- | --- |
| 2 | 4 | `ngautopilot-angular-2-to-4` |
| 4 | 5 | `ngautopilot-angular-4-to-5` |
| 5 | 6 | `ngautopilot-angular-5-to-6` |
| 6 | 7 | `ngautopilot-angular-6-to-7` |
| 7 | 8 | `ngautopilot-angular-7-to-8` |
| 8 | 9 | `ngautopilot-angular-8-to-9` |
| 9 | 10 | `ngautopilot-angular-9-to-10` |
| 10 | 11 | `ngautopilot-angular-10-to-11` |
| 11 | 12 | `ngautopilot-angular-11-to-12` |
| 12 | 13 | `ngautopilot-angular-12-to-13` |
| 13 | 14 | `ngautopilot-angular-13-to-14` |
| 14 | 15 | `ngautopilot-angular-14-to-15` |
| 15 | 16 | `ngautopilot-angular-15-to-16` |
| 16 | 17 | `ngautopilot-angular-16-to-17` |
| 17 | 18 | `ngautopilot-angular-17-to-18` |
| 18 | 19 | `ngautopilot-angular-18-to-19` |
| 19 | 20 | `ngautopilot-angular-19-to-20` |
| 20 | 21 | `ngautopilot-angular-20-to-21` |
| 21 | 22 | `ngautopilot-angular-21-to-22` |

Angular did not release a version 3, so its first documented major hop is 2 to 4. For AngularJS migration rather than an Angular major hop, use `ngautopilot-angular-migration`. `ngautopilot-angular-upgrades` remains the intentional all-upgrades audit pack; it is not the daily default.

## Examples

```bash
# Angular 17 to 18 project install for Codex
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-17-to-18 --scope project --dry-run

# AngularJS migration project install for Claude Code
npm exec --package=ngautopilot -- ngautopilot install --agent claude --pack ngautopilot-angular-migration --scope project --yes

# Signals and RxJS user-scope install for OpenCode
npm exec --package=ngautopilot -- ngautopilot install --agent opencode --pack ngautopilot-angular-state --scope user --yes

# Generic export for an agent without a native adapter
npm exec --package=ngautopilot -- ngautopilot export --agent generic --pack ngautopilot-angular-testing --output ./ngautopilot-export
```

## Full Catalog

`ngautopilot-angular` installs the full Angular and TypeScript catalog. `ngautopilot-full` installs every source skill and all eight review roles. Use either only for maintainers, offline mirrors, or an explicit all-catalog requirement.

## Pack Definition Format

Each pack is a JSON file in `packs/<pack-id>.json`, validated against `schemas/pack.schema.json`:

```json
{
  "id": "ngautopilot-core",
  "name": "NgAutoPilot Core",
  "version": "0.5.3",
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

Skill selection uses ID prefixes: `"core."` matches `core.autopilot-orchestrator`, `core.compatibility-router`, and related skills. Excludes are applied after includes. `dependsOn` is resolved transitively before planning, so focused packs always include required foundations.
