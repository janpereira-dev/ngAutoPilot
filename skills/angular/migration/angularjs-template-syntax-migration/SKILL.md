---
id: angular.migration.angularjs-template-syntax-migration
name: AngularJS Template Syntax Migration
description: >
  Migrates AngularJS template syntax to modern Angular template syntax using a bounded, version-aware transformation pass.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - AngularJS templates
  - template migration
  - ng-repeat
  - ng-if
  - ng-click
  - AngularJS to Angular HTML
compatibility:
  angularjs:
    min: "1.x"
  angular:
    min: "2"
---

# AngularJS Template Syntax Migration

## Purpose

Use this skill to convert AngularJS template syntax to Angular template syntax in a controlled way.

This skill only handles template syntax and template-adjacent binding changes. It does not migrate controllers, services, routing, or forms by itself.

## When to Use This Skill

Use this skill when:

- AngularJS templates have been inventoried.
- The migration strategy is already selected.
- You need to convert markup such as `ng-repeat`, `ng-if`, `ng-click`, `ng-class`, or `ng-style`.
- The task is limited to HTML and template bindings.
- The next slice must be small and reviewable.

## When Not to Use This Skill

Do not use this skill when:

- Template inventory has not been created.
- The migration strategy is still undecided.
- The task also requires controller, service, or routing migration in the same pass.
- The repository is already Angular-only and contains no AngularJS templates.

## Inputs Expected

- Template inventory
- Target Angular major
- Template locations
- Current AngularJS directives and bindings
- Whether the project can use modern Angular control flow
- Validation commands

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS 1.x templates | Convert incrementally | Keep behavior stable while changing syntax. |
| Angular 2+ legacy templates | Use `*ngIf`, `*ngFor`, property binding, event binding, and `ngClass`/`ngStyle` equivalents | Do not assume control flow syntax is available. |
| Angular 17+ | Prefer modern control flow only when the repository supports it | Keep the conversion version-aware. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Read the template inventory.
2. Detect the supported Angular syntax for the target project.
3. Convert one template slice at a time.
4. Preserve semantics for conditions, loops, bindings, classes, styles, and events.
5. Update references to moved logic only when required.
6. Validate the changed template slice.
7. Report any remaining legacy syntax.

## Do

- Convert markup in bounded slices.
- Prefer direct Angular equivalents for AngularJS directives.
- Preserve visual behavior and event behavior.
- Keep interpolation and bindings as simple as possible.
- Treat template syntax changes separately from business-logic migration.
- Use version evidence before introducing modern control flow.

## Recommended Patterns

Use Angular template equivalents where appropriate:

| AngularJS | Angular |
|---|---|
| `ng-repeat="item in items"` | `*ngFor="let item of items"` or `@for` when supported |
| `ng-if="condition"` | `*ngIf="condition"` or `@if` when supported |
| `ng-click="save()"` | `(click)="save()"` |
| `ng-class="{ active: isActive }"` | `[ngClass]="{ active: isActive }"` |
| `ng-style="{ width: width + 'px' }"` | `[ngStyle]="{ width: width + 'px' }"` |
| `ng-hide="hidden"` | `[hidden]="hidden"` or structural equivalent |
| `ng-show="shown"` | `[hidden]="!shown"` or structural equivalent |
| `ng-src="{{ imageUrl }}"` | `[src]="imageUrl"` |
| `ng-href="{{ url }}"` | `[href]="url"` or `routerLink` when routing applies |
| interpolation-heavy conditionals | derived state or component property |

Prefer stable tracking when converting repeated lists:

```html
<li *ngFor="let item of items; trackBy: trackById">
  {{ item.name }}
</li>
```

```ts
trackById(_index: number, item: Item): string | number {
  return item.id;
}
```

If the target project supports modern control flow, use it only when confirmed:

```html
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

## Anti-Patterns

- Rewriting controllers and templates in the same pass.
- Introducing unsupported Angular syntax for the detected version.
- Converting everything to modern control flow without version evidence.
- Preserving AngularJS-specific attribute names in Angular output.
- Moving business logic into the template during migration.
- Using unstable track keys during list conversion.

## Do Not

- Do not migrate services, directives, routing, or forms in this skill.
- Do not invent Angular version support.
- Do not convert the whole app in one change.
- Do not change user-facing text unless the binding syntax requires it.
- Do not run commands that do not exist in the repository.

## Review Checklist

- [ ] Template inventory exists.
- [ ] Target Angular syntax is supported by project evidence.
- [ ] Only template syntax was changed.
- [ ] Behavior remained stable after conversion.
- [ ] List tracking was preserved where needed.
- [ ] No unsupported control flow syntax was introduced.
- [ ] Validation was planned or executed.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the smallest safe next action.

## Risks

- A template conversion can accidentally change behavior if bindings are misunderstood.
- Modern control flow may be unsupported in the detected Angular version.
- List identity may degrade if `trackBy` or `track` is omitted.
- Template changes can expose hidden controller coupling.

## Expected Output

When this skill is used, return:

1. Template inventory summary.
2. Supported Angular template syntax.
3. Converted syntax slice.
4. Remaining legacy syntax.
5. Validation commands and results.
6. Next recommended skill.

## Exit Criteria

This skill is complete only when:

- Template inventory exists.
- One bounded template slice was converted.
- Behavior remains stable.
- No unsupported syntax was introduced.
- The next migration step is clear.

