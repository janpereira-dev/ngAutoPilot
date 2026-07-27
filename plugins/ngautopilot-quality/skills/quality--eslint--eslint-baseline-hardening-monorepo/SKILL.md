---
id: quality.eslint.eslint-baseline-hardening-monorepo
name: ESLint Baseline Hardening Monorepo
description: >
  Raises ESLint quality in monorepo workspaces by reviewing project-specific overrides, shared config, workspace-wide CI enforcement, and safe phased hardening.
stack:
  - JavaScript
  - TypeScript
category: eslint
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - eslint baseline hardening monorepo
  - nx lint baseline
  - workspace lint hardening
  - shared eslint config
compatibility:
  runtime:
    browser: true
    node: true
---

# ESLint Baseline Hardening Monorepo

## Purpose

Use this skill to harden ESLint in monorepo workspaces.

This variant adds workspace awareness so the agent can treat project-level overrides, shared rules, and CI gates as coordinated quality surfaces.

## When to Use

Use this skill when:

- the repo is a monorepo
- shared ESLint config exists
- project overrides differ across apps/libs
- CI should enforce a phased baseline

## Do

Review:

- shared config
- project overrides
- warnings versus errors
- CI enforcement
- workspace-specific exceptions

Raise the baseline in small increments.

## Do Not

Avoid breaking the entire workspace with one rule change.

Avoid ignoring project-specific quality boundaries.

## Review Checklist

- [ ] Shared and local configs were reviewed.
- [ ] CI implications were checked.
- [ ] The baseline change is phased.

## Expected Output

When this skill is used, the agent should:

1. Inspect the workspace lint setup.
2. Identify shared versus local rules.
3. Propose phased hardening.
4. Keep the diff small.
5. Validate with workspace checks.
