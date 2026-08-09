---
id: angular.performance.template-logic-optimization
name: Angular Template Logic Optimization
description: >
  Detects and refactors expensive, impure, or repeated logic in Angular templates into precomputed state, view models, pure pipes, or computed signals.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - heavy template logic
  - compute in template
  - template method call
  - template expression
  - computed signal
compatibility:
  angular:
    min: "2"
    signalsFrom: "16"
    controlFlowFrom: "17"
---

# Angular Template Logic Optimization

## Purpose

Use this skill to reduce repeated work in Angular templates by moving costly or impure logic into the component, a view model, a pure pipe, or a computed signal.

## Compatibility

Use the compatible variant:

- Angular 2+: use precalculated properties, view models, and pure pipes.
- Angular 16+: use `computed` when the project already uses signals.
- Angular 17+: use modern control flow for readability when the project supports it.

Do not treat every function call in a template as a defect. Focus on functions that are expensive, impure, allocate objects, transform collections, or run inside large loops.
If a template method is trivial and stable, document it rather than refactoring it out.

## When to Use

Use this skill when:

- Templates call methods from interpolation, bindings, `*ngIf`, `*ngFor`, `@if`, or `@for`.
- Template expressions filter, map, sort, reduce, or allocate arrays.
- Permission checks, totals, formatting, or derived state are recalculated often.
- A component has rendering lag and complex HTML.
- The same derived value is displayed multiple times.

## Do

Precalculate simple component state:

```ts
readonly total = this.calculateTotal(this.items);
```

```html
{{ total }}
```

Use computed signals when supported:

```ts
readonly total = computed(() =>
  this.items().reduce((sum, item) => sum + item.price, 0),
);
```

```html
{{ total() }}
```

Use a pure pipe for reusable deterministic view transformations:

```html
{{ items | totalPrice }}
```

## Do Not

Avoid expensive template calls:

```html
{{ computeTotal(items) }}

<div *ngIf="checkUserPermissions(user)">...</div>
```

Avoid collection work in templates:

```html
<app-list [items]="items.filter(isVisible).map(toViewModel)" />
```

Avoid side effects from template methods.

Avoid putting filters, sorts, permission checks, or object creation directly into repeated bindings when the result can be derived once.

When the project uses signals, prefer `computed` for local derived state; otherwise keep the derivation in the component, a facade, or a pure pipe.

## Review Checklist

- [ ] Template method calls are inspected before refactoring.
- [ ] Expensive or repeated calculations are moved out of the template.
- [ ] Collection transformations do not run directly in HTML.
- [ ] Pure pipes are used only for pure reusable transformations.
- [ ] `computed` is used only when Angular signals are available and appropriate.
- [ ] The template remains declarative and readable.
- [ ] Tests cover changed derived values when behavior changes.

## Expected Output

When this skill is used, the agent should:

1. Identify expensive, impure, or repeated template logic.
2. Choose a compatible replacement pattern.
3. Preserve output while reducing repeated work.
4. Avoid turning the template into a business-logic layer.
5. Explain why trivial template expressions may remain unchanged.
