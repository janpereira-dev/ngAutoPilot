---
id: angular.testing.angular-v22-testing-stability
name: Angular v22 Testing Stability
description: >
  Use this skill when Angular 22 changes affect test reliability, async expectations, or compile-time behavior in the suite.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - testing
  - fixture.detectChanges
  - router tests
  - async behavior
  - hydration tests
compatibility:
  angular:
    min: "22"
---

# Angular v22 Testing Stability

## Purpose

Use this skill when Angular 22 changes affect test reliability, async expectations, or compile-time behavior in the suite.

## When to Use

Use this skill when:

- Tests started failing after the v22 update.
- Async assumptions no longer match resource or hydration behavior.
- Router or template compile changes need targeted coverage.

## When Not to Use

Do not use this skill when:

- The task is production code only and tests are untouched.
- The issue is only a build-tool migration.
- The failure belongs to a more specific testing satellite skill.

## Required Inputs

- affected tests
- async assumptions
- component harnesses or fixtures
- router mocks or SSR assertions

## Procedure

1. Find the tests that relied on old behavior.
2. Update async expectations and change-detection calls as needed.
3. Keep the test fix narrow and deterministic.

## Do

- Prefer the smallest test change that matches v22 behavior.
- Keep assertions aligned with the new compile or runtime semantics.
- Use targeted validation instead of broad rework.

## Do Not

- Do not silence failures without understanding the new behavior.
- Do not widen the test scope unnecessarily.
- Do not keep brittle async assumptions alive.

## Review Checklist

- [ ] The failing behavior is understood.
- [ ] The test expectation matches v22 semantics.
- [ ] The impacted suite passes again.

## Expected Output

When this skill is used, the agent should:

1. A test-stability summary.
2. The changed expectation or harness.
3. Residual risk if any remains.
