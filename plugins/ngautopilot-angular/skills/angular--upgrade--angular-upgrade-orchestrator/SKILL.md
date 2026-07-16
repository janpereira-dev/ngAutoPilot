---
id: angular.upgrade.angular-upgrade-orchestrator
name: Angular Upgrade Orchestrator
description: >
  Coordinates Angular 2+ major-version upgrades by detecting the source version, selecting the next allowed hop, and delegating execution to a bounded hop skill.
stack:
  - Angular
  - TypeScript
  - RxJS
category: upgrades
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - Angular upgrade
  - major version hop
  - next Angular version
  - upgrade route planner
  - Angular version chain
compatibility:
  angular:
    min: "2"
    max: "22"
---

# Angular Upgrade Orchestrator

## Purpose

Use this skill to coordinate an Angular 2+ upgrade path by detecting the current major, choosing the next valid hop, and routing the work to a bounded hop skill.

This skill does not perform the full upgrade itself. It plans the path one major at a time and stops after selecting the next hop.

## When to Use This Skill

Use this skill when:

- The repository already uses Angular 2+.
- The goal is to upgrade toward a later Angular major.
- You need to decide the next valid hop from the current installed version.
- The project may need a multi-step chain such as `12 -> 13 -> 14 -> ... -> 21`.
- Validation and rollback control matter.
- The upgrade path crosses the Angular 5 -> 6 boundary and must account for CLI, RxJS, and workspace migration.

## When Not to Use This Skill

Do not use this skill when:

- The project is AngularJS 1.x and needs legacy modernization instead.
- The task is already a bounded hop like Angular 2 to Angular 4.
- The repository has no Angular version evidence yet.
- The work is only about performance, routing, forms, or migration detail.

For AngularJS, route to:

```txt
skills/angular/migration/angularjs-to-angular-modernization-orchestrator/SKILL.md
```

For a bounded hop, route to the relevant hop skill such as:

```txt
skills/angular/upgrades/hops/angular-2-to-4/SKILL.md
```

## Inputs Expected

- `package.json`
- lockfile
- Angular package versions
- TypeScript version
- RxJS version
- zone.js version
- Angular CLI or workspace config
- build/test/lint scripts
- migration constraints
- rollback expectations

## Compatibility by Version

| Angular source | Strategy recommended                                  | Observations                                   |
| -------------- | ----------------------------------------------------- | ---------------------------------------------- |
| Angular 2+     | Upgrade one major hop at a time                       | Do not skip validation between hops.           |
| Angular 2-4    | Use the matching hop skill                            | Route to `angular-2-to-4` first if needed.     |
| Angular 5+     | Continue with the next major hop skill                | Do not batch multiple majors in one execution. |
| Angular 17+    | Modern APIs may be available depending on the project | Verify before recommending them.               |
| Angular 21     | Route to `skills/angular/upgrades/21-to-22/angular-21-to-22-upgrade-orchestrator/SKILL.md` | Keep the hop separate from Angular 22 modernization satellites. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

For Angular 6+ planning, treat these as explicit route constraints:

- Angular CLI workspace migration may be required.
- RxJS compatibility and temporary bridges may need a gate.
- `HttpClient` migration may be a separate bounded slice depending on scope.
- A failed validation gate blocks the next major hop.

## Procedure

1. Detect the installed Angular major.
2. Detect TypeScript, RxJS, and zone.js compatibility constraints.
3. Determine whether the project is already within a supported hop boundary.
4. Select the next allowed hop skill.
5. If the source is far behind, build the full major-by-major route.
6. Delegate execution to exactly one hop skill.
7. If the route crosses Angular 6+, ensure the validation gate is part of the plan.
8. Stop after the selected hop is defined.

## Do

- Plan only the next hop or the full major route, not the entire implementation.
- Keep AngularJS modernization separate from Angular 2+ upgrades.
- Preserve validation and rollback between hops.
- State the next hop explicitly.
- Use version evidence from the repository before recommending APIs.
- Treat Angular 6+ as a stricter planning zone because the workspace and RxJS model change.

## Recommended Patterns

Represent the route as a chain of majors:

```txt
source -> source+1 -> source+2 -> ... -> target
```

Example:

```txt
12 -> 13 -> 14 -> 15 -> 16 -> 17 -> 18 -> 19 -> 20 -> 21 -> 22
```

Delegate the actual code changes to the matching hop skill.

## Anti-Patterns

- Skipping from one Angular major to a much later major in a single execution.
- Mixing AngularJS modernization with Angular 2+ upgrade planning.
- Guessing the next hop without version evidence.
- Performing dependency changes, code changes, and later hops in the same decision step.
- Creating a generic `vX -> v21` skill with its own upgrade logic.

## Do Not

- Do not upgrade multiple majors without validation between hops.
- Do not invent APIs or dependency versions.
- Do not start the next hop automatically.
- Do not run commands that do not exist in `package.json`.
- Do not conflate version planning with code transformation.

## Review Checklist

- [ ] Source Angular version is confirmed.
- [ ] TypeScript and RxJS constraints were checked.
- [ ] The next valid hop is explicit.
- [ ] AngularJS modernization was separated if applicable.
- [ ] Only one hop was selected for execution.
- [ ] The next hop skill is named.
- [ ] Validation and rollback are considered.
- [ ] If the route crosses Angular 6+, the validation gate is included in the plan.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- Skipping hops can create compatibility breaks.
- Planning without version evidence can select the wrong next step.
- Mixing upgrade planning with migration details can blur ownership.
- Route planning can become stale if package versions change midstream.

## Expected Output

When this skill is used, return:

1. Source Angular major.
2. Target Angular major.
3. Version constraints discovered.
4. Next hop skill.
5. Full route if multiple hops remain.
6. Validation commands and results.

## Exit Criteria

This skill is complete only when:

- The source Angular major is detected.
- The next hop is explicit.
- The route is bounded or fully enumerated.
- No code transformation has been performed.
