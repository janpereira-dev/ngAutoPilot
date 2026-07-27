---
id: angular.architecture.shared-domain-library-contract
name: Shared Domain Library Contract
description: >
  Audits and designs Angular shared domain libraries in Nx monorepos to keep reusable business concepts, entities, and policies isolated from UI, transport, and feature orchestration concerns.
stack:
  - Angular
  - TypeScript
  - Nx
category: architecture
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - shared domain
  - shared-domain
  - shared domain contract
  - domain library
  - domain model library
  - business rules library
  - entity library
  - policy library
  - bounded context
  - bounded context domain
  - nx module boundaries
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Shared Domain Library Contract

## Purpose

Use this skill to audit or design Angular shared domain libraries in Nx monorepos.

A shared domain library must behave as a reusable source of business concepts, not as a dumping ground for UI helpers, transport adapters, or feature orchestration. It should expose entities, value objects, policies, rules, and domain-level invariants that can be shared across multiple features or data-access layers without leaking infrastructure or presentation concerns.

The core rule is simple:

```txt
Domain libraries define concepts and rules.
Data-access libraries implement transport and persistence.
Feature libraries orchestrate workflows.
UI libraries render and emit intent.
```

## When to Use

Use this skill when:

- creating a reusable `shared/domain` library
- reviewing entities, value objects, policy objects, or business rule modules
- auditing Nx dependency graph leaks in domain libraries
- a domain library imports Angular components, HTTP clients, routing, or feature state
- multiple features need the same stable business concepts
- a model is duplicated between feature and data-access libraries
- you need a clear boundary between business meaning and infrastructure shape

## Do

Keep shared domain pure and stable:

```ts
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
}

export function canArchiveProduct(product: Product): boolean {
  return product.isActive;
}
```

Prefer explicit value objects and rules:

```ts
export class Money {
  constructor(
    readonly amount: number,
    readonly currency: string,
  ) {}

  isSameCurrency(other: Money): boolean {
    return this.currency === other.currency;
  }
}
```

Keep domain contracts independent from Angular UI and transport details.

Example Nx project tags:

```json
{
  "name": "shared-domain",
  "projectType": "library",
  "root": "libs/shared/domain",
  "sourceRoot": "libs/shared/domain/src",
  "tags": ["type:domain", "domain:shared"]
}
```

Example ESLint boundaries:

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
            sourceTag: 'type:domain',
            onlyDependOnLibsWithTags: ['type:domain', 'type:util']
          },
          {
            sourceTag: 'type:ui',
            onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'domain:shared']
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

## Do Not

Avoid Angular dependencies in domain libraries:

```ts
@Component({
  selector: 'lib-product-name',
  template: `{{ product.name }}`,
})
export class ProductNameComponent {}
```

Avoid HTTP, router, store, or feature orchestration in domain code:

```ts
private readonly http = inject(HttpClient);
this.router.navigate(['/products']);
```

Avoid DTO shape leakage when a stable business concept is needed instead.

## Review Checklist

- [ ] The library contains business concepts, rules, or policies rather than UI or transport logic.
- [ ] The library does not import Angular components or framework orchestration.
- [ ] The library does not depend on HTTP, router, store, or API clients.
- [ ] Domain concepts are stable and reusable across features.
- [ ] Public APIs are explicit and easy to version.
- [ ] Nx tags and boundaries prevent infrastructure or UI dependencies from leaking in.

## Expected Output

When this skill is used, the agent should:

1. Classify the library as shared domain, feature, data-access, UI, or mixed.
2. Identify leaked transport or UI concerns.
3. Recommend pure domain abstractions where needed.
4. Separate stable business concepts from infrastructure DTOs.
5. Produce a refactor plan with validation steps and boundary checks.
