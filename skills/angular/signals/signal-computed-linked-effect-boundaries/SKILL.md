---
id: angular.signals.signal-computed-linked-effect-boundaries
name: Angular Signals Responsibility Boundaries
description: >
  Separates signal(), computed(), linkedSignal(), effect(), resource(), and template responsibilities to avoid mixing source state, derivation, writable dependent state, reactive contexts, and external side effects.
stack:
  - Angular
  - TypeScript
category: signals
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - angular signals boundaries
  - signal computed linkedSignal effect
  - effect state propagation
  - linkedSignal derived state
  - angular reactive context
  - signals architecture
  - signal responsibility model
compatibility:
  angular:
    min: "16"
    linkedSignalFrom: "19"
    resourceFrom: "19"
    recommendedModern: "19+"
    currentSafe: "21"
---

# Angular Signals Responsibility Boundaries

## Purpose

Use this skill to separate Angular signal responsibilities correctly:

- `signal()` owns mutable source state.
- `computed()` owns pure readonly derivation.
- `linkedSignal()` owns dependent writable state with controlled override.
- `resource()` owns async signal-based state boundaries.
- Templates and host bindings consume signals for rendering.
- `effect()` and `afterRenderEffect()` run external side effects for non-signal APIs.

The goal is to avoid mixing state ownership, derivation, reactive execution context, rendering, async loading, and side effects in the same reactive block.

Use this decision model before changing code:

```txt
signal              -> mutable source state
computed            -> pure readonly derivation
linkedSignal        -> dependent writable state with controlled override
resource            -> async signal-based state boundary
template/host       -> reactive rendering consumer
effect              -> external side effect before DOM render commit
afterRenderEffect   -> external DOM or rendering side effect after DOM render commit
```

Default to this order:

```txt
signal -> computed -> linkedSignal -> resource/template -> effect/afterRenderEffect
```

## When to Use

Use this skill when Angular components, directives, services, or signal stores contain:

- derived state implemented with `effect()`;
- writable state that should be a `computed()`;
- `computed()` values being treated as writable;
- manual synchronization between signals;
- UI state derived from inputs, route params, resources, forms, or other signals;
- `effect()` used for business rules, state propagation, or internal data transformation;
- signal reads inside templates, host bindings, computed values, linked signals, effects, after-render effects, resource params, or resource loaders;
- async logic that assumes signal reads after `await` are tracked by the original reactive context.

## Do

Identify explicit source state first:

```ts
readonly searchTerm = signal('');
readonly items = signal<Item[]>([]);
readonly selectedId = signal<string | null>(null);
```

Move pure derivations to `computed()`:

```ts
readonly filteredItems = computed(() => {
  const term = this.searchTerm().trim().toLowerCase();

  return this.items().filter((item) =>
    item.name.toLowerCase().includes(term),
  );
});
```

Use `linkedSignal()` only when the value is derived from another signal and still has a valid manual override:

```ts
readonly options = signal<Option[]>([]);

readonly selectedOption = linkedSignal<Option[], Option | undefined>({
  source: this.options,
  computation: (options, previous) => {
    return (
      options.find((option) => option.id === previous?.value?.id) ??
      options[0]
    );
  },
});

selectOption(optionId: string): void {
  const option = this.options().find((item) => item.id === optionId);

  if (option) {
    this.selectedOption.set(option);
  }
}
```

Keep `effect()` at the boundary with non-signal APIs:

```ts
constructor(private readonly analytics: AnalyticsService) {
  effect(() => {
    this.analytics.trackSearch(this.searchTerm());
  });
}
```

Use `afterRenderEffect()` only when the side effect needs the DOM after Angular has rendered:

```ts
constructor(private readonly chart: ChartAdapter) {
  afterRenderEffect(() => {
    this.chart.render(this.chartData());
  });
}
```

Read tracked signals before an async boundary:

```ts
effect(async () => {
  const theme = this.theme();

  await this.loadData();

  this.logger.info('Loaded data for theme', theme);
});
```

Use `untracked()` only for incidental reads that must not become dependencies:

```ts
effect(() => {
  const user = this.currentUser();

  untracked(() => {
    this.logger.info('User changed', {
      user,
      counter: this.counter(),
    });
  });
});
```

## Do Not

Do not copy one signal into another with `effect()`:

```ts
readonly total = signal(0);

constructor() {
  effect(() => {
    this.total.set(this.items().length);
  });
}
```

Prefer:

```ts
readonly total = computed(() => this.items().length);
```

Do not treat `computed()` as writable:

```ts
readonly total = computed(() => this.items().length);

updateTotal(): void {
  this.total.set(10);
}
```

Do not introduce `linkedSignal()` just because `computed()` is readonly. If there is no valid manual override, use `computed()`.

Do not put business rules in `effect()` when the rule can be expressed as source state plus pure derivation.

Do not rely on signal reads after `await` to be tracked by the same reactive context:

```ts
effect(async () => {
  await this.loadData();
  this.logger.info(this.theme());
});
```

Do not hide unclear state ownership with `untracked()`.

Do not place expensive logic directly in templates or host bindings. Use `computed()` for memoized derivation and keep rendering expressions simple.

## Review Checklist

- [ ] Source state uses `signal()` or an existing owned state boundary.
- [ ] Pure derived state uses `computed()`.
- [ ] Editable dependent state uses `linkedSignal()` only when manual override is valid.
- [ ] Async signal-based state is isolated behind `resource()` or the existing async model.
- [ ] Templates and host bindings only perform simple rendering reads.
- [ ] `effect()` is limited to external side effects and non-signal APIs.
- [ ] `afterRenderEffect()` is limited to DOM or rendering work that requires committed DOM.
- [ ] No `effect()` only copies one signal into another.
- [ ] No `computed()` is treated as writable.
- [ ] No business rule depends on effect execution order.
- [ ] No circular update path exists.
- [ ] No signal read after `await` is incorrectly assumed to be tracked.
- [ ] Expensive derivations are memoized with `computed()`.
- [ ] Tests cover default value, source changes, and manual overrides for `linkedSignal()`.
- [ ] Cleanup exists when an effect starts timers, subscriptions, rendering handles, or other long-running work.

## Expected Output

When this skill is used, the agent should return:

1. A diagnosis of current state ownership and reactive consumers.
2. A minimal refactor plan separating source state, pure derivation, dependent writable state, async boundaries, rendering, and external side effects.
3. Code changes that prefer `computed()` over effect-based propagation.
4. A justification for each `linkedSignal()`, `resource()`, `effect()`, or `afterRenderEffect()` that remains.
5. Validation steps or tests proving the reactive flow.
6. Risks, especially circular updates, stale async assumptions, heavy template logic, and unclear manual overrides.

## Common Refactors

### Refactor effect-based derivation to computed

Before:

```ts
readonly fullName = signal('');

constructor() {
  effect(() => {
    this.fullName.set(`${this.firstName()} ${this.lastName()}`);
  });
}
```

After:

```ts
readonly fullName = computed(() => {
  return `${this.firstName()} ${this.lastName()}`;
});
```

### Refactor editable computed to linkedSignal

Before:

```ts
readonly defaultTab = computed(() => this.tabs()[0]);

selectTab(tab: Tab): void {
  this.defaultTab.set(tab);
}
```

After:

```ts
readonly selectedTab = linkedSignal<Tab[], Tab | undefined>({
  source: this.tabs,
  computation: (tabs, previous) => {
    return tabs.find((tab) => tab.id === previous?.value?.id) ?? tabs[0];
  },
});

selectTab(tab: Tab): void {
  this.selectedTab.set(tab);
}
```

### Refactor heavy template logic to computed

Before:

```html
@for (item of items().filter(matchesSearchTerm); track item.id) {
  <app-item-row [item]="item" />
}
```

After:

```ts
readonly visibleItems = computed(() => {
  return this.items().filter((item) => this.matchesSearchTerm(item));
});
```

```html
@for (item of visibleItems(); track item.id) {
  <app-item-row [item]="item" />
}
```

## Testing Guidance

Test behavior, not Angular internals:

- source signal updates recalculate `computed()` values;
- `computed()` remains readonly by design;
- `linkedSignal()` initializes from the source;
- `linkedSignal()` preserves a valid manual selection after the source changes;
- `linkedSignal()` resets or reconciles when the previous selection is no longer valid;
- `effect()` calls external dependencies only when expected;
- `afterRenderEffect()` integrations are covered with DOM or adapter tests;
- cleanup runs when an effect starts long-running work.

Example:

```ts
it('preserves selected option when the source changes and the option still exists', () => {
  const component = new ShippingMethodPickerComponent();

  component.options.set([
    { id: 'ground', label: 'Ground' },
    { id: 'air', label: 'Air' },
  ]);

  component.selectOption('air');

  component.options.set([
    { id: 'air', label: 'Air updated' },
    { id: 'sea', label: 'Sea' },
  ]);

  expect(component.selectedOption()?.id).toBe('air');
});
```

## Risks

- `effect()` used for state propagation can cause circular updates and extra change detection work.
- `effect()` used for business logic makes behavior harder to predict and test.
- `linkedSignal()` can hide unclear state ownership if overused.
- `computed()` must stay pure and readonly.
- Deep object mutation inside signals can bypass expected update behavior.
- Async logic inside reactive contexts can produce stale assumptions.
- Templates and host bindings are reactive consumers; heavy logic there still hurts maintainability.
- `resource()` should not become a dumping ground for unrelated UI logic.

