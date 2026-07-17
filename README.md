# NgAutoPilot

[![npm version](https://img.shields.io/npm/v/ngautopilot?style=flat-square&logo=npm&label=npm)](https://www.npmjs.com/package/ngautopilot)
[![npm downloads](https://img.shields.io/npm/dw/ngautopilot?style=flat-square&logo=npm&label=downloads)](https://www.npmjs.com/package/ngautopilot)
[![CI](https://img.shields.io/github/actions/workflow/status/janpereira-dev/ngAutoPilot/ci.yml?branch=main&style=flat-square&logo=githubactions&label=CI)](https://github.com/janpereira-dev/ngAutoPilot/actions/workflows/ci.yml)
[![Release Gates](https://img.shields.io/github/actions/workflow/status/janpereira-dev/ngAutoPilot/release-gates.yml?branch=main&style=flat-square&logo=githubactions&label=release%20gates)](https://github.com/janpereira-dev/ngAutoPilot/actions/workflows/release-gates.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/janpereira-dev/ngAutoPilot/codeql.yml?branch=main&style=flat-square&logo=githubactions&label=CodeQL)](https://github.com/janpereira-dev/ngAutoPilot/actions/workflows/codeql.yml)
[![License](https://img.shields.io/npm/l/ngautopilot?style=flat-square&label=license)](https://github.com/janpereira-dev/ngAutoPilot/blob/main/LICENSE)
[![Node](https://img.shields.io/node/v/ngautopilot?style=flat-square&logo=nodedotjs&label=node)](https://github.com/janpereira-dev/ngAutoPilot/blob/main/package.json)
[![Pi package](https://img.shields.io/badge/Pi-package-5E6AD2?style=flat-square)](https://pi.dev/packages/ngautopilot?name=janpere&sort=recent)
[![skills.sh](https://img.shields.io/badge/skills.sh-listed-000000?style=flat-square)](https://www.skills.sh/janpereira-dev/ngautopilot)

<p align="left">
  <img src="assets/ngautopilot-hero.svg" alt="NgAutoPilot hero banner" />
</p>

**Version-aware engineering skills, routing, and guardrails for AI coding agents.**

NgAutoPilot is an agent-agnostic engineering toolkit and CLI that packages version-aware skills, routing, subagent roles, an operational prompt, guardrails, adapters, and installable packs for safe Angular and frontend development.

It keeps agents on a small, repeatable loop: inspect the repository, detect stack and versions, select the smallest relevant capability, apply compatibility and risk gates, make a reversible change, and validate the result.

## What Ships With NgAutoPilot

| Component | Responsibility |
| --- | --- |
| Skills | 413 reusable engineering procedures with compatibility and validation guidance |
| Core routing | Intake, stack detection, capability selection, compatibility, and risk decisions |
| Packs | Installable technology and workflow selections for core, Angular, frontend, quality, and more |
| Adapters | Agent-specific installation layouts and instruction files for 10 supported targets |
| Subagents | Eight focused Markdown review roles for independent specialist oversight |
| Operational prompt | One canonical integration prompt for wiring skills and subagents into a project |
| Guardrails | 30 frontend review contracts for product, accessibility, design-system, test, and performance risks |
| CLI | Install, update, verify, backup, restore, export, and catalog inspection commands |
| Plugins and gates | Marketplace bundles plus catalog, distribution, consistency, and release validation |

NgAutoPilot does not autonomously rewrite repositories. It helps an agent choose evidence-backed, bounded work and prove the result.

## Install A Focused Pack

Do not start with `npx skills add janpereira-dev/ngAutoPilot` unless you intentionally want its flat 413-skill selector. The `skills` CLI has no pack-selection protocol; `skills.sh.json` changes only the repository page.

NgAutoPilot is the bounded, agent-neutral install path. Pick one pack for current task, inspect its plan, then install it:

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-21-to-22 --dry-run
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-21-to-22 --yes
```

Every focused pack includes `ngautopilot-core` automatically. Switching packs at same agent and scope removes prior unchanged managed files; modified files are preserved and reported. `ngautopilot-full` remains explicit for maintainers and offline mirrors.

| Goal | Start with |
| --- | --- |
| Any agent, any project | `ngautopilot-core` |
| New Angular work | `ngautopilot-angular-foundations` |
| Signals and RxJS | `ngautopilot-angular-state` |
| Forms, router, templates, Material | `ngautopilot-angular-ui` |
| SSR, performance, security, runtime | `ngautopilot-angular-runtime` |
| Angular testing | `ngautopilot-angular-testing` |
| AngularJS migration | `ngautopilot-angular-migration` |
| One Angular upgrade hop | `ngautopilot-angular-<from>-to-<to>` |
| Angular 21 to 22 | `ngautopilot-angular-21-to-22` |

Adapter IDs are `claude`, `codex`, `copilot`, `cursor`, `gemini`, `generic`, `hermes`, `openclaw`, `opencode`, and `pi`. Run `ngautopilot adapters` for each adapter's current scope and verification status.

Read [Pack Selection](docs/packs.md) for every pack, historical Angular hops, and agent examples. Read [Installation](docs/installation.md) for switching, updates, verification, export, and offline use.

## Choose Right Entry Point

| Entry point | Use it for | Does it select a focused pack? |
| --- | --- | --- |
| `npm exec --package=ngautopilot -- ngautopilot install ...` | Official project or user-scope installation for every adapter | Yes |
| `npx skills add janpereira-dev/ngAutoPilot` | Manual discovery of individual skills through skills.sh | No, it shows every discovered skill |
| Claude and Codex marketplaces | Native plugin discovery and installation | No, plugin bundles distribute source skills |
| Pi package metadata | Pi package discovery of source skills and prompts | No, use CLI for bounded installation |

Packs are shared selection policy. Adapters translate one selected pack into each agent's native layout. Marketplace bundles are useful discovery channels, but they do not replace the pack installer.

## Naming

| Concept | Value |
| --- | --- |
| npm package | `ngautopilot` |
| CLI command | `ngautopilot` |
| generated folder | `.ngautopilot/` |
| GitHub repo | `janpereira-dev/ngAutoPilot` |

## Why It Exists

AI coding agents often:

- over-refactor instead of making the smallest safe change
- guess Angular compatibility instead of detecting it
- mix upgrade hops with modernization work
- skip validation or release gates
- apply generic advice to version-sensitive repositories

NgAutoPilot answers that with small, reusable, public skills that can be routed deterministically.

## What NgAutoPilot Is

- A public catalog of micro-skills.
- A routing layer for AI coding agents.
- A safety layer for Angular and frontend change work.
- A distribution package with a small CLI.
- A repo with validation, catalog generation, publish bundles, and marketplace manifests.

## What It Is Not

- Not a framework.
- Not an Angular runtime library.
- Not an autopatcher.
- Not a replacement for tests or review.
- Not tied to a single AI vendor.

## Main Use Cases

| Use case | What NgAutoPilot helps with |
| --- | --- |
| Angular upgrades | major-by-major routing, compatibility gates, upgrade satellites |
| Angular 22 coverage | bounded `21-to-22` hop plus concern-first satellites for Signal Forms, resources, DI, router, templates, SSR, security, testing, AI/MCP, and education |
| Modernization after upgrades | standalone, control flow, `@defer`, zoneless readiness |
| Performance audits | template functions, change detection, trackBy, Core Web Vitals |
| Testing | Angular TestBed, Jest, strategy selection, validation contracts |
| Quality workflows | lint cleanup, dead code, SonarQube triage, consistency checks |
| Agent adapters | Claude, Codex, Copilot, Cursor, Gemini, Hermes, OpenClaw, OpenCode, Pi, and generic exports |

## How It Works

1. Inspect the repository and detect the stack.
2. Select the smallest relevant skill.
3. Apply compatibility and risk gates.
4. Make the smallest reversible change.
5. Validate the result.
6. Package docs, bundles, or review artifacts when needed.

## Mental Model

```txt
User task
  -> Adapter
  -> Core intake and version detection
  -> Skill router
  -> Compatibility and risk gates
  -> Targeted skills
  -> Optional specialist subagents
  -> Validation and delivery
```

- A **skill** defines how to perform one technical operation.
- A **pack** selects skills and optional specialist assets to install.
- An **adapter** determines where and how that content is installed for an agent.
- A **subagent** supplies independent review for a matching risk; it does not replace skill routing.
- The operational **prompt** integrates the system into a project workflow.
- A **guardrail** blocks unsafe or unjustified frontend decisions during review; it is not runtime enforcement.

## Example Workflows

### Upgrade an Angular application

> Upgrade this repository from Angular 17 to Angular 18. Detect Node, TypeScript, and RxJS versions, keep modernization outside the upgrade hop, and stop on blocking compatibility risks.

### Review an Angular pull request

> Review this pull request with Angular architecture, TypeScript, testing, accessibility, and compatibility skills. Separate blocking findings from recommendations.

### Improve an AI-generated interface

> Audit this interface for generic AI patterns, accessibility, responsive behavior, interaction states, design-system consistency, and measurable performance risks.

### Harden Jest tests

> Review these Angular Jest tests for fragile TestBed setup, missing branches, incorrect mocks, and unstable async behavior.

<p align="left">
  <img src="assets/ngautopilot-flow.svg" alt="NgAutoPilot workflow diagram" />
</p>

## Catalog Snapshot

Current catalog size: **413 skills**

| Area | Coverage |
| --- | --- |
| Core routing | intake, stack detection, compatibility, risk control |
| Angular | upgrades, modernization, architecture, forms, router, SSR, Material, security, migration |
| TypeScript and JavaScript | strict typing, fundamentals, safer code patterns |
| Quality | lint, dead code, SonarQube, governance |
| CSS | custom properties, `:has()`-driven layout patterns |

## Skill Families

These are the families that matter most when consuming the catalog:

| Skill family | What it covers | When to use |
| --- | --- | --- |
| `skills/_core/` | intake, stack detection, routing, compatibility, risk control | first, for every task |
| `skills/angular/versioning/` | version gates, compatibility decisions, master routing | before any Angular hop |
| `skills/angular/upgrades/` | major-hop executors and version-specific satellites | during Angular upgrades |
| `skills/angular/upgrades/21-to-22/` | bounded Angular 21 -> 22 hop orchestration, preflight, breaking-change gate, and validation | for Angular 21 to 22 upgrades only |
| `skills/angular/modernization/` | control flow, `@defer`, standalone-first, zoneless readiness | after the hop is stable |
| `skills/angular/architecture/` | higher-level Angular design guidance | when the task is architectural |
| `skills/angular/microfrontends/` | shell, remote, compatibility, sharing and rollback gates | when the repo needs distributed frontend boundaries |
| `skills/angular/signals/`, `skills/angular/performance/`, `skills/angular/security/`, `skills/angular/ssr/`, `skills/angular/testing/` | v22-friendly state, runtime, security, and test contracts | when the change spans runtime behavior |
| `skills/angular/forms/`, `skills/angular/router/`, `skills/angular/templates/`, `skills/angular/build/`, `skills/angular/components/`, `skills/angular/modules/`, `skills/angular/resources/`, `skills/angular/zone/`, `skills/angular/zoneless/` | v22-specific API and migration contracts | when the task is area-specific |
| `skills/angular/docs/` | ADRs, upgrade reports, and review packets | when the change needs governance or packaging |
| `skills/frontend/` | inclusive UI, responsive CSS, product UX, design-system governance, design excellence, frontend validation, and WPO evidence | when the task is framework-neutral frontend work |
| `skills/angular/styles/` | Angular-hosted CSS custom property patterns | when Angular needs to expose style-only state |
| `skills/css/` | selector-driven layout and modern CSS patterns | when CSS can solve the problem without JS |
| `skills/typescript/`, `skills/javascript/`, `skills/quality/` | cross-cutting code quality and workflow skills | when the task is not Angular-specific |

## Documentation

Public usage docs:

- [docs/getting-started.md](docs/getting-started.md)
- [docs/cli-reference.md](docs/cli-reference.md)
- [docs/angular-roadmap-guide.md](docs/angular-roadmap-guide.md)
- [docs/angular-version-era-map.md](docs/angular-version-era-map.md)
- [docs/angular-22-support.md](docs/angular-22-support.md)
- [docs/angular-caniuse/README.md](docs/angular-caniuse/README.md)
- [docs/sage-review.md](docs/sage-review.md)
- [docs/release-checklist.md](docs/release-checklist.md)
- [docs/agents-and-subagents.md](docs/agents-and-subagents.md)
- [docs/design-excellence-guide.md](docs/design-excellence-guide.md)

## Packs, Adapters, And Review Assets

Use `ngautopilot packs` to inspect the 10 installable packs and `ngautopilot adapters` to inspect the 10 agent adapters with their current support status and scopes.

| Asset | Current capability |
| --- | --- |
| Packs | Core, Angular, Angular upgrades, micro-frontends, frontend, CSS, TypeScript, JavaScript, quality, and full catalog |
| Subagents | Eight specialist Markdown roles: architecture, contrarian review, consolidation, TypeScript, RxJS, testing, compatibility, and repository discovery |
| Prompt | `agents/ngautopilot/prompts/codex-integration.md` is the canonical operational integration prompt |
| Guardrails | 30 frontend review contracts; agents apply them during review, not through runtime code enforcement |

Read [docs/packs.md](docs/packs.md), [docs/agents-and-subagents.md](docs/agents-and-subagents.md), and [docs/prompts-and-guardrails.md](docs/prompts-and-guardrails.md) for details.

Maintainer and repository docs:

- [docs/maintainer-guide.md](docs/maintainer-guide.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [CHANGELOG.md](CHANGELOG.md)

## Built For Agent Workflows

![agent agnostic](https://img.shields.io/badge/agent--agnostic-yes-success?style=flat-square)
![Angular](https://img.shields.io/badge/angular-ready-DD0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/typescript-ready-3178C6?style=flat-square&logo=typescript&logoColor=white)
![AI agents](https://img.shields.io/badge/AI%20agents-Codex%20%7C%20Claude%20%7C%20Copilot%20%7C%20Cursor%20%7C%20Gemini-4B5563?style=flat-square)

The repository includes adapters and marketplace manifests for multiple agent ecosystems while keeping the skills themselves public and agent-agnostic.

## Project Health

[![last commit](https://img.shields.io/github/last-commit/janpereira-dev/ngAutoPilot?style=flat-square&logo=github&label=last%20commit)](https://github.com/janpereira-dev/ngAutoPilot/commits/main)
[![repo size](https://img.shields.io/github/repo-size/janpereira-dev/ngAutoPilot?style=flat-square&logo=github&label=repo%20size)](https://github.com/janpereira-dev/ngAutoPilot)
[![package size](https://img.shields.io/npm/unpacked-size/ngautopilot?style=flat-square&logo=npm&label=package%20size)](https://www.npmjs.com/package/ngautopilot)
[![issues](https://img.shields.io/github/issues/janpereira-dev/ngAutoPilot?style=flat-square&logo=github&label=issues)](https://github.com/janpereira-dev/ngAutoPilot/issues)
[![pull requests](https://img.shields.io/github/issues-pr/janpereira-dev/ngAutoPilot?style=flat-square&logo=github&label=PRs)](https://github.com/janpereira-dev/ngAutoPilot/pulls)

## Validation And Release

Use these commands before publishing:

```bash
npm run skills:validate
npm run skills:catalog
npm run plugins:sync
npm run consistency:validate
npm run marketplaces:validate
npm run skills:publish:pack
npm run publish:validate
npm run pack:dry
```

The CI and release-gate workflows stay focused on deterministic validation. The release workflow can build release artifacts and, when explicitly dispatched with publish enabled, publish the npm package.

## Plugin Marketplaces

NgAutoPilot ships marketplace manifests for Claude Code and Codex:

- Claude manifest: `.claude-plugin/marketplace.json`
- Codex manifest: `.agents/plugins/marketplace.json`

Current plugin bundles are split by use:

| Bundle | Use |
| --- | --- |
| `ngautopilot-core` | orchestration, intake, routing, compatibility, and risk gates |
| `ngautopilot-angular` | complete Angular catalog |
| `ngautopilot-angular-microfrontends` | focused Angular micro-frontends subset |
| `ngautopilot-css` | CSS and Angular style-boundary subset |
| `ngautopilot-frontend` | inclusive UI, UX/product, design-system, frontend testing, and performance evidence |
| `ngautopilot-javascript` | JavaScript fundamentals, modules, pure functions, and async error handling |
| `ngautopilot-quality` | complete quality catalog |
| `ngautopilot-quality-lint` | ESLint and lint governance subset |
| `ngautopilot-quality-deadcode-sonar` | dead-code and SonarQube subset |
| `ngautopilot-typescript` | complete TypeScript catalog |

`npm run plugins:sync` rebuilds plugin bundles from `skills/` and the consistency validator checks that every source skill is included in at least one plugin bundle.

## Repository Map

```txt
ngAutoPilot/
  adapters/
  assets/
  docs/
  plugins/
  schemas/
  scripts/
  skills/
```

## License

NgAutoPilot is released under the MIT license.
