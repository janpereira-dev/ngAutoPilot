---
id: angular.migration.angularjs-to-angular-modernization-orchestrator
name: AngularJS to Angular Modernization Orchestrator
description: >
  Coordinates an incremental modernization from AngularJS 1.x to modern Angular by detecting legacy evidence, choosing a migration strategy, and routing to the smallest next migration skill.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - AngularJS migration
  - AngularJS modernization
  - ngUpgrade
  - hybrid AngularJS Angular
  - legacy modernization
compatibility:
  angularjs:
    min: "1.x"
  angular:
    min: "2"
    target: "21"
---

# AngularJS to Angular Modernization Orchestrator

## Purpose

Use this skill to coordinate an incremental migration from AngularJS 1.x to modern Angular.

This skill does not perform the full migration itself. It detects AngularJS evidence, classifies the repo, selects a strategy, and routes the task to the smallest next migration skill.

The default target is Angular 21. If the project or delivery constraints require a different target major, that must be stated explicitly before any code changes.

## When to Use This Skill

Use this skill when:

- The repository contains AngularJS 1.x code.
- The task is a modernization or rewrite from AngularJS to Angular.
- The migration needs to be incremental rather than a big-bang rewrite.
- The team needs a strategy decision before touching templates, controllers, services, or routing.
- The user wants a controlled path from legacy AngularJS to modern Angular.

## When Not to Use This Skill

Do not use this skill when:

- The project is already Angular 2+ and only needs a major-version upgrade.
- The task is only about Angular performance, testing, routing, forms, or state within Angular 2+.
- There is no evidence of AngularJS in the repository.
- The request is for a direct code rewrite without migration planning.

For Angular 2+ version upgrades, use the upgrade planning family instead of this legacy modernization orchestrator.

## Inputs Expected

- AngularJS evidence
- Root module or bootstrap entry point
- Build system and package manager
- Target Angular major
- Routing approach currently used
- Test framework and validation commands
- Constraints on downtime, rollout, or rollback

## Compatibility by Version

| Framework         | Strategy recommended                                                                 | Observations                                                                       |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| AngularJS 1.x     | Legacy inventory and migration planning                                              | Do not treat this as `ng update`. It is an architectural modernization.            |
| Angular 2+        | Incremental modernization only if AngularJS remains in the repo                      | Prefer a bounded slice and stop after one hop or one route migration.              |
| Angular 17+       | Modern Angular APIs may be available, but only if the target project supports them   | Do not force standalone, signals, or modern control flow without version evidence. |
| Angular 21 target | Use only as the final modernization target when the project and constraints allow it | Do not skip validation between slices.                                             |

If an API or version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Inspect the repository for AngularJS evidence.
2. Detect the current framework, bootstrap style, and routing style.
3. Inventory the AngularJS surface area.
4. Classify migration risk.
5. Select one primary migration strategy.
6. Route to the smallest next migration skill.
7. Apply at most one bounded migration slice.
8. Validate the slice.
9. Report the next recommended slice.

## Do

- Inspect AngularJS evidence before proposing any migration step.
- Select one migration strategy at a time.
- Route only to the smallest next migration skill.
- Keep the migration bounded to one slice per execution.
- Preserve runtime behavior, route behavior, and user-facing text.
- Use version evidence from the repository before proposing Angular 21 syntax.
- Prefer hybrid or strangler flows when the app cannot be rewritten safely.

## Recommended Patterns

Use the orchestrator to choose among these migration strategies:

- `rewrite-by-feature` for isolated, low-coupling features.
- `hybrid-ngupgrade` for large apps that must run AngularJS and Angular side by side.
- `strangler-by-route` for route-aligned business domains.
- `microfrontend-shell` only when the repository and org already support it.
- `big-bang-rewrite` only when the app is small and the business risk is low.

Prefer one bounded slice per execution.

## Anti-Patterns

- Migrating AngularJS directly to Angular 2 as if that were the final target.
- Skipping inventory and jumping straight into rewrites.
- Migrating templates, services, routing, and forms in the same change.
- Creating a permanent hybrid app with no decommission plan.
- Introducing Angular 21 syntax into a project whose version cannot support it.
- Running multiple upgrade hops without validation between them.

## Do Not

- Do not treat this as a direct `ng update` from AngularJS to Angular 21.
- Do not skip inventory before selecting a migration strategy.
- Do not migrate templates, services, routing, and forms in one pass.
- Do not introduce Angular APIs the repository cannot support.
- Do not create a permanent hybrid app without a decommission plan.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] AngularJS evidence was detected in the repository.
- [ ] The target Angular major is explicit.
- [ ] A single migration strategy was selected.
- [ ] The next migration slice is bounded.
- [ ] Validation commands were checked against `package.json`.
- [ ] No unsupported Angular syntax was introduced.
- [ ] No unrelated files were changed.
- [ ] The output explains the next recommended slice.

## Validation Minimum

Validate using only commands that exist in the repository.

Preferred sequence when available:

- build
- test
- lint

If validation cannot run, report the attempted command and the reason it could not be used.

## Risks

- AngularJS and Angular syntax can coexist incorrectly if the hybrid boundary is unclear.
- Shared services and `$rootScope` patterns can make route-by-route migration unsafe.
- Hidden bootstrap or build assumptions can break the first modernization slice.
- Unsupported Angular APIs can be introduced if version detection is skipped.
- An uncontrolled migration can become a full rewrite without rollback.

## Expected Output

When this skill is used, return:

1. Detected source framework and AngularJS evidence.
2. Target Angular major.
3. Inventory summary.
4. Selected migration strategy.
5. Risk level and main risks.
6. Applied change or next recommended slice.
7. Validation commands and results.
8. Next skill to use.

## Exit Criteria

This skill is applied only when:

- AngularJS evidence has been detected.
- The target Angular major is explicit.
- A migration strategy has been selected.
- The next migration slice is bounded.
- Validation has been planned or executed.
- The result explains what remains for the next slice.
