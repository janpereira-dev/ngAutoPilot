---
id: angular.upgrade.ivy.angular-ivy-default-v9-compatibility
name: Angular Ivy Default v9 Compatibility
description: >
  Validate Angular projects for Ivy default mode compatibility. Use when entryComponents, View Engine assumptions, or library compatibility can block Angular 9 adoption.
stack:
  - Angular
  - TypeScript
category: ivy
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - Ivy default
  - entryComponents
  - View Engine compatibility
compatibility:
  angular:
    min: "9"
---

# Angular Ivy Default v9 Compatibility

## Purpose

Validate Ivy compatibility before or during Angular 9 migration.

## When to Use

- The project is moving to Angular 9.
- Ivy or View Engine compatibility is uncertain.

## When Not to Use

- Ivy compatibility is already confirmed.
- No View Engine libraries remain.

## Required Inputs

- application modules
- library build metadata
- entryComponents usage
- tests

## Procedure

1. Identify View Engine assumptions.
2. Remove `entryComponents` where possible.
3. Validate library compatibility.

## Do

- Keep Ivy assumptions explicit.
- Validate third-party libraries.

## Do Not

- Do not rely on View Engine-only behavior.

## Review Checklist

- [ ] `entryComponents` reviewed.
- [ ] Libraries compatible.
- [ ] Tests pass.

## Expected Output

1. Ivy compatibility summary.
2. Blockers list.

## Exit Criteria

- Ivy compatibility is acceptable.
