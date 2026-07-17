---
id: quality.sonarqube.sonarqube-cognitive-complexity-reduction
name: SonarQube Cognitive Complexity Reduction
description: >
  Reduces cognitive complexity in JavaScript and TypeScript code by simplifying branching, splitting responsibilities, and extracting pure helpers only when the refactor preserves readability and tests.
stack:
  - JavaScript
  - TypeScript
category: sonarqube
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - cognitive complexity
  - sonar complexity
  - branch simplification
  - complex function
  - nested conditionals
compatibility:
  runtime:
    browser: true
    node: true
---

# SonarQube Cognitive Complexity Reduction

## Purpose

Use this skill to reduce cognitive complexity without ornamental refactors.

The goal is to simplify control flow while preserving behavior and readability.

The core rule is simple:

```txt
Simplify the logic without hiding the intent.
```

## When to Use

Use this skill when:

- Sonar marks cognitive complexity
- a function is hard to maintain
- branching is deeply nested
- responsibilities are mixed

## Do

Use:

- early returns
- extracted pure helpers
- separated responsibilities
- tests before and after

## Do Not

Avoid extra abstraction that makes the code harder to follow.

Avoid refactors without tests.

## Review Checklist

- [ ] Complexity was reduced meaningfully.
- [ ] Behavior is covered by tests.
- [ ] The refactor improved readability.

## Expected Output

When this skill is used, the agent should:

1. Identify the complexity drivers.
2. Simplify the branches safely.
3. Keep behavior covered.
4. Avoid ornamental abstraction.
5. Produce a readable refactor.
