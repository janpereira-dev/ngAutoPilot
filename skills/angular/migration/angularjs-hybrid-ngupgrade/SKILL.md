---
id: angular.migration.angularjs-hybrid-ngupgrade
name: AngularJS Hybrid ngUpgrade
description: >
  Sets up and manages a hybrid AngularJS and Angular runtime using ngUpgrade or equivalent coexistence patterns in bounded migration slices.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - ngUpgrade
  - hybrid AngularJS Angular
  - coexistence runtime
  - downgrade component
  - upgrade module
compatibility:
  angularjs:
    min: "1.x"
  angular:
    min: "2"
---

# AngularJS Hybrid ngUpgrade

## Purpose

Use this skill to set up and manage a hybrid AngularJS + Angular runtime during incremental modernization.

This skill is for coexistence, boundary definition, and bounded migration slices. It is not a full rewrite and not a permanent end state.

## When to Use This Skill

Use this skill when:

- The app is too large or coupled for a rewrite-by-feature approach.
- AngularJS and Angular must run side by side.
- Route-by-route or component-by-component migration is required.
- The modernization plan needs a temporary coexistence layer.

## When Not to Use This Skill

Do not use this skill when:

- The repository is already fully Angular.
- The migration can be done safely without hybrid runtime.
- There is no decommission plan for AngularJS.
- The team cannot support the added complexity of two runtimes.

## Inputs Expected

- Inventory summary
- Selected migration strategy
- Root bootstrap details
- AngularJS module structure
- Angular module structure
- Routing and ownership boundaries
- Validation commands

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS 1.x + Angular 2+ | Hybrid coexistence | Keep a clear boundary and a decommission plan. |
| Angular 16+ | Newer Angular features may be available if the project supports them | Do not force modern APIs into the coexistence layer without evidence. |
| Angular 17+ | Modern router or template syntax may be available in Angular zones | Limit modern syntax to the Angular side where supported. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Identify the coexistence boundary.
2. Define which framework owns which routes or features.
3. Configure bootstrap and module bridges if needed.
4. Migrate one bounded slice behind the hybrid boundary.
5. Validate both runtimes together.
6. Document the decommission path.

## Do

- Keep the hybrid boundary explicit.
- Migrate only a bounded slice at a time.
- Preserve routing and shared services behavior.
- Keep upgrade and downgrade directions understandable.
- Maintain a decommission plan from the beginning.
- Validate both runtimes after each slice.

## Recommended Patterns

Use hybrid runtime only as a temporary bridge:

- AngularJS owns legacy routes until they are migrated.
- Angular owns new or migrated routes.
- Shared services are bridged explicitly.
- Cross-framework communication is deliberate, not ad hoc.

Document which framework owns each boundary.

## Anti-Patterns

- Leaving hybrid runtime in place indefinitely.
- Migrating everything except the decommission plan.
- Hiding AngularJS and Angular ownership inside global state.
- Mixing route migration, service migration, and template conversion in one uncontrolled pass.
- Introducing modern Angular features into the hybrid boundary without version evidence.

## Do Not

- Do not treat hybrid runtime as the final architecture.
- Do not keep two systems active without ownership boundaries.
- Do not skip validation because the coexistence layer is “temporary.”
- Do not add unrelated refactors while setting up the bridge.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] The coexistence boundary is explicit.
- [ ] AngularJS and Angular ownership is documented.
- [ ] The slice is bounded.
- [ ] A decommission plan exists.
- [ ] Both runtimes were validated together.
- [ ] No permanent hybrid assumption was introduced.
- [ ] No unrelated files were changed.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- Hybrid complexity can become permanent if decommission is ignored.
- Cross-framework bindings can hide lifecycle bugs.
- Shared state can make runtime ownership unclear.
- Unsupported Angular syntax can leak into the bridge layer if version evidence is missing.

## Expected Output

When this skill is used, return:

1. Coexistence boundary.
2. Ownership split between AngularJS and Angular.
3. Slice migrated or planned.
4. Decommission path.
5. Validation commands and results.
6. Next recommended skill.

## Exit Criteria

This skill is complete only when:

- The coexistence boundary is explicit.
- One bounded slice is defined or executed.
- The decommission plan exists.
- Validation was run or planned.
- The next step is clear.

