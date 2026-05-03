---
id: angular.testing.jest-angular-unit-testing
name: Angular Jest Unit Testing
description: >
  Designs and reviews Angular unit testing with Jest, focusing on TestBed usage, mocking strategy, component and service tests, and maintainable enterprise test patterns.
stack:
  - Angular
  - TypeScript
  - Jest
category: testing
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - jest angular testing
  - angular jest unit testing
  - unit testing
  - TestBed
  - jest testbed
  - angular component test
  - angular service test
  - mocking strategy
compatibility:
  angular:
    min: "12"
    recommendedModern: "17+"
---

# Angular Jest Unit Testing

## Purpose

Use this skill to design or review Angular unit tests when the project uses Jest.

Jest should support clear, maintainable tests for components, services, pipes, and helpers. The focus is not on forcing a testing style, but on keeping tests readable, deterministic, and aligned with the application's architecture.

The core rule is simple:

```txt
Test behavior at the boundary you own.
```

## When to Use

Use this skill when:

- the project already uses Jest
- unit tests need cleanup or structure
- TestBed usage needs guidance
- component or service mocking strategy is unclear
- test suites are becoming brittle or hard to read

## Do

Use TestBed for Angular-aware component and service tests:

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [MyService],
  });
});
```

Keep mocks narrow and intentional.

Assert behavior, not implementation details.

Prefer focused test names that describe user or service intent.

## Do Not

Avoid rewriting the entire test stack during a local fix.

Avoid snapshot-only testing for dynamic Angular behavior.

Avoid overspecifying internal method calls when DOM or service behavior is the real contract.

Avoid mixing unrelated framework migrations into the testing work.

## Review Checklist

- [ ] The project actually uses Jest.
- [ ] TestBed is used when Angular context is needed.
- [ ] Mocks are minimal and readable.
- [ ] Tests verify behavior, not private implementation details.
- [ ] The test suite remains maintainable.

## Expected Output

When this skill is used, the agent should:

1. Inspect the Jest-based test setup.
2. Recommend a maintainable TestBed strategy.
3. Define a minimal mocking approach.
4. Flag brittle or overspecified tests.
5. Produce focused test examples or refactors.
