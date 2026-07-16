---
id: angular.architecture.nx-bounded-context-contract
name: Nx Bounded Context Contract
description: >
  Audits Nx monorepo tagging and dependency constraints for Angular bounded contexts so shared UI, shared domain, and shared data-access libraries remain explicitly separated and enforceable.
stack:
  - Angular
  - TypeScript
  - Nx
category: architecture
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - nx bounded context
  - bounded context contract
  - nx tags
  - nx dependency constraints
  - module boundaries
  - bounded context tags
  - nx enforce module boundaries
  - shared ui shared domain shared data access
  - architecture governance
  - monorepo governance
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Nx Bounded Context Contract

## Purpose

Use this skill to design or audit Nx bounded context tags and dependency constraints for Angular monorepos.

This skill ties together shared UI, shared domain, and shared data-access contracts so the repository has explicit and enforceable architecture rules. The goal is not just to prevent bad imports, but to make the intended layering visible in tags, lint rules, and project metadata.

The core rule is simple:

```txt
UI renders and emits intent.
Domain defines meaning and rules.
Data-access fetches and persists.
Features orchestrate across the boundary.
Nx tags enforce that contract.
```

## When to Use

Use this skill when:

- a monorepo needs explicit bounded context tags
- multiple shared libraries need consistent `type:*` and `domain:*` tags
- `@nx/enforce-module-boundaries` is missing, incomplete, or too permissive
- `shared/ui`, `shared/domain`, and `shared/data-access` are present but not coordinated
- imports are drifting across architectural boundaries
- teams need a codified dependency policy for the workspace

## Do

Use stable tag dimensions:

```txt
type:app
type:feature
type:ui
type:domain
type:data-access
type:util

domain:shared
domain:catalog
domain:billing
domain:claims
```

Keep project metadata aligned:

```json
{
  "name": "shared-ui",
  "projectType": "library",
  "root": "libs/shared/ui",
  "sourceRoot": "libs/shared/ui/src",
  "tags": ["type:ui", "domain:shared"]
}
```

Use a single ESLint policy to make the boundaries enforceable:

```js
{
  files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        allow: [],
        depConstraints: [
          {
            sourceTag: 'type:app',
            onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:domain', 'type:data-access', 'type:util']
          },
          {
            sourceTag: 'type:feature',
            onlyDependOnLibsWithTags: ['type:ui', 'type:domain', 'type:data-access', 'type:util']
          },
          {
            sourceTag: 'type:ui',
            onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'domain:shared']
          },
          {
            sourceTag: 'type:domain',
            onlyDependOnLibsWithTags: ['type:domain', 'type:util']
          },
          {
            sourceTag: 'type:data-access',
            onlyDependOnLibsWithTags: ['type:domain', 'type:util']
          }
        ]
      }
    ]
  }
}
```

Make the triad explicit in documentation and code reviews:

```txt
shared/ui -> renders domain-agnostic views
shared/domain -> owns business meaning
shared/data-access -> owns transport and persistence
```

## Do Not

Avoid vague or missing tags:

```txt
misc
common
shared
```

Avoid a permissive boundary setup that lets UI import data-access or domain import Angular components.

Avoid putting feature-specific exceptions into the global rule unless they are documented, rare, and intentional.

## Review Checklist

- [ ] Every project has tags.
- [ ] Shared UI, domain, and data-access are distinguished by `type:*` tags.
- [ ] Shared libraries also carry a `domain:*` tag where relevant.
- [ ] `@nx/enforce-module-boundaries` is enabled.
- [ ] The depConstraints match the intended architecture.
- [ ] The repo documents the three shared contracts together.
- [ ] Exceptions are explicit and minimal.

## Expected Output

When this skill is used, the agent should:

1. Read project tags and ESLint boundary rules.
2. Detect missing or inconsistent tag dimensions.
3. Recommend a bounded-context taxonomy.
4. Align shared UI, domain, and data-access policies.
5. Produce the smallest safe set of changes needed to enforce the contract.
