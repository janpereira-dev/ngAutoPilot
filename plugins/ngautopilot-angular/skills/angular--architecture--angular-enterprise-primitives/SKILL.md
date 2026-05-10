---
id: angular.architecture.angular-enterprise-primitives
name: Angular Enterprise Primitives
description: >
  Coordinates the enterprise learning and review path for Angular forms, signals, and testing so teams can adopt the right primitive at the right version and maturity level.
stack:
  - Angular
  - TypeScript
  - RxJS
  - Testing
category: architecture
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - angular enterprise primitives
  - forms signals testing
  - training primitives
  - angular learning primitives
  - enterprise angular primitives
  - capability adoption path
  - angular adoption matrix
  - version aware primitives
compatibility:
  angular:
    min: "14"
    signalInputsFrom: "16"
    recommendedModern: "17+"
---

# Angular Enterprise Primitives

## Purpose

Use this skill to coordinate the enterprise learning and review path for Angular forms, signals, and testing.

This is a mother skill. It does not replace specialized skills for forms, signals, or testing. It defines how to sequence them, when to adopt them, and how to avoid mixing primitives without a policy.

The core rule is simple:

```txt
Pick the primitive that matches the problem, the Angular version, and the team maturity.
```

## When to Use

Use this skill when:

- a team needs a learning path across forms, signals, and testing
- a roadmap needs version-aware primitive adoption
- the project is mixing state, forms, and tests without a policy
- training or onboarding should be organized around enterprise fundamentals

## Do

Use a sequencing policy:

```txt
Forms -> validation -> Signals -> interop -> testing -> architecture review
```

Use the following version gates:

```txt
Angular 14+ -> typed reactive forms
Angular 16+ -> Signals as a local state primitive
Angular 17+ -> modern testing patterns, control flow awareness, and enterprise-ready adoption
```

Keep the specialization skills separate:

```txt
forms -> reactive forms and validation
signals -> local reactive state and RxJS boundary
testing -> Jest or component testing patterns
```

## Do Not

Avoid turning this mother skill into implementation guidance.

Avoid adopting Signals before the team has stable forms and testing habits.

Avoid treating testing as the final module instead of a continuous discipline.

Avoid mixing several reactive models without a documented policy.

## Review Checklist

- [ ] The team has a sequencing policy for forms, signals, and testing.
- [ ] Angular version gates are explicit.
- [ ] Specialized skills remain separate.
- [ ] The adoption path matches team maturity.
- [ ] Architecture review is included.

## Expected Output

When this skill is used, the agent should:

1. Recommend the right primitive sequence.
2. Gate adoption by Angular version.
3. Keep the scope at architecture and learning-path level.
4. Route detailed implementation to the specialized skills.
5. Summarize the enterprise primitive adoption plan.
