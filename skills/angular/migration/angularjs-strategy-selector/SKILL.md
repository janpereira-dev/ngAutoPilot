---
id: angular.migration.angularjs-strategy-selector
name: AngularJS Strategy Selector
description: >
  Chooses the safest modernization strategy for an AngularJS 1.x repository using inventory facts, migration constraints, and delivery risk.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - migration strategy
  - rewrite by feature
  - strangler route
  - hybrid ngUpgrade
  - AngularJS modernization plan
compatibility:
  angularjs:
    min: "1.x"
---

# AngularJS Strategy Selector

## Purpose

Use this skill to choose one primary modernization strategy for an AngularJS 1.x repository after inventory has been collected.

This skill does not migrate code. It reads the inventory, business constraints, and delivery risks, then selects the safest strategy and explains why.

## When to Use This Skill

Use this skill when:

- AngularJS inventory already exists.
- The repository needs a modernization strategy before code changes.
- You must choose between rewrite, hybrid, route-by-route migration, or microfrontend containment.
- The migration constraints, rollback plan, or delivery window matter.

## When Not to Use This Skill

Do not use this skill when:

- The inventory has not been created yet.
- The task is already a bounded migration slice.
- The repository is only Angular 2+ and needs a major upgrade, not AngularJS modernization.
- The user wants implementation rather than strategy selection.

## Inputs Expected

- Inventory summary
- AngularJS footprint
- Root bootstrap style
- Routing style
- Test coverage and validation readiness
- Rollback requirements
- Team ownership model
- Delivery constraints

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS 1.x | Choose one primary modernization strategy | Do not mix strategies in the same decision. |
| Hybrid AngularJS + Angular | `hybrid-ngupgrade` or `strangler-by-route` | Use only when boundary ownership is clear. |
| Small AngularJS app | `rewrite-by-feature` or `big-bang-rewrite` | Prefer the smallest viable change. |
| Large AngularJS app | `hybrid-ngupgrade` or `strangler-by-route` | Preserve delivery while modernizing incrementally. |

If a version cannot be confirmed from the repository, mark it as `verify in project`.

## Procedure

1. Read the inventory.
2. Read delivery and rollback constraints.
3. Classify app size and coupling.
4. Decide whether hybrid coexistence is necessary.
5. Select exactly one primary strategy.
6. Reject alternatives explicitly.
7. Output the next bounded slice or next orchestration step.

## Do

- Base the decision on evidence, not preference.
- Prefer incremental migration when risk is high.
- Prefer route-aligned or feature-aligned migration when possible.
- Prefer hybrid only when side-by-side runtime is actually needed.
- Prefer big-bang rewrite only when the app is small and business risk is low.
- State the rejected strategies and why they were rejected.

## Recommended Patterns

Use one of these primary strategies:

| Strategy | Use when | Avoid when |
|---|---|---|
| `rewrite-by-feature` | Features are isolated and can be rewritten independently | Shared global state dominates |
| `hybrid-ngupgrade` | AngularJS and Angular must coexist during migration | The org cannot support a hybrid boundary |
| `strangler-by-route` | Routes map cleanly to business domains | Routes are tightly coupled through globals |
| `microfrontend-shell` | MFE governance already exists | The shell would become a new source of complexity |
| `big-bang-rewrite` | The app is small and low risk | The app is critical or highly coupled |

## Anti-Patterns

- Choosing more than one primary strategy.
- Using `hybrid-ngupgrade` without a decommission plan.
- Picking rewrite-by-feature for a globally coupled app with no isolation.
- Forcing big-bang rewrite because it sounds simpler.
- Selecting a strategy before reading inventory facts.

## Do Not

- Do not select a strategy without inventory input.
- Do not mix implementation steps into the decision.
- Do not claim a strategy is safe without naming the main risks.
- Do not propose Angular 21 syntax as part of the strategy itself.
- Do not run commands that are not present in the repository.

## Review Checklist

- [ ] Inventory exists and was read.
- [ ] Delivery constraints were read.
- [ ] Exactly one primary strategy was selected.
- [ ] Alternative strategies were rejected explicitly.
- [ ] Main risks were named.
- [ ] The next step is bounded and realistic.
- [ ] No code was migrated in the strategy selection step.

## Validation Minimum

Use only repository commands that actually exist.

Preferred validation:

- inventory report review
- build baseline
- test baseline

If validation cannot run, explain the blocker and the safest next step.

## Risks

- Choosing the wrong strategy can make the migration slower or riskier.
- Hybrid decisions can become permanent if decommission is not planned.
- Big-bang rewrites can hide scope and delay delivery.
- Route-by-route plans can fail when global state is too coupled.

## Expected Output

When this skill is used, return:

1. Inventory summary.
2. Selected strategy.
3. Why it was selected.
4. Rejected alternatives.
5. Main risks.
6. Recommended next bounded slice.

## Exit Criteria

This skill is complete only when:

- An inventory has been read.
- One strategy has been selected.
- Alternatives have been rejected.
- The next execution step is clear.
- No migration code has been changed.

