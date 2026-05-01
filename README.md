# NgAutoPilot

<p align="left">
  <img src="assets/ngautopilot-hero.svg" alt="NgAutoPilot hero banner" />
</p>

NgAutoPilot is a public, agent-agnostic catalog of micro-skills for Angular, TypeScript, JavaScript, RxJS, testing, code quality, architecture, versioning, and Git workflows.

It helps AI agents make better technical decisions with small, reusable instructions instead of one giant prompt.

> ## Documentation Index
> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

## What NgAutoPilot Is

NgAutoPilot is a skill system for real projects.

- 🧠 `skills/_core/` is the operating layer that decides how to think about a task.
- 🏗️ `skills/angular/` holds Angular-specific skills for architecture, DI, performance, RxJS, state, migrations, versioning, and upgrade hops.
- 🧪 `skills/typescript/`, `skills/javascript/`, `skills/quality/`, and `skills/git/` cover cross-cutting concerns.
- 🔌 `adapters/` contains templates for different agent ecosystems.
- 📚 `docs/` contains extra guidance such as the Sage review packet.
- 📦 `schemas/`, `templates/`, and `scripts/` keep the catalog structured and maintainable.

## What It Is Not

NgAutoPilot is not:

- a giant prompt dump
- a private internal playbook
- a framework
- a CLI product
- a replacement for project architecture
- a provider-locked skill pack

## Why It Exists

Modern frontend work gets messy fast:

- architecture decisions get mixed with local fixes
- performance advice becomes repetitive
- version compatibility is guessed instead of detected
- broad prompts hide the smallest safe change
- test guidance gets lost in long discussions

NgAutoPilot turns that into a catalog of micro-skills that are:

- small
- reusable
- version-aware
- easy to validate
- safe to share publicly

## How It Works

<p align="left">
  <img src="assets/ngautopilot-flow.svg" alt="NgAutoPilot workflow diagram" />
</p>

1. Detect the project stack.
2. Select the smallest skill that matches the task.
3. Apply compatibility and risk gates.
4. Make the smallest reversible change.
5. Validate the result.
6. Prepare the publish bundle or review packet when needed.

The `_core` layer is the brain. It tells the agent how to inspect the repo, choose a skill, gate by compatibility, and keep the change small.

## Skill Layers

```txt
skills/
  _core/
    autopilot-orchestrator/
    project-intake/
    stack-version-detection/
    skill-router/
    compatibility-router/
    risk-assessment/
  angular/
    architecture/
    components/
    dependency-injection/
    performance/
    rxjs/
    state/
    services/
    migration/
    modernization/
    upgrades/
    versioning/
  typescript/
  javascript/
  quality/
  git/
```

## Catalog Snapshot

Current catalog size: **175 skills**

| Category | Skills |
| --- | ---: |
| Core | 6 |
| Angular architecture | 8 |
| Angular migration | 8 |
| Angular modernization | 18 |
| Angular performance | 13 |
| Angular upgrades | 60+ |
| Angular versioning | 3 |
| Angular components | 5 |
| Angular dependency injection | 2 |
| Angular RxJS | 2 |
| Angular services | 1 |
| Angular state | 1 |
| Angular testing | 4 |
| Angular HTTP / SSR / router / forms / Material | 30+ |
| TypeScript strict types | 1 |

## Quick Start

### Create a skill

```bash
npm run skills:create -- angular/performance/lazy-loading-routes
```

### Validate skills

```bash
npm run skills:validate
```

### Regenerate the catalog

```bash
npm run skills:catalog
```

### Build publish bundles

```bash
npm run skills:publish:pack
```

### Build the Sage review packet

```bash
npm run review:sage:pack
```

## Recommended Workflow

### For Angular tasks

Start with:

- `skills/_core/project-intake/SKILL.md`
- `skills/_core/stack-version-detection/SKILL.md`
- `skills/_core/skill-router/SKILL.md`
- `skills/_core/compatibility-router/SKILL.md`
- `skills/_core/risk-assessment/SKILL.md`
- `skills/angular/versioning/angular-versioning-index/SKILL.md`
- `skills/angular/versioning/angular-version-compatibility-gate/SKILL.md`

Then route into the relevant Angular micro-skill.

For a fast overview of the Angular roadmap, read:

- `docs/angular-roadmap-guide.md`

### For agent code reviews

Use the Sage review packet to inspect:

- `skills/**/SKILL.md`
- `adapters/**`
- `.github/workflows/**`
- `scripts/*.mjs`
- `catalog.json`

This gives Sage a focused scope for reviewing agent behavior, publish automation, and safety risks.

## Sage Review Layer

NgAutoPilot supports a Sage-oriented review flow for agent code and automation.

Sage is an Agent Detection & Response layer from Gen Digital that checks high-risk actions such as shell commands, file writes, URL fetches, and package installs before they execute.

Use it here when you want to review:

- unsafe shell commands in workflows or scripts
- hidden provider lock-in inside skills
- publish automation that copies files too broadly
- prompt or adapter content that leaks private data
- agent instructions that are too permissive

### Install Sage

Follow the official Sage docs:

- https://ai.gendigital.com/sage
- https://github.com/gendigitalinc/sage

### Review packet

Generate a focused packet first:

```bash
npm run review:sage:pack
```

Then point Sage at `dist/review/sage/` and review the packet contents.

## Public Distribution

NgAutoPilot is prepared to be shared on multiple public skill catalogs.

| Target | URL | Output |
| --- | --- | --- |
| AutoSkills | `https://www.autoskills.sh/` | `dist/publish/autoskills-sh/` |
| SkillsMP | `https://skillsmp.com/es` | `dist/publish/skillsmp-es/` |
| SkillsLLM | `https://skillsllm.com/` | `dist/publish/skillsllm/` |
| LobeHub Skills | `https://lobehub.com/skills` | `dist/publish/lobehub-skills/` |
| MCPMarket | `https://mcpmarket.com/es/tools/skills` | `dist/publish/mcpmarket-skills/` |

The publish workflow generates per-site manifests and listing files. Direct submission still depends on each platform’s schema and authentication, so the repo stays honest about what is automated and what is prepared for manual upload.

## GitHub Actions

The repository ships with workflows for:

- validation on pull requests and pushes
- catalog regeneration checks
- publish bundle generation
- release artifact preparation
- Sage review packet preparation

If a workflow is missing for a platform, add the schema once the target platform’s requirements are confirmed. The repository favors deterministic prep artifacts over fake direct integrations.

## Repository Map

```txt
NgAutoPilot/
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
├── catalog.json
├── assets/
├── docs/
├── adapters/
├── schemas/
├── skills/
│   ├── _core/
│   ├── angular/
│   │   ├── architecture/
│   │   ├── migration/
│   │   ├── modernization/
│   │   ├── upgrades/
│   │   └── versioning/
└── scripts/
```

## Angular Upgrade System

Angular upgrade work is organized into three layers:

- `versioning/` for stack detection, routing, the compatibility gate, and the master index.
- `upgrades/` for major-hop execution and version-specific risk satellites.
- `modernization/` for post-upgrade adoption of newer Angular features such as control flow, `@defer`, standalone-first, and zoneless readiness.

The recommended flow is:

1. Detect the stack.
2. Run the compatibility gate.
3. Select the next hop.
4. Run hop-specific satellites when required.
5. Validate build, tests, and SSR or Material behavior when relevant.
6. Keep modernization separate from the hop itself.

## Contributing

Contributions should be:

- public
- reusable
- agent-agnostic
- narrow in scope
- version-aware when relevant

Do not add private company instructions, secret routes, or vendor-specific lock-in inside skills.

Read `CONTRIBUTING.md` before opening a PR.

## Safety And Support

If you discover a security issue, follow `SECURITY.md` instead of opening a public issue with details.

## License

NgAutoPilot is released under the MIT license.
