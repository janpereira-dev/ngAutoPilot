---
id: angular.architecture.angular-enterprise-training-assessment
name: Angular Enterprise Training Assessment
description: >
  Assesses Angular enterprise training readiness by mapping current team capability, version awareness, architecture gaps, testing maturity, and safe follow-up skill routing.
stack:
  - Angular
  - TypeScript
  - RxJS
  - Nx
category: architecture
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - angular training assessment
  - angular enterprise assessment
  - team capability assessment
  - training readiness
  - angular skill gaps
  - angular baseline knowledge
  - onboarding assessment
  - enterprise training assessment
  - version awareness assessment
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Angular Enterprise Training Assessment

## Purpose

Use this skill to assess whether a team or developer is ready for an Angular enterprise training path.

The assessment should measure capability, not trivia. It is intended to reveal gaps that matter in real projects: architecture, testing, forms, routing, DI, reactive state, version awareness, and safe delivery habits.

The core rule is simple:

```txt
Assess what the team can build safely, not what they can recite.
```

## When to Use

Use this skill when:

- a team needs a baseline Angular assessment
- onboarding readiness is unclear
- a training roadmap needs to be scoped
- version-aware learning gaps must be identified
- enterprise architecture maturity needs to be measured

## Do

Assess these areas:

```txt
- TypeScript
- Angular components and templates
- services and dependency injection
- HTTP and RxJS
- Signals and reactive state
- forms and validation
- routing and lazy loading
- testing and E2E
- performance awareness
- security awareness
- architecture trade-offs
```

Capture evidence, not opinion:

```txt
Evidence:
- code sample
- test sample
- architecture note
- feature walkthrough
- refactor explanation
```

Use clear readiness levels:

```txt
Ready
Needs guided onboarding
Needs targeted upskilling
Needs foundational training
```

Recommend follow-up skills based on gaps instead of giving a generic verdict.

## Do Not

Avoid quiz-style trivia without code evidence.

Avoid assessing Angular in isolation from enterprise delivery needs.

Avoid assuming version mastery because the person knows syntax.

Avoid using the assessment to justify unnecessary training complexity.

## Review Checklist

- [ ] The assessment maps to real project capability.
- [ ] Evidence is code- or workflow-based.
- [ ] Version awareness is included.
- [ ] Testing and architecture are part of the assessment.
- [ ] The result routes to follow-up skills or actions.

## Expected Output

When this skill is used, the agent should:

1. Identify capability gaps and current maturity.
2. Separate foundational, intermediate, and enterprise-level gaps.
3. Recommend follow-up skills and training priorities.
4. Summarize evidence-based readiness.
5. Produce a concise assessment report.
