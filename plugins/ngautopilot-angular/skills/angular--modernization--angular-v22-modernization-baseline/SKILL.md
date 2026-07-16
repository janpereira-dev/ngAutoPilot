---
id: angular.modernization.angular-v22-modernization-baseline
name: Angular v22 Modernization Baseline
description: >
  Use this skill to modernize an app already on Angular 22 without mixing in the upgrade hop.
stack:
  - Angular
  - TypeScript
category: modernization
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - Angular 22 modernization
  - Signal Forms
  - Angular Aria
  - resource
  - httpResource
  - zoneless readiness
compatibility:
  angular:
    min: "22"
---

# Angular v22 Modernization Baseline

## Purpose

Use this skill to modernize an app already on Angular 22 without mixing in the upgrade hop.

## When to Use

Use this skill when:

- The app is already on Angular 22.
- You want to adopt stable v22 APIs after the hop.
- The app needs a modernization slice for forms, accessibility, async state, or change detection.

## When Not to Use

Do not use this skill when:

- The project still needs the 21 to 22 upgrade hop.
- The task is a narrower API migration already covered by another skill.
- You only need compatibility planning.

## Required Inputs

- current Angular version
- template diagnostics status
- forms strategy
- SSR usage
- change detection strategy

## Procedure

1. Inventory the v22 surface the app can adopt safely.
2. Separate forms, templates, SSR, and change detection into small slices.
3. Prefer stable v22 APIs when the app is ready for them.

## Do

- Keep the modernization slice separate from the version hop.
- Use stable v22 APIs when appropriate.
- Validate templates and tests after each change.

## Do Not

- Do not re-run the Angular upgrade here.
- Do not mix compatibility analysis with modernization.
- Do not introduce new patterns without checking the surrounding codebase first.

## Review Checklist

- [ ] The app is already on Angular 22.
- [ ] The modernization target is explicit.
- [ ] Template and test impact were checked.

## Expected Output

When this skill is used, the agent should:

1. A v22 modernization summary.
2. The selected modernization slice.
3. Validation notes and risks.
