---
id: angular.performance.change-detection-optimization
name: Angular Change Detection Optimization
description: >
  Evaluates Angular change detection performance and applies OnPush, signals, async pipe, or immutable state patterns only when compatible and justified.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - change detection optimization
  - OnPush
  - markForCheck
  - detectChanges
  - signals rendering
compatibility:
  angular:
    min: "2"
    signalsFrom: "16"
    recommended: "17+"
---

# Angular Change Detection Optimization

## Purpose

Use this skill to evaluate and improve Angular rendering behavior through `ChangeDetectionStrategy.OnPush`, immutable updates, `async`, signals, and careful manual change detection only when needed.

## Compatibility

Use the compatible variant:

- Angular 2+: `OnPush`, immutable inputs, `async`, `ChangeDetectorRef.markForCheck`, and careful `detectChanges`.
- Angular 16+: signals and `computed` can complement `OnPush` when the project already supports them.
- Angular 17+: combine `OnPush`, signals, and modern template control flow when appropriate.
- All versions: do not use manual detach or `detectChanges` unless the component has high-frequency rendering pressure and clear evidence.

## When to Use

Use this skill when:

- A component has many bindings or expensive child trees.
- A component rerenders often without visible state changes.
- Inputs change frequently or are mutated in place.
- The user asks about `OnPush`, `markForCheck`, signals, or rendering behavior.
- A dashboard, grid, form, or high-frequency stream causes UI lag.

## Do

Apply `OnPush` when data flow is explicit:

```ts
@Component({
  selector: "app-orders-summary",
  templateUrl: "./orders-summary.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersSummaryComponent {
  readonly orders$ = this.ordersService.orders$;
}
```

Prefer immutable updates:

```ts
this.items = [...this.items, newItem];
```

Use computed state when signals are available and already used:

```ts
readonly total = computed(() =>
  this.items().reduce((sum, item) => sum + item.price, 0),
);
```

Use `markForCheck` only when an external imperative callback updates component state outside the normal Angular update path.

## Do Not

Avoid mutating input state under `OnPush`:

```ts
this.items.push(newItem);
```

Avoid using `detectChanges` as a default fix:

```ts
this.changeDetectorRef.detectChanges();
```

Avoid recommending `OnPush` as a magic solution for unclear state ownership or broken data flow.

## Review Checklist

- [ ] The component has a real rendering cost or predictable performance benefit.
- [ ] Inputs and arrays are not mutated directly.
- [ ] Observables used by the template are consumed with `async` when practical.
- [ ] Signals are used only when supported by the Angular version.
- [ ] Manual change detection is avoided unless there is a clear reason.
- [ ] Forms, overlays, timers, and third-party callbacks still update correctly.
- [ ] Tests or manual checks cover the affected rendering path.

## Expected Output

When this skill is used, the agent should:

1. Diagnose the change detection issue before changing code.
2. Select the compatible pattern for the detected Angular version.
3. Apply `OnPush` only when data flow supports it.
4. Replace mutation with immutable updates when required.
5. Explain risks around stale views, manual change detection, and state ownership.
