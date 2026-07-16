---
id: angular.ssr.angular-v22-ssr-hydration-baseline
name: Angular v22 SSR Hydration Baseline
description: >
  Use this skill when the app renders on the server and Angular 22 hydration or server-engine changes need review.
stack:
  - Angular
  - TypeScript
category: ssr
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - SSR
  - hydration
  - CommonEngine
  - platform-server
  - incremental hydration
compatibility:
  angular:
    min: "22"
---

# Angular v22 SSR Hydration Baseline

## Purpose

Use this skill when the app renders on the server and Angular 22 hydration or server-engine changes need review.

## When to Use

Use this skill when:

- The app uses server-side rendering.
- Hydration behavior matters after the v22 update.
- The server engine or transfer path needs a compatibility review.

## When Not to Use

Do not use this skill when:

- The app is client-only.
- The task is only about client routing or templates.
- The SSR stack is not part of the change.

## Required Inputs

- server entry points
- hydration config
- platform-server usage
- SSR tests

## Procedure

1. Review hydration assumptions first.
2. Replace deprecated server-engine usage with the newer path when needed.
3. Avoid server-side transport choices that are no longer safe or supported.

## Do

- Keep SSR behavior explicit.
- Confirm the hydration strategy in tests.
- Prefer the supported server engine and transport path.

## Do Not

- Do not assume the old server defaults still apply.
- Do not leave hydration assumptions untested.
- Do not mix server transport changes with unrelated refactors.

## Review Checklist

- [ ] SSR usage was identified.
- [ ] Hydration behavior was validated.
- [ ] Server transport is on the supported path.

## Expected Output

When this skill is used, the agent should:

1. An SSR and hydration summary.
2. The changed server behavior.
3. Validation evidence.
