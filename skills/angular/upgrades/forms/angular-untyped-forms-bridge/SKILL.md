---
id: angular.upgrade.forms.angular-untyped-forms-bridge
name: Angular Untyped Forms Bridge
description: >
  Use untyped reactive forms as a compatibility bridge when typed forms are not yet practical. Apply only as a temporary step before typed forms migration.
stack:
  - Angular
  - TypeScript
category: forms
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - UntypedFormGroup
  - UntypedFormControl
  - typed forms bridge
compatibility:
  angular:
    min: "14"
---

# Angular Untyped Forms Bridge

## Purpose

Provide a temporary bridge for reactive forms migration.

## When to Use

- Typed forms migration is not yet feasible.
- The app needs a short-term compatibility path.

## When Not to Use

- Typed forms are already in place.
- The bridge would become permanent.

## Required Inputs

- forms code
- migration blockers
- tests

## Procedure

1. Identify forms that cannot be typed yet.
2. Move them to untyped bridge types temporarily.
3. Track follow-up work toward typed forms.

## Do

- Keep the bridge temporary.
- Document blockers clearly.

## Do Not

- Do not normalize untyped forms as final state.

## Review Checklist

- [ ] Bridge usage is limited.
- [ ] Typed migration plan exists.
- [ ] Tests still pass.

## Expected Output

1. Untyped bridge summary.
2. Follow-up plan.

## Exit Criteria

- Bridge is temporary and documented.
