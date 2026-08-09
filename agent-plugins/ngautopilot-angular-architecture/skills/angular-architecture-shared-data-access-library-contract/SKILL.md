---
name: angular-architecture-shared-data-access-library-contract
description: "Audits and designs Angular shared data-access libraries in Nx monorepos to keep reusable persistence and transport layers free of feature UI, router, and app-specific orchestration concerns."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.shared-data-access-library-contract"
  ngautopilot-source: "skills/angular/architecture/shared-data-access-library-contract/SKILL.md"
  ngautopilot-version: "0.5.3"
---


# Shared Data-Access Library Contract

## Purpose

Use this skill to audit or design Angular shared data-access libraries in Nx monorepos.

A shared data-access library must behave as a reusable persistence or transport contract, not as a place for feature UI, router decisions, or app-specific orchestration. It should expose API clients, repository abstractions, persistence helpers, and stable data-fetching contracts without leaking presentation, feature, or domain composition concerns.

The core rule is simple:

```txt
Data-access libraries fetch, persist, cache, and adapt transport.
Feature libraries decide when to call them.
UI libraries render the result.
Domain libraries define stable business concepts.
```

## When to Use

Use this skill when:

- creating a reusable `shared/data-access` library
- reviewing an API client, repository, or transport layer intended for multiple features
- auditing Nx dependency graph leaks in data-access libraries
- a data-access library imports components, routing, or feature-only state
- a repository starts owning business orchestration that belongs in a facade or feature service
- multiple features need the same transport adapter or persistence helper
- the same API client code is duplicated across several bounded contexts

## Do

Keep shared data-access focused and reusable:

```ts
export interface ProductRepository {
  getById(id: string): Observable<ProductRecord>;
  list(): Observable<readonly ProductRecord[]>;
}

@Injectable({ providedIn: "root" })
export class HttpProductRepository implements ProductRepository {
  constructor(private readonly http: HttpClient) {}

  getById(id: string): Observable<ProductRecord> {
    return this.http.get<ProductRecord>(`/api/products/${id}`);
  }

  list(): Observable<readonly ProductRecord[]> {
    return this.http.get<readonly ProductRecord[]>("/api/products");
  }
}
```

Use adapters when transport and domain shapes differ:

```ts
export interface ProductApiDto {
  id: string;
  title: string;
}

export interface ProductRecord {
  id: string;
  name: string;
}

function mapProduct(dto: ProductApiDto): ProductRecord {
  return {
    id: dto.id,
    name: dto.title,
  };
}
```

Keep orchestration in the feature layer:

```ts
export class ProductsFacade {
  readonly products = signal<readonly ProductRecord[]>([]);

  constructor(private readonly productsRepository: ProductRepository) {}

  loadProducts(): void {
    this.productsRepository
      .list()
      .subscribe((products) => this.products.set(products));
  }
}
```

Example Nx project tags:

```json
{
  "name": "shared-data-access",
  "projectType": "library",
  "root": "libs/shared/data-access",
  "sourceRoot": "libs/shared/data-access/src",
  "tags": ["type:data-access", "domain:shared"]
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
            sourceTag: 'type:data-access',
            onlyDependOnLibsWithTags: ['type:domain', 'type:util']
          },
          {
            sourceTag: 'type:feature',
            onlyDependOnLibsWithTags: ['type:ui', 'type:domain', 'type:data-access', 'type:util']
          }
        ]
      }
    ]
  }
}
```

## Do Not

Avoid UI, router, and feature state in shared data-access:

```ts
export class ProductsRepository {
  private readonly router = inject(Router);
  private readonly productsListComponent = ProductsListComponent;
}
```

Avoid turning repositories into facades:

```ts
loadProductsAndNavigateAndTrackAndShowToast(): void
```

Avoid mixing transport with component rendering, dialog flow, or page orchestration.

Avoid exposing app-specific environment or deployment details as hard-coded behavior unless they are genuine public contract inputs.

## Review Checklist

- [ ] The library is limited to transport, persistence, caching, or adapter concerns.
- [ ] The library does not import feature components or route definitions.
- [ ] The library does not own UI orchestration.
- [ ] The library does not own domain workflow decisions.
- [ ] Public APIs are stable and reusable across features.
- [ ] DTO mapping is explicit where transport and domain differ.
- [ ] Nx tags and boundaries prevent feature or UI dependencies from leaking in.
- [ ] The library is named to reflect a reusable contract.

## Expected Output

When this skill is used, the agent should:

1. Classify the library as shared data-access, feature, domain, or mixed.
2. Inspect imports, injected dependencies, and public API shape.
3. Flag boundary leakage into UI, router, or feature orchestration.
4. Recommend repository, adapter, or facade splits where needed.
5. Produce a refactor plan with validation steps and dependency boundary checks.
