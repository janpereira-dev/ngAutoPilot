---
id: angular.performance.avoid-template-functions
name: Avoid Template Functions
description: >
  Prevents Angular performance issues caused by calling component methods or expensive expressions directly from templates.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - template function
  - method call in template
  - change detection cost
  - computed signals
  - pure pipe
---

# Avoid Template Functions

## Purpose

Use this skill to reduce repeated computation during Angular change detection by moving expensive template method calls into precomputed state, view models, pure pipes, or computed signals.
This skill overlaps with `template-logic-optimization`; keep `avoid-template-functions` as the concrete detector for method calls in HTML and let the other skill cover broader expression-heavy templates.

## When to Use

Use this skill when:

- A template calls component methods from interpolation, bindings, conditions, or loops.
- A method is called inside `*ngFor` or `@for`.
- A component has slow rendering or frequent change detection.
- A method performs filtering, sorting, formatting, aggregation, permissions logic, or allocation.
- The same derived value is needed multiple times in a template.
- A getter performs non-trivial work every time Angular evaluates the view.

## Do

Prefer precomputed view models:

```ts
readonly itemsViewModel = this.items.map((item) => ({
  ...item,
  displayLabel: `${item.code} - ${item.name}`,
}));
```

```html
@for (item of itemsViewModel; track item.id) {
<span>{{ item.displayLabel }}</span>
}
```

Prefer computed signals for signal-based state:

```ts
readonly visibleItems = computed(() =>
  this.items().filter((item) => item.enabled),
);
```

Prefer pure pipes for reusable, deterministic transformations:

```html
<span>{{ item | itemLabel }}</span>
```

Keep trivial property reads in the template:

```html
<span>{{ item.name }}</span>
```

## Do Not

Avoid expensive method calls in templates:

```html
<span>{{ calculateTotal(order) }}</span>
```

Avoid repeated work inside loops:

```html
<li *ngFor="let item of items">{{ buildDisplayLabel(item) }}</li>
```

Avoid methods that allocate new arrays or objects during change detection:

```html
<app-list [items]="getFilteredItems()" />
```

Avoid using template calls as an escape hatch for derivation that belongs in component state, a facade, a selector, or a pure pipe.

## Review Checklist

- [ ] Template method calls are identified and classified as trivial or risky.
- [ ] Expensive transformations are moved outside the template.
- [ ] Reusable deterministic transformations use pure pipes when appropriate.
- [ ] Signal-based derived state uses `computed` when appropriate.
- [ ] Precomputed view models are updated when source data changes.
- [ ] The refactor does not introduce stale values or mutable shared state.
- [ ] Tests cover changed rendering or transformation behavior.
- [ ] Broad template-expression refactors are delegated to `template-logic-optimization` when the issue is not specifically a method call.

## Expected Output

When this skill is used, the agent should:

1. Find method calls and expensive expressions in Angular templates.
2. Determine which calls can cause repeated work during change detection.
3. Replace risky calls with precomputed values, view models, pure pipes, or computed signals.
4. Keep the template simple and avoid unrelated changes.
5. Add or update tests when rendered values or state derivation changes.
