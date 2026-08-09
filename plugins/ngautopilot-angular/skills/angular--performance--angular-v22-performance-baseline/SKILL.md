---
id: angular.performance.angular-v22-performance-baseline
name: Angular v22 Performance Baseline
description: >
  Use this skill when Angular 22 performance needs to be measured or improved without guessing.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - performance
  - OnPush
  - zoneless
  - template hot path
  - rendering
compatibility:
  angular:
    min: "22"
---

# Angular v22 Performance Baseline

## Purpose

Use this skill when Angular 22 performance needs to be measured or improved without guessing.

## When to Use

Use this skill when:

- You need to review a render hot path on Angular 22.
- The app depends on default change detection behavior or zoneless readiness.
- Template work, hydration, or list rendering is the likely bottleneck.

## When Not to Use

Do not use this skill when:

- The change is a pure API migration.
- The issue is only a security or SSR concern.
- You do not have evidence of a real performance problem yet.

## Required Inputs

- performance evidence
- change detection strategy
- template hot spots
- SSR or hydration impact

## Procedure

1. Measure first and isolate the real bottleneck.
2. Check whether v22 defaults changed the render profile.
3. Prefer the smallest optimization that removes the bottleneck.

## Do

- Keep optimization local to the proven hotspot.
- Prefer explicit change detection boundaries.
- Validate the impact with before and after evidence.

## Do Not

- Do not optimize based on intuition alone.
- Do not mix performance tuning with compatibility analysis.
- Do not introduce large refactors to save a few milliseconds.

## Review Checklist

- [ ] The bottleneck is measured.
- [ ] The change is minimal and targeted.
- [ ] The result was revalidated.

## Expected Output

When this skill is used, the agent should:

1. A measured performance summary.
2. The chosen optimization.
3. Validation evidence.
