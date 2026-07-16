# NgAutoPilot

[![npm version](https://img.shields.io/npm/v/ngautopilot?style=flat-square&logo=npm&label=npm)](https://www.npmjs.com/package/ngautopilot)
[![npm downloads](https://img.shields.io/npm/dw/ngautopilot?style=flat-square&logo=npm&label=downloads)](https://www.npmjs.com/package/ngautopilot)
[![CI](https://img.shields.io/github/actions/workflow/status/janpereira-dev/ngAutoPilot/ci.yml?branch=main&style=flat-square&logo=githubactions&label=CI)](https://github.com/janpereira-dev/ngAutoPilot/actions/workflows/ci.yml)
[![Release Gates](https://img.shields.io/github/actions/workflow/status/janpereira-dev/ngAutoPilot/release-gates.yml?branch=main&style=flat-square&logo=githubactions&label=release%20gates)](https://github.com/janpereira-dev/ngAutoPilot/actions/workflows/release-gates.yml)
[![License](https://img.shields.io/npm/l/ngautopilot?style=flat-square&label=license)](https://github.com/janpereira-dev/ngAutoPilot/blob/main/LICENSE)
[![Node](https://img.shields.io/node/v/ngautopilot?style=flat-square&logo=nodedotjs&label=node)](https://github.com/janpereira-dev/ngAutoPilot/blob/main/package.json)

<p align="left">
  <img src="assets/ngautopilot-hero.svg" alt="NgAutoPilot hero banner" />
</p>

NgAutoPilot is an installable catalog of micro-skills that helps AI coding agents work safely in Angular, TypeScript, JavaScript, RxJS, testing, code quality, architecture, versioning, and governance workflows.

It keeps agents on a small, repeatable loop: inspect the repo, detect stack and versions, route to the smallest skill, apply compatibility and risk gates, make the smallest reversible change, and validate the result.

## Quick Start

```bash
npm exec --package=ngautopilot -- ngautopilot help
npm exec --package=ngautopilot -- ngautopilot list
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-core --dry-run
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-core --yes
npm exec --package=ngautopilot -- ngautopilot doctor
```

The CLI requires an agent and an explicit pack. It writes only below the selected adapter's project or user scope; `ngautopilot-full` is always explicit.

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
| Agent adapters | Codex, Claude Code, Copilot, Cursor, Gemini, generic exports |

## How It Works

1. Inspect the repository and detect the stack.
2. Select the smallest relevant skill.
3. Apply compatibility and risk gates.
4. Make the smallest reversible change.
5. Validate the result.
6. Package docs, bundles, or review artifacts when needed.

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
