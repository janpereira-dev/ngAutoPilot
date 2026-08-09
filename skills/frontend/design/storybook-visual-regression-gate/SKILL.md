---
id: frontend.design.storybook-visual-regression-gate
name: Storybook and Visual Regression Gate
description: Define story coverage, deterministic fixtures, screenshot baselines, interaction states, and approval rules for component changes.
stack:
  - Frontend
  - Storybook
  - Testing
category: testing
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - storybook stories
  - visual regression
  - component screenshots
  - design QA
---

# Storybook and Visual Regression Gate

## Purpose

Make reusable component quality reviewable and prevent accidental visual drift without treating screenshots as semantic or interaction proof.

## When to Use

- Reusable components change across variants, states, themes, densities, or responsive containers.
- CSS or dependency changes can affect rendered output.

## Do

- Cover default, variants, critical states, content extremes, themes, and responsive containers with deterministic dates, data, fonts, network, and animation.
- Add interaction and accessibility checks alongside screenshot baselines.
- Classify diffs as intended, regression, environment noise, or baseline debt and require owned rationale for intended changes.

## Do Not

- Do not use production APIs, approve every dependency-upgrade diff, inflate thresholds for flakiness, or replace accessibility checks with screenshots.

## Review Checklist

- [ ] Critical state stories and deterministic fixtures exist.
- [ ] Baseline viewport/theme policy is explicit.
- [ ] Every visual diff has owner, classification, and rationale.

## Expected Output

1. Story coverage and baseline matrix.
2. Diff classification and approval decision.
3. Required interaction and accessibility evidence.

## References

- [Design Excellence Guide](../../../../docs/design-excellence-guide.md)
