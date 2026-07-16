---
id: angular.testing.angular-component-testing-patterns
name: Angular Component Testing Patterns
description: >
  Designs and reviews Angular component testing patterns for enterprise apps, focusing on template interaction, inputs and outputs, host testing, harnesses, and boundary-focused assertions.
stack:
  - Angular
  - TypeScript
category: testing
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - angular component testing
  - component test patterns
  - inputs and outputs testing
  - host component testing
  - template interaction test
  - harness testing
  - angular template test
compatibility:
  angular:
    min: "12"
    recommendedModern: "17+"
---

# Angular Component Testing Patterns

## Purpose

Use this skill to design or review Angular component tests.

Component tests should verify the public contract: inputs, outputs, template behavior, and interaction patterns. They should not overfocus on internals unless the component itself is an internal implementation detail.

The core rule is simple:

```txt
Test the component like a consumer would use it.
```

## When to Use

Use this skill when:

- a component has inputs and outputs
- template interactions need coverage
- a host test is clearer than isolated class assertions
- a reusable UI component needs contract verification
- the component is a candidate for harness-style tests

## Do

Assert the rendered DOM and event emission:

```ts
it("emits save when clicked", () => {
  component.save.emit();
  expect(spy).toHaveBeenCalled();
});
```

Use a host component when parent-driven input/output behavior matters.

Prefer stable selectors or semantic queries over brittle implementation details.

Test content projection, conditional rendering, and disabled states when those are part of the public contract.

## Do Not

Avoid testing private methods directly unless there is no reasonable public contract.

Avoid coupling the test to incidental markup details.

Avoid turning every component test into a full integration suite.

Avoid duplicate assertions that do not add contract value.

## Review Checklist

- [ ] Inputs and outputs are covered.
- [ ] Template behavior is verified.
- [ ] Host testing is used when helpful.
- [ ] Selectors are stable.
- [ ] The test focuses on public contract behavior.

## Expected Output

When this skill is used, the agent should:

1. Identify the component contract.
2. Choose a suitable test style.
3. Verify input, output, and template behavior.
4. Recommend host or harness patterns where appropriate.
5. Keep the test focused on public behavior.
