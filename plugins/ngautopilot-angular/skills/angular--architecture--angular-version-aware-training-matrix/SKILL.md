---
id: angular.architecture.angular-version-aware-training-matrix
name: Angular Version-Aware Training Matrix
description: >
  Builds Angular training matrices that map framework version features, compatibility risks, and learning priorities to enterprise team capabilities and delivery constraints.
stack:
  - Angular
  - TypeScript
  - RxJS
  - Nx
category: architecture
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - angular version aware training
  - version aware matrix
  - training matrix
  - angular feature matrix
  - angular version matrix
  - capability matrix
  - angular compatibility training
  - version based training
  - angular roadmap matrix
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Angular Version-Aware Training Matrix

## Purpose

Use this skill to build a version-aware Angular training matrix.

The matrix should map Angular versions to supported concepts, migration concerns, and practical team skills. It helps an agent decide what to teach now, what to defer, and what to avoid because the version does not support it or the team is not ready.

The core rule is simple:

```txt
Teach features only when the project version and team maturity support them.
```

## When to Use

Use this skill when:

- training must be tailored to a specific Angular version
- a roadmap spans multiple Angular majors
- feature adoption needs version gating
- a team is moving toward modern Angular incrementally
- training materials need a matrix instead of a generic outline

## Do

Map version to capability:

```txt
Angular 14 -> typed forms
Angular 16 -> Signals, DestroyRef, takeUntilDestroyed
Angular 17 -> control flow, @defer, SSR/hydration improvements
Angular 19 -> standalone-first defaults
Angular 20 -> resource/rxResource awareness
Angular 21 -> stricter template and SSR security review
```

Use the matrix to decide:

```txt
- mandatory
- recommended
- optional
- blocked by version
```

Keep the matrix linked to real project constraints:

```txt
framework version
RxJS version
TypeScript version
Node version
test stack
architecture style
```

## Do Not

Avoid recommending features that the target Angular version cannot support.

Avoid treating modern APIs as mandatory when the project is still on a legacy baseline.

Avoid flattening version differences into one generic training plan.

Avoid skipping migration or compatibility risk when the matrix spans several majors.

## Review Checklist

- [ ] Angular version gates are explicit.
- [ ] Training priorities are version-aware.
- [ ] Blocked features are identified.
- [ ] Migration risk is visible.
- [ ] The matrix is tied to project constraints.

## Expected Output

When this skill is used, the agent should:

1. Map Angular versions to teachable capabilities.
2. Mark features as mandatory, optional, or blocked.
3. Identify version-related migration risks.
4. Align the matrix with project constraints.
5. Produce a clear version-aware training artifact.
