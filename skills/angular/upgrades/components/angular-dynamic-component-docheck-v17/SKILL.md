---
id: angular.upgrade.components.angular-dynamic-component-docheck-v17
name: Angular Dynamic Component ngDoCheck v17
description: >
  Review dynamic component creation and ngDoCheck behavior after Angular 17 when dynamically instantiated components participate in change detection or side effects. Use when plugin systems, dashboards, dialogs, or CMS-driven components depend on dynamic component lifecycle behavior.
stack:
  - Angular
  - TypeScript
category: components
status: draft
version: 0.3.0
owner: NgAutoPilot
triggers:
  - dynamic components
  - ngDoCheck
  - change detection
  - ViewContainerRef.createComponent
compatibility:
  angular:
    min: "17"
---

# Angular Dynamic Component ngDoCheck v17

## Purpose

Review dynamic component creation and `ngDoCheck` behavior after Angular 17.

## When to Use

- The app creates components dynamically.
- The app depends on `ngDoCheck` in dynamic components.
- The app has plugin, dashboard, dialog, or CMS-driven screens.

## When Not to Use

- The app does not use dynamic component creation.
- The app is still in a version upgrade.

## Required Inputs

- dynamic component code
- `ViewContainerRef.createComponent`
- `ComponentRef`
- `ngDoCheck`
- tests for dynamic screens

## Procedure

1. Identify dynamic component entry points.
2. Review `ngDoCheck` side effects.
3. Validate change detection and input updates.
4. Run targeted tests.

## Do

- Keep side effects intentional.
- Validate mark-for-check and detect-changes paths.
- Review dynamic screens visually when needed.

## Do Not

- Do not remove `ngDoCheck` to hide a bug.
- Do not mix this with a version upgrade.

## Review Checklist

- [ ] Dynamic component behavior is understood.
- [ ] `ngDoCheck` side effects are intentional.
- [ ] Tests pass.

## Expected Output

1. Dynamic component summary.
2. `ngDoCheck` review.
3. Test result.

## Exit Criteria

- Dynamic component risk is explicit.
