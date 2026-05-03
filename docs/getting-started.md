# Getting Started

NgAutoPilot is distributed as the `ngautopilot` npm package and exposes the `ngautopilot` CLI.

## First Run

Use `npm exec` when you want a deterministic one-off invocation without a global install:

```bash
npm exec --package=ngautopilot -- ngautopilot help
npm exec --package=ngautopilot -- ngautopilot list
npm exec --package=ngautopilot -- ngautopilot init
npm exec --package=ngautopilot -- ngautopilot doctor
```

You can also install it globally:

```bash
npm install -g ngautopilot
ngautopilot help
```

## What `init` Creates

`ngautopilot init` creates a local `.ngautopilot/` directory with:

- `skills/`
- `adapters/`
- `catalog.json`

This keeps the working context explicit and versionable without coupling the repo to a single AI tool.

## Suggested Operating Flow

1. Run `ngautopilot init` in the target repository.
2. Start with `skills/_core/project-intake/SKILL.md`.
3. Continue with `skills/_core/stack-version-detection/SKILL.md`.
4. Route into `skills/_core/skill-router/SKILL.md` and `skills/_core/compatibility-router/SKILL.md`.
5. For Angular work, check `skills/angular/versioning/` before touching upgrade hops.
6. Keep modernization work separate from major-version upgrades.

## Example Routes

Angular upgrade:

```txt
_core/project-intake
_core/stack-version-detection
angular/versioning/angular-version-compatibility-gate
angular/upgrades/hops/angular-14-to-15
_core/risk-assessment
```

Performance audit:

```txt
_core/project-intake
angular/performance/angular-core-web-vitals-audit
angular/performance/onpush-change-detection
```

Quality cleanup:

```txt
_core/project-intake
quality/eslint
quality/sonarqube
```

## Where To Go Next

- CLI details: [cli-reference.md](./cli-reference.md)
- Angular roadmap: [angular-roadmap-guide.md](./angular-roadmap-guide.md)
- Maintainer workflows: [maintainer-guide.md](./maintainer-guide.md)
- Release flow: [release-checklist.md](./release-checklist.md)
