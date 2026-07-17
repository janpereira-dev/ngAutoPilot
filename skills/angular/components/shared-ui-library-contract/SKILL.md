---
id: angular.components.shared-ui-library-contract
name: Shared UI Library Contract
description: >
  Audits and designs Angular shared UI/component libraries in Nx monorepos to keep reusable UI contracts free of feature, domain, data-access, store, router, and backend concerns.
stack:
  - Angular
  - TypeScript
  - Nx
category: components
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - shared ui library
  - shared/ui
  - shared ui
  - shared ui contract
  - reusable angular component library
  - shared component contract
  - shared ui audit
  - ui kit
  - ui-kit
  - design system
  - design-system
  - component library
  - nx module boundaries
  - content projection slots
  - design system component
  - component library reuse
  - shared component
  - reusable ui component
  - library contract
  - reusable contract
  - bounded context ui
  - shared domain
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Shared UI Library Contract

## Purpose

Use this skill to audit or design Angular shared UI and component libraries in Nx monorepos.

A shared UI library must behave as a reusable contract, not as a shortcut for app-specific logic. It should expose presentational components, stable APIs, projected content slots, styling conventions, and low-level composition primitives without leaking feature, domain, data-access, store, router, or backend concerns.

The core rule is simple:

```txt
Shared UI receives data and emits events.
Feature libraries decide what the data means.
Data-access libraries fetch and persist data.
Domain libraries own business concepts.
```

## When to Use

Use this skill when:

- creating a reusable Angular component library
- reviewing a `shared/ui`, `ui-kit`, `design-system`, or `component-library`
- auditing Nx dependency graph leaks
- a shared component injects services, stores, facades, routers, API clients, or domain-specific dependencies
- a component has too many configuration inputs
- a reusable component imports models from a feature or domain library
- a shared modal, overlay, dialog, dropdown, tooltip, drag-drop, or focus trap reimplements behavior already available in Angular CDK
- refactors across multiple apps are becoming expensive because "shared" code is not really shared

## Do

Keep shared UI dumb and explicit:

```ts
@Component({
  selector: 'lib-table',
  template: `
    <table>
      <thead>
        <tr>
          <th *ngFor="let column of columns">{{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of rows" (click)="rowSelected.emit(row)">
          <td *ngFor="let column of columns">{{ column.value(row) }}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class TableComponent<T> {
  @Input({ required: true }) rows: readonly T[] = [];
  @Input({ required: true }) columns: readonly TableColumn<T>[] = [];
  @Output() rowSelected = new EventEmitter<T>();
}
```

Prefer content projection over endless configuration:

```ts
@Component({
  selector: 'lib-card',
  template: `
    <article class="card">
      <header class="card__header">
        <ng-content select="[slot=header]" />
      </header>

      <section class="card__body">
        <ng-content />
      </section>

      <footer class="card__footer">
        <ng-content select="[slot=footer]" />
      </footer>
    </article>
  `,
})
export class CardComponent {}
```

Consumer-owned content stays in the app or feature library:

```html
<lib-card>
  <h2 slot="header">Product detail</h2>

  <app-product-summary [product]="product()" />

  <div slot="footer">
    <button type="button" (click)="cancel()">Cancel</button>
    <button type="button" (click)="save()">Save</button>
  </div>
</lib-card>
```

Enforce module boundaries in Nx:

```json
{
  "name": "shared-ui",
  "projectType": "library",
  "tags": ["type:ui", "domain:shared"]
}
```

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
            sourceTag: 'type:ui',
            onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'domain:shared']
          },
          {
            sourceTag: 'type:feature',
            onlyDependOnLibsWithTags: [
              'type:ui',
              'type:domain',
              'type:data-access',
              'type:util'
            ]
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

Build on Angular CDK instead of rebuilding behavior:

```txt
CDK owns behavior.
Design system owns look.
Feature libraries own content.
```

Example Nx project tags:

```json
{
  "name": "shared-ui",
  "projectType": "library",
  "root": "libs/shared/ui",
  "sourceRoot": "libs/shared/ui/src",
  "tags": ["type:ui", "domain:shared"]
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
            sourceTag: 'type:ui',
            onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'domain:shared']
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

Avoid smart logic in shared UI:

```ts
export class ProductTableComponent {
  private readonly productsService = inject(ProductsService);
  private readonly store = inject(Store);

  readonly products$ = this.store.select(selectProducts);
}
```

Avoid shared components that navigate, fetch data, or own domain rules:

```ts
this.router.navigate(['/products', product.id]);
this.http.get<ProductDto[]>('/api/products');
```

Avoid over-configured APIs that become a second framework:

```ts
@Input() config!: {
  title: string;
  subtitle: string;
  actions: Array<{
    label: string;
    icon: string;
    visibleWhen: (row: ProductDto) => boolean;
    execute: (row: ProductDto) => void;
  }>;
};
```

Avoid reimplementing low-level interaction behavior that Angular CDK already provides for overlays, dialogs, focus management, drag and drop, portals, menus, scrolling, and accessibility primitives.

## Review Checklist

- [ ] The library is actually shared UI and not mixed with feature, domain, data-access, router, or store concerns.
- [ ] Shared UI components do not inject feature-specific services.
- [ ] Shared UI components do not make API calls.
- [ ] Shared UI components do not own app-specific state or navigation.
- [ ] Public APIs are small, stable, and typed.
- [ ] Content-heavy regions use `ng-content` instead of excessive inputs.
- [ ] Nx tags exist for affected projects.
- [ ] `@nx/enforce-module-boundaries` is configured and enforced.
- [ ] Angular CDK is reused where complex behavior already exists.
- [ ] Public API exports only reusable contracts.

## Expected Output

When this skill is used, the agent should:

1. Classify the library as shared UI, feature, data-access, domain, util, or mixed.
2. Inspect imports, injected dependencies, and public API shape.
3. Flag any dependency or boundary leakage.
4. Recommend projection, typed inputs, or CDK primitives where appropriate.
5. Produce a refactor plan with severity and validation steps.
