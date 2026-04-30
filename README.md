# NgAutoPilot

NgAutoPilot is a public, agent-agnostic catalog of micro-skills for Angular, TypeScript, JavaScript, RxJS, testing, code quality, architecture, and Git workflows.

It is designed to help AI agents make safer technical decisions with small, focused, reusable instructions instead of one giant prompt.

## Documentation Index

Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt

Use that index to discover the available docs before exploring deeper skill patterns or Claude-specific skill mechanics.

## Why This Exists

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

## What NgAutoPilot Is

NgAutoPilot is a skill system, not a single prompt.

- `skills/_core/` contains the operating layer that decides how to think about a task.
- `skills/angular/` contains Angular-specific skills for architecture, dependency injection, performance, RxJS, state, and version gates.
- `skills/typescript/`, `skills/javascript/`, `skills/quality/`, and `skills/git/` hold cross-cutting skills.
- `adapters/` contains templates for different agent ecosystems.
- `schemas/`, `templates/`, and `scripts/` keep the catalog structured and maintainable.

## What It Is Not

NgAutoPilot is not:

- a giant prompt dump
- a private internal playbook
- a framework
- a CLI product
- a replacement for project architecture
- a provider-locked skill pack

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
    versioning/
  typescript/
  javascript/
  quality/
  git/
```

The `_core` layer is the brain. It tells the agent how to inspect the repo, choose a skill, gate by compatibility, and keep the change small.

## Documentation Snapshot

| File | Purpose |
| --- | --- |
| [`README.md`](README.md) | Product overview and usage |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution rules and review flow |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Community behavior rules |
| [`SECURITY.md`](SECURITY.md) | Responsible disclosure |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history |
| [`LICENSE`](LICENSE) | MIT license text |
| [`catalog.json`](catalog.json) | Machine-readable skill index |

## How To Use

1. Detect the project stack.
2. Select the smallest skill that matches the task.
3. Apply compatibility and risk gates.
4. Make the smallest reversible change.
5. Validate the result.

For Angular work, start with:

- `skills/_core/project-intake/SKILL.md`
- `skills/_core/stack-version-detection/SKILL.md`
- `skills/_core/skill-router/SKILL.md`
- `skills/_core/compatibility-router/SKILL.md`
- `skills/_core/risk-assessment/SKILL.md`

Then route into the relevant Angular micro-skill.

## Creating A Skill

Create a new skill from a path under `skills/`:

```bash
npm run skills:create -- angular/performance/lazy-loading-routes
```

The generated skill is a draft. Replace the placeholder content with a narrow, practical, version-aware skill before merging.

## Validating Skills

Validate all skills with:

```bash
npm run skills:validate
```

Regenerate the catalog with:

```bash
npm run skills:catalog
```

Prepare marketplace submission bundles with:

```bash
npm run skills:publish:pack
```

## Publishing Targets

NgAutoPilot is prepared to be shared on multiple public skill catalogs.

| Target | URL | Output |
| --- | --- | --- |
| AutoSkills | `https://www.autoskills.sh/` | `dist/publish/autoskills-sh/` |
| SkillsMP | `https://skillsmp.com/es` | `dist/publish/skillsmp-es/` |
| SkillsLLM | `https://skillsllm.com/` | `dist/publish/skillsllm/` |
| LobeHub Skills | `https://lobehub.com/skills` | `dist/publish/lobehub-skills/` |
| MCPMarket | `https://mcpmarket.com/es/tools/skills` | `dist/publish/mcpmarket-skills/` |

The publish workflow generates per-site manifests and listing files. Direct submission still depends on each platform's schema and authentication, so the repo stays honest about what is automated and what is prepared for manual upload.

## GitHub Actions

The repo ships with workflows for:

- validation on pull requests and pushes
- catalog regeneration checks
- publish bundle generation
- release artifact preparation

If a workflow is missing for a platform, add the schema once the target platform's requirements are confirmed. The repository currently favors deterministic prep artifacts over fake direct integrations.

## Contribution Model

Contributions should be:

- public
- reusable
- agent-agnostic
- narrow in scope
- version-aware when relevant

Do not add private company instructions, secret routes, or vendor-specific lock-in inside skills.

## Roadmap

### Current focus

- core routing and compatibility
- Angular architecture and DI
- Angular performance
- TypeScript safety
- public documentation and publish bundles

### Next

- testing strategy skills
- migration helpers
- release notes automation
- richer publish schemas for external catalogs

## License And Safety

NgAutoPilot is released under the MIT license.

If you discover a security issue, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue with details.
