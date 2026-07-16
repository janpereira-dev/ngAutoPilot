---
id: angular.upgrade.angular-upgrade-route-planner
name: Angular Upgrade Route Planner
description: >
  Builds a major-by-major Angular upgrade route from the detected source major to the target major and selects the next hop only.
stack:
  - Angular
  - TypeScript
  - RxJS
category: upgrades
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - Angular upgrade route
  - major-by-major plan
  - next hop selection
  - upgrade chain
compatibility:
  angular:
    min: "2"
    max: "22"
---

# Angular Upgrade Route Planner

## Purpose

Use this skill to build the Angular upgrade route one major at a time and select the next hop only.

This skill does not change code. It converts version evidence into an ordered hop plan and hands the next hop to the appropriate executor.

## When to Use This Skill

Use this skill when:

- The source Angular major is known.
- The target Angular major is known.
- A multi-hop upgrade route is required.
- The project must move through majors sequentially.
- You need the next hop only, not the full implementation.
- The route may cross the Angular 5 -> 6 boundary and must account for stricter workspace and RxJS changes.

## When Not to Use This Skill

Do not use this skill when:

- The source Angular major is unknown.
- The project is AngularJS 1.x and needs legacy modernization.
- The task is already a bounded hop executor.
- The user wants code changes rather than route planning.

## Inputs Expected

- Source Angular major
- Target Angular major
- TypeScript and RxJS constraints
- zone.js constraints
- Workspace or CLI context
- Delivery and rollback constraints

## Compatibility by Version

| Source major | Strategy recommended                                             | Observations                    |
| ------------ | ---------------------------------------------------------------- | ------------------------------- |
| Angular 2+   | Plan one hop at a time                                           | Do not skip majors.             |
| Angular 2-4  | Route to `angular-2-to-4` if needed                              | Use the matching hop executor.  |
| Angular 5+   | Build the remaining chain major by major                         | Validate after each hop.        |
| Angular 17+  | Check whether modern syntax or tooling can be used in later hops | Verify support before planning. |
| Angular 21   | Route to `skills/angular/upgrades/21-to-22/angular-21-to-22-upgrade-orchestrator/SKILL.md` | Use the bounded Angular 21 -> 22 hop and route v22 risks to satellites. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

If the route crosses Angular 6+, include these planning notes:

- workspace migration to `angular.json` may be required
- RxJS bridge strategy must be explicit
- `HttpClient` migration may need its own bounded slice
- validation gate must run before the next hop

## Procedure

1. Read the detected source major.
2. Read the target major.
3. Compute the full route as a major chain.
4. Select the next hop only.
5. Attach constraints relevant to that hop.
6. Hand off to the matching hop skill.
7. Stop after producing the next hop plan.

## Do

- Use a strict major-by-major route.
- Select exactly one next hop for execution.
- Keep the route compatible with the detected constraints.
- Record the remaining hops without executing them.
- Preserve rollback and validation between hops.
- Mark Angular 6+ as a stricter route zone when CLI/RxJS/workspace changes are in play.

## Recommended Patterns

Represent the route as a simple ordered chain:

```txt
source -> source+1 -> source+2 -> ... -> target
```

Example:

```txt
12 -> 13 -> 14 -> 15 -> 16 -> 17 -> 18 -> 19 -> 20 -> 21 -> 22
```

Example output structure:

```md
## Planned Route

- next hop: 12 -> 13
- remaining hops: 13 -> 14 -> ... -> 21
- executor: skills/angular/upgrades/hops/angular-12-to-13/SKILL.md
```

## Anti-Patterns

- Jumping multiple majors in one hop.
- Planning beyond the detected target without evidence.
- Mixing route planning with dependency changes.
- Skipping validation between hops.
- Treating AngularJS modernization as part of the same route.

## Do Not

- Do not change code.
- Do not change dependencies.
- Do not start the next hop automatically.
- Do not invent version support.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] Source major is known.
- [ ] Target major is known.
- [ ] Full route was computed.
- [ ] Next hop is explicit.
- [ ] Remaining hops are listed.
- [ ] No code or dependency changes were made.
- [ ] If the route crosses Angular 6+, workspace and RxJS constraints were recorded.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- An incorrect source major produces the wrong route.
- Skipping hops can break compatibility.
- A route planner can become stale if dependencies change before execution.

## Expected Output

When this skill is used, return:

1. Source major.
2. Target major.
3. Full hop route.
4. Next hop skill.
5. Remaining hops.
6. Validation commands and results.

## Exit Criteria

This skill is complete only when:

- The full route is computed.
- The next hop is explicit.
- The next hop skill is named.
- No code or dependency changes have been made.
