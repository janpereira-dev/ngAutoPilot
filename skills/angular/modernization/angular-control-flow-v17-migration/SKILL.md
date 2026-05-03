---
id: angular.modernization.angular-control-flow-v17-migration
name: Angular Control Flow v17 Migration
description: >
  Adopt Angular built-in control flow syntax in bounded post-upgrade modernization slices after Angular 17 is stable. Use when replacing *ngIf, *ngFor, and *ngSwitch with @if, @for, and @switch in a controlled feature slice, not during a version hop.
stack:
  - Angular
  - TypeScript
category: modernization
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - control flow migration
  - @if
  - @for
  - @switch
  - structural directives modernization
compatibility:
  angular:
    min: "17"
---

# Angular Control Flow v17 Migration

## Purpose

Adopt Angular built-in control flow syntax in bounded modernization slices after Angular 17 is stable.

## When to Use

- The app is already on stable Angular 17.
- The team wants to replace structural directive boilerplate incrementally.
- The change is modernization, not a version upgrade.

## When Not to Use

- The app is still in a version hop.
- The app is not on a version that supports control flow.

## Required Inputs

- templates using `*ngIf`
- templates using `*ngFor`
- templates using `*ngSwitch`
- tests for the target slice

## Procedure

1. Select a bounded feature area.
2. Replace one structural directive family at a time.
3. Keep `track` expressions deliberate.
4. Validate rendering, accessibility, and tests.

## Do

- Prefer incremental conversion.
- Keep fallback and empty states explicit.
- Validate nested template behavior.

## Do Not

- Do not convert the whole app in one pass.
- Do not mix this with a version upgrade.
- Do not change business logic while changing template syntax.

## Review Checklist

- [ ] Slice is bounded.
- [ ] Rendering is equivalent or intentionally changed.
- [ ] Tests pass.
- [ ] Remaining template debt is documented.

## Expected Output

1. Slice converted to built-in control flow.
2. Remaining structural directives.
3. Test result.
4. Follow-up list.

## Exit Criteria

- Adoption is incremental.
- The next slice is clear.
