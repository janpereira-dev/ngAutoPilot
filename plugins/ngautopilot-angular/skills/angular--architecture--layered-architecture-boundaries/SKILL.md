---
id: angular.architecture.layered-architecture-boundaries
name: Layered Architecture Boundaries
description: >
  Enforces practical Angular architecture boundaries between UI, feature or application logic, state, services, data access, and core or platform concerns to prevent responsibility leaks and unsafe module or standalone organization.
stack:
  - Angular
  - TypeScript
  - RxJS
category: architecture
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - layered architecture
  - architecture boundaries
  - angular architecture audit
  - responsibility leaks
  - smart shared components
  - feature boundaries
  - standalone first organization
  - module first organization
  - data access boundaries
  - dto leakage
compatibility:
  angular:
    min: "2"
    standaloneDefaultFrom: "19"
    signalsFrom: "16"
    recommendedModern: "17+"
---

# Layered Architecture Boundaries

## Purpose

Use this skill to analyze, design, or refactor Angular applications using explicit boundaries between UI, feature or application logic, state, services, data access, and core or platform concerns.

The goal is not to force one folder structure. The goal is to prevent responsibility leaks, circular dependencies, smart shared components, duplicated business logic, and architecture that only looks clean in diagrams.

## When to Use

Use this skill when:

- reviewing the architecture of an Angular application
- creating or reorganizing feature boundaries
- deciding where components, services, facades, repositories, DTO mappers, or state should live
- splitting a large feature into smaller maintainable areas
- auditing shared libraries in an Angular or Nx workspace
- detecting whether a component, service, or library has too many responsibilities
- migrating from module-first organization to standalone-first organization
- defining import rules between UI, feature, state, services, and data-access layers
- explaining Angular architecture to a team using practical rules instead of diagram-only guidance

## Do

Detect the active architecture style before recommending changes:

```txt
Angular version
Workspace type
Module-first, standalone-first, or hybrid
Feature boundaries
State strategy
Data-access pattern
Shared UI libraries
Quality gates
```

Use the layers as a decision model, not as mandatory folder names:

```txt
UI -> renders and emits user intent
Feature/Application -> orchestrates a use case
State -> owns transitions and derived state
Services/Domain -> owns business rules and policies
Data Access -> owns transport, DTOs, repositories, and mapping
Core/Platform -> owns app-wide infrastructure
```

Apply clear placement rules:

```txt
Component calls HttpClient directly -> move to data access
Shared UI injects a domain service -> move logic to feature/container
API service formats labels for the template -> move to mapper or view-model adapter
Feature imports another feature internals -> expose a public contract
State service handles routing, API, notifications, and formatting -> split responsibilities
Core contains feature business logic -> move to the owning feature or domain layer
```

Prefer minimal, reversible corrections:

1. Move API calls out of components.
2. Introduce or fix a mapper between DTOs and internal models.
3. Split a bloated service by concern.
4. Add a facade when orchestration needs a stable feature boundary.
5. Expose a public API instead of deep imports.
6. Add or update tests around moved logic.
7. Avoid large folder reshuffles without behavioral gain.

Keep Angular compatibility explicit:

```txt
Standalone components are the modern default in current Angular.
NgModules still matter in legacy and hybrid applications.
Do not recommend unsupported APIs for the detected Angular version.
Do not use module boundaries as a substitute for real responsibility boundaries.
```

Use practical inventories when reviewing an existing codebase:

```txt
UI:
Feature/Application:
State:
Services/Domain:
Data Access:
Core/Platform:
Shared:
Testing/Quality:
```

Example bad boundary:

```ts
@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  private readonly http = inject(HttpClient);

  readonly user$ = this.http.get<UserDto>('/api/users/me');
}
```

Better direction:

```txt
data-access/user-api.service.ts
data-access/user.mapper.ts
feature/user-profile.facade.ts
ui/user-card.component.ts
```

## Do Not

Do not treat this as a poster skill or a generic high-level overview.

Do not present feature modules as the only modern Angular organization model.

Do not force standalone-first patterns into legacy module-first codebases without checking version and project constraints.

Do not put feature-specific business logic into `core` or reusable declarations into `shared` if they are actually domain-specific.

Do not let shared UI inject routers, stores, facades, API clients, or domain services.

Do not store raw backend DTOs everywhere when the UI needs a different model.

Do not add NgRx, Signals, facades, or extra libraries by default when local state or a narrower change is enough.

Do not recommend broad folder reshuffles when a small boundary fix solves the real issue.

## Review Checklist

- [ ] The Angular version and project style were detected before making recommendations.
- [ ] The review distinguishes module-first, standalone-first, and hybrid constraints.
- [ ] Each reviewed file or library has a clear architectural responsibility.
- [ ] UI components do not directly own backend communication.
- [ ] Shared UI remains domain-agnostic.
- [ ] Data-access details do not leak unnecessarily into templates.
- [ ] State ownership is explicit.
- [ ] Feature boundaries are not crossed through deep imports.
- [ ] Core or platform code does not contain feature-specific business logic.
- [ ] Recommended changes are minimal and reversible.
- [ ] Existing project validation commands are identified and used when available.

## Expected Output

When this skill is used, the agent should:

1. Detect Angular version, workspace style, and current architectural organization.
2. Build a short layer inventory for the relevant feature, app, or libraries.
3. Flag boundary violations such as UI-owned HTTP, smart shared components, DTO leakage, circular dependencies, and deep imports.
4. Recommend the smallest safe correction with version-aware reasoning.
5. Validate the change using existing project commands and report remaining risks concretely.
