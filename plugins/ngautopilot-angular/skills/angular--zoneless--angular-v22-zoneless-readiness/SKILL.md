---
id: angular.zoneless.angular-v22-zoneless-readiness
name: Angular v22 Zoneless Readiness
description: >
  Use this skill when an Angular 22 app wants to move toward zoneless operation or start from zoneless-friendly defaults.
stack:
  - Angular
  - TypeScript
category: zoneless
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - zoneless
  - provideZoneless
  - signals
  - change detection
  - bootstrap
compatibility:
  angular:
    min: "22"
---

# Angular v22 Zoneless Readiness

## Purpose

Use this skill when an Angular 22 app wants to move toward zoneless operation or start from zoneless-friendly defaults.

## When to Use

Use this skill when:

- The app is ready to reduce its reliance on Zone.js.
- You need to review bootstrap and change-detection behavior for zoneless mode.
- Signals and explicit UI updates should drive the app more than implicit zone patches.

## When Not to Use

Do not use this skill when:

- The app must stay zone-driven for now.
- The task is only about a single template or form issue.
- A more specific performance or testing skill is the better route.

## Required Inputs

- bootstrap config
- async side effects
- SSR or hydration behavior
- third-party change detection

## Procedure

1. Isolate the places that still depend on implicit zone updates.
2. Move the app toward explicit signal-driven or manual updates where appropriate.
3. Check SSR and interactive flows for missed updates.
4. Validate the app in the intended zoneless mode.

## Do

- Prefer explicit state and event flow.
- Keep the zoneless slice incremental when the app is large.
- Validate the actual user interactions after the change.

## Do Not

- Do not remove Zone.js support blindly.
- Do not mix zoneless migration with unrelated refactors.
- Do not assume every library is zoneless-ready.

## Review Checklist

- [ ] Zoneless readiness was assessed.
- [ ] Implicit update assumptions were removed or documented.
- [ ] The main interactions were validated.

## Expected Output

When this skill is used, the agent should:

1. A zoneless-readiness summary.
2. The remaining zone assumptions.
3. The validated migration slice.
