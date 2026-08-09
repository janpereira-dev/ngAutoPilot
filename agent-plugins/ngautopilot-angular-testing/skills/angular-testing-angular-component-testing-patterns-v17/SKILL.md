---
name: angular-testing-angular-component-testing-patterns-v17
description: "Reviews Angular component testing patterns for Angular 17+ projects, focusing on modern template syntax awareness, stable component contracts, and contract-focused tests."
license: MIT
metadata:
  ngautopilot-id: "angular.testing.angular-component-testing-patterns-v17"
  ngautopilot-source: "skills/angular/testing/angular-component-testing-patterns-v17/SKILL.md"
  ngautopilot-version: "0.6.0"
---


# Angular Component Testing Patterns v17+

## Purpose

Use this skill for component testing in Angular 17+ projects.

The version-specific value here is alignment with modern Angular template and component practices, while still keeping the test focus on public contract behavior.

## When to Use

Use this skill when:

- the project is Angular 17 or newer
- component tests need to reflect modern Angular usage
- reusable UI components need contract tests
- host and interaction testing patterns are being modernized

## Do

Test inputs, outputs, and rendered behavior.

Prefer stable queries.

Keep host tests for parent-driven interactions.

## Do Not

Avoid using this as a reason to rewrite all tests.

Avoid coupling tests to internals.

## Review Checklist

- [ ] Angular version is 17 or newer.
- [ ] Tests focus on public contract.
- [ ] Queries are stable.
- [ ] Host testing is used when helpful.

## Expected Output

When this skill is used, the agent should:

1. Confirm the 17+ baseline.
2. Recommend contract-focused component tests.
3. Keep markup coupling low.
4. Use host tests when needed.
5. Produce modern Angular testing guidance.
