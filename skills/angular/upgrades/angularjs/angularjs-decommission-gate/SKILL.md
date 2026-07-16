---
id: angular.upgrade.angularjs.angularjs-decommission-gate
name: AngularJS Decommission Gate
description: >
  Decide whether AngularJS can be removed after migration work is complete. Use when hybrid dependencies, downgrade bridges, or AngularJS routes may still remain.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - AngularJS decommission
  - hybrid removal gate
  - remove AngularJS
compatibility:
  angular:
    min: "2"
---

# AngularJS Decommission Gate

## Purpose

Determine whether AngularJS can be removed safely.

## When to Use

- The AngularJS migration is near completion.
- Hybrid dependencies may still exist.

## When Not to Use

- AngularJS is still actively required.
- The app has not been inventoried.

## Required Inputs

- inventory report
- bridge API list
- route ownership map
- test results

## Procedure

1. Verify no AngularJS-only runtime dependencies remain.
2. Confirm downgrade and upgrade bridges are removed or isolated.
3. Approve or block decommission.

## Do

- Keep the decommission decision explicit.
- Block removal if any AngularJS runtime dependency remains.

## Do Not

- Do not remove AngularJS while bridge code still matters.

## Review Checklist

- [ ] AngularJS runtime dependencies cleared.
- [ ] Bridges removed or isolated.
- [ ] Tests pass.

## Expected Output

1. Decommission decision.
2. Remaining risk list.

## Exit Criteria

- AngularJS removal is approved or blocked clearly.
