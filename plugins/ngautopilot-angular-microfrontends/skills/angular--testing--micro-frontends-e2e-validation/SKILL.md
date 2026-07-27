---
id: angular.testing.micro-frontends-e2e-validation
name: Micro-frontends E2E Validation
description: >
  Designs and reviews end-to-end validation for Angular micro-frontends in Nx monorepos, covering shell startup, remote loading, cross-remote flows, fallback behavior, and release confidence.
stack:
  - Angular
  - TypeScript
  - Nx
  - Testing
category: testing
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - micro frontends e2e
  - micro-frontends e2e
  - e2e validation
  - shell smoke test
  - remote smoke test
  - fallback test
  - federated integration test
  - micro frontends testing
  - end to end federation
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Micro-frontends E2E Validation

## Purpose

Use this skill to design or review end-to-end validation for Angular micro-frontends.

Micro-frontends need explicit integration tests because runtime composition introduces failure modes that unit tests will not catch. The validation strategy should prove that the shell loads, remotes resolve, cross-remote flows work, and fallback behavior is acceptable.

The core rule is simple:

```txt
If a remote can fail at runtime, test the failure path.
```

## When to Use

Use this skill when:

- a shell composes runtime remotes
- remote loading is part of the release path
- cross-remote navigation or events must be validated
- fallback behavior is required for unavailable remotes
- the team needs smoke tests or E2E confidence for distributed UI

## Do

Cover the essential flows:

```txt
- shell boot
- remote load
- route activation
- cross-remote navigation
- shared auth/session state
- fallback on remote failure
- retry or recovery path
```

Prefer a layered validation strategy:

```txt
1. Shell smoke test
2. Remote smoke test
3. Happy-path cross-remote flow
4. Failure-path fallback test
5. Release gating for changed remotes
```

Keep the test scope realistic:

```txt
Test what breaks at integration boundaries.
Do not duplicate unit test coverage in E2E.
```

Document the minimum suite:

```txt
Suite:
  - shell loads
  - checkout remote loads
  - catalog remote loads
  - remote failure fallback
  - navigation between remotes
```

## Do Not

Avoid only testing the happy path.

Avoid a single monolithic E2E test that is too slow to maintain.

Avoid depending on unstable selectors or brittle timing assumptions.

Avoid treating remote failure as impossible.

Avoid shipping runtime federation without at least smoke coverage for each integration point.

## Review Checklist

- [ ] Shell startup is validated.
- [ ] Each remote has a smoke test.
- [ ] Cross-remote navigation is covered.
- [ ] Fallback behavior is tested.
- [ ] Shared session or auth dependencies are validated.
- [ ] The E2E suite is small enough to run regularly.

## Expected Output

When this skill is used, the agent should:

1. Identify integration boundaries that need coverage.
2. Propose a layered E2E strategy.
3. Include failure-path validation.
4. Keep tests focused on runtime composition risks.
5. Recommend release gating for remote changes.
