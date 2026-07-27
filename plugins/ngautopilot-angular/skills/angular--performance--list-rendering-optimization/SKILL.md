---
id: angular.performance.list-rendering-optimization
name: Angular List Rendering Optimization
description: >
  Optimizes Angular list rendering by using stable identity tracking with trackBy for legacy templates or @for track for modern Angular.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - list rendering
  - trackBy
  - "@for track"
  - large list
  - DOM recreation
  - virtual scroll
compatibility:
  angular:
    min: "2"
    controlFlowFrom: "17"
    ngForDeprecatedFrom: "20"
---

# Angular List Rendering Optimization

## Purpose

Use this skill to avoid unnecessary DOM recreation in Angular lists by choosing the correct identity tracking pattern for the detected Angular version.

## Compatibility

Use the compatible variant:

- Angular 2-16: use `*ngFor` with `trackBy`.
- Angular 17-19: prefer `@for (...; track item.id)` for new code, while keeping `*ngFor + trackBy` as a valid fallback.
- Angular 20+: avoid introducing new `NgFor` usage; prefer `@for` for new code.

## When to Use

Use this skill when:

- A table, grid, select, search result, feed, or list renders many items.
- The list is refreshed from an API or state store.
- Rows are inserted, deleted, filtered, sorted, or paginated.
- Focus, expanded rows, animations, or child component state are lost after refresh.
- The user reports visible re-rendering or scroll lag.

## Do

For Angular 2-16 or legacy templates, use `trackBy`:

```html
<div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
```

```ts
trackById(_index: number, item: Item): string | number {
  return item.id;
}
```

For Angular 17+ new templates, use `@for` with `track`:

```html
@for (item of items; track item.id) {
<div>{{ item.name }}</div>
}
```

For very large lists, evaluate virtual scrolling after identity tracking is correct.

## Do Not

Avoid missing identity tracking:

```html
<div *ngFor="let item of items">{{ item.name }}</div>
```

Avoid unstable keys:

```html
@for (item of items; track createRandomId(item)) {
<div>{{ item.name }}</div>
}
```

Avoid index tracking for lists that reorder, filter, insert, or delete in the middle.

## Review Checklist

- [ ] The Angular version is checked before choosing `*ngFor` or `@for`.
- [ ] The list has stable identity tracking.
- [ ] The key is unique within the rendered collection.
- [ ] Index tracking is limited to static lists.
- [ ] The template does not transform the list on every render.
- [ ] Virtual scroll is considered only for genuinely large rendered lists.
- [ ] Backend pagination is considered when frontend rendering is not the only bottleneck.

## Expected Output

When this skill is used, the agent should:

1. Detect whether the project uses legacy or modern Angular templates.
2. Add `trackBy` or `@for track` using a stable identifier.
3. Avoid changing list behavior beyond identity tracking.
4. Mention virtual scroll only when list size justifies it.
5. Explain fallback or migration path for older Angular versions.
