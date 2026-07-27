---
id: angular.upgrade.angular-upgrade-validation-gate
name: Angular Upgrade Validation Gate
description: >
  Validates each Angular major hop with repository-specific build, test, and lint checks before allowing the next upgrade step.
stack:
  - Angular
  - TypeScript
  - RxJS
category: upgrades
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - upgrade validation
  - validation gate
  - build test lint
  - hop approval
compatibility:
  angular:
    min: "2"
    max: "21"
---

# Angular Upgrade Validation Gate

## Purpose

Use this skill to decide whether an Angular upgrade hop can continue.

## When to Use This Skill

Use this after an Angular hop when validation evidence exists.

## When Not to Use This Skill

Do not use it before any upgrade work has happened.

## Inputs Expected

- Current hop result
- `package.json`
- Validation output

## Procedure

1. Check available scripts.
2. Review command output.
3. Decide pass or fail.

## Do

- Report command results.
- Stop on clear validation failures.

## Do Not

- Do not change code.
- Do not change dependencies.

## Review Checklist

- [ ] Commands were checked.
- [ ] Gate decision was recorded.

## Expected Output

Return command results and gate decision.
