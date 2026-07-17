---
id: angular.architecture.angular-enterprise-onboarding-plan
name: Angular Enterprise Onboarding Plan
description: >
  Designs Angular enterprise onboarding paths that ramp developers through project conventions, architecture boundaries, testing discipline, and version-aware delivery expectations.
stack:
  - Angular
  - TypeScript
  - RxJS
  - Nx
category: architecture
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - angular onboarding plan
  - enterprise onboarding
  - angular team onboarding
  - ramp up plan
  - new developer onboarding
  - angular onboarding path
  - project conventions
  - enterprise ramp up
  - angular introduction plan
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Angular Enterprise Onboarding Plan

## Purpose

Use this skill to design an onboarding plan for developers joining an Angular enterprise codebase.

The onboarding must teach the team how the specific repository works: conventions, boundaries, testing, architecture decisions, and version-specific Angular features. It is not a generic welcome doc.

The core rule is simple:

```txt
Onboarding should reduce risk on the first PR.
```

## When to Use

Use this skill when:

- a new Angular developer joins the team
- a project needs a first-30-days ramp plan
- the codebase has strong local conventions
- version-specific Angular adoption matters
- the team wants predictable contributor onboarding

## Do

Define onboarding stages:

```txt
Day 1:
- repo structure
- local setup
- run tests

Week 1:
- feature walkthrough
- architecture boundaries
- component and service conventions

Week 2:
- forms, routing, testing
- first small change

Month 1:
- architecture review
- refactor or improvement task
```

Include concrete outputs:

```txt
- successful local setup
- first passing test
- first PR
- architecture note
- feature walkthrough summary
```

Tailor the plan to the target Angular version, state model, test stack, and architecture style.

## Do Not

Avoid onboarding that only explains how to run the app.

Avoid starting with framework theory before the repository's conventions.

Avoid giving new developers tasks that bypass testing or boundaries.

Avoid treating onboarding as a one-time checklist instead of a progressive path.

## Review Checklist

- [ ] The onboarding plan is repository-specific.
- [ ] The first PR is safe and bounded.
- [ ] Architecture boundaries are explained early.
- [ ] Testing is part of the ramp path.
- [ ] Angular version constraints are explicit.

## Expected Output

When this skill is used, the agent should:

1. Define the onboarding phases.
2. Identify repository-specific conventions.
3. Include architecture and testing milestones.
4. Recommend the first safe contributor task.
5. Produce a practical ramp-up plan.
