---
id: angular.upgrade.angularjs.angularjs-ngupgrade-hybrid-bootstrap
name: AngularJS ngUpgrade Hybrid Bootstrap
description: >
  Bootstrap AngularJS and Angular together with ngUpgrade when the app must run in hybrid mode during migration. Use when UpgradeModule, downgraded Angular components, or upgraded AngularJS services are part of the transition plan.
stack:
  - Angular
  - AngularJS
category: angularjs
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - ngUpgrade bootstrap
  - hybrid AngularJS and Angular
  - UpgradeModule
  - downgradeComponent
compatibility:
  angular:
    min: "2"
---

# AngularJS ngUpgrade Hybrid Bootstrap

## Purpose

Set up a safe hybrid bootstrap for AngularJS and Angular.

## When to Use

- The app runs AngularJS and Angular together.
- The migration uses `UpgradeModule` or bridge APIs.

## When Not to Use

- The app is already fully Angular.
- No hybrid runtime is required.

## Required Inputs

- bootstrap code
- AngularJS module bootstrap
- Angular module bootstrap
- bridge services and components

## Procedure

1. Identify bootstrap order.
2. Register bridge APIs.
3. Validate both runtimes start.

## Do

- Keep bootstrap explicit.
- Validate bridge injection paths.

## Do Not

- Do not assume hybrid behavior is automatic.

## Review Checklist

- [ ] Hybrid bootstrap starts.
- [ ] Upgrade bridges resolve.
- [ ] Tests cover both runtimes.

## Expected Output

1. Hybrid bootstrap plan.
2. Bridge validation summary.

## Exit Criteria

- Hybrid bootstrap is working or blocked.
