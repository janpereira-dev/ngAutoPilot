---
id: angular.upgrade.ivy.angular-ivy-only-v13-gate
name: Angular Ivy Only v13 Gate
description: >
  Block Angular 13 upgrades when Ivy is disabled or View Engine-only dependencies remain. Use when the app must be confirmed Ivy-only before moving forward.
stack:
  - Angular
  - TypeScript
category: ivy
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - Ivy only gate
  - View Engine dependency
  - Angular 13 gate
compatibility:
  angular:
    min: "13"
---

# Angular Ivy Only v13 Gate

## Purpose

Block Angular 13 if Ivy-only requirements are not met.

## When to Use

- The project is moving to Angular 13.
- Ivy-only support must be validated.

## When Not to Use

- Ivy-only support is already confirmed.
- The app still needs View Engine.

## Required Inputs

- Angular compiler config
- library compatibility
- build output

## Procedure

1. Check Ivy settings.
2. Check third-party library compatibility.
3. Block or approve the upgrade.

## Do

- Keep the gate explicit.
- Block View Engine dependencies.

## Do Not

- Do not force the upgrade through incompatible libraries.

## Review Checklist

- [ ] Ivy is enabled.
- [ ] View Engine libraries are cleared.
- [ ] Gate decision is explicit.

## Expected Output

1. Ivy gate decision.
2. Remaining blockers.

## Exit Criteria

- Ivy-only requirement is satisfied or blocked.
