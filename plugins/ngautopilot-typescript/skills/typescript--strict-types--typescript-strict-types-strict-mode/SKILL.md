---
id: typescript.strict-types.typescript-strict-types-strict-mode
name: TypeScript Strict Types Strict Mode
description: >
  Reviews TypeScript strict typing in repos that already use strict compiler settings, focusing on unknown narrowing, safe DTO contracts, and eliminating unsafe any usage under strict mode.
stack:
  - TypeScript
category: strict-types
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - strict mode typescript
  - strict true
  - strict typing strict mode
  - typescript strict compiler
  - strict null checks
compatibility:
  compiler:
    strict: true
---

# TypeScript Strict Types Strict Mode

## Purpose

Use this skill for TypeScript repositories that already use strict compiler settings.

This variant gives stricter guidance for repos where the compiler already enforces type safety and the main work is removing unsafe assumptions, narrowing unknown values, and keeping boundary contracts precise.

## When to Use

Use this skill when:

- `strict: true` is enabled
- the repo is ready for stricter type guidance
- unsafe `any` needs to be removed under strict settings
- DTO and boundary contracts need tightening

## Do

Prefer `unknown` plus narrowing at trust boundaries.

Use explicit DTOs and type guards for untrusted input.

Preserve narrow, testable contracts.

## Do Not

Avoid recommending non-strict fallbacks when the repo is already strict.

Avoid broad type assertions that bypass compiler value.

## Review Checklist

- [ ] `strict: true` is enabled.
- [ ] Unknown values are narrowed safely.
- [ ] Unsafe `any` is not leaking through public APIs.
- [ ] Boundary contracts are explicit.

## Expected Output

When this skill is used, the agent should:

1. Confirm strict compiler mode.
2. Recommend strict-safe narrowing patterns.
3. Flag broad assertions and unsafe `any`.
4. Keep contracts explicit at boundaries.
5. Produce strict-mode-specific guidance.
