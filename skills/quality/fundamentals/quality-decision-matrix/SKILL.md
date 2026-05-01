---
id: quality.fundamentals.quality-decision-matrix
name: Quality Decision Matrix
description: >
  Chooses between ESLint, SonarQube, dead-code cleanup, and technical debt cleanup based on risk, scope, evidence, and the kind of quality failure the codebase is showing.
stack:
  - JavaScript
  - TypeScript
category: quality
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - quality decision matrix
  - choose quality tool
  - eslint or sonarqube
  - quality triage matrix
  - cleanup decision
compatibility:
  runtime:
    browser: true
    node: true
---

# Quality Decision Matrix

## Purpose

Use this skill to choose the right quality primitive for a given problem.

It belongs under `quality/fundamentals` because it coordinates the choice between lint, SonarQube, dead-code cleanup, and technical debt cleanup.

The core rule is simple:

```txt
Choose the smallest quality tool that can prove the problem and fix it safely.
```

## When to Use

Use this skill when:

- a quality issue could be solved by more than one skill
- the team needs a fast routing decision
- the cleanup should stay small and bounded
- the wrong quality tool would cause over-refactor

## Do

Use this decision order:

```txt
1. ESLint if the issue is rule-based or suppression-based
2. SonarQube if the issue is gate/measure based
3. No-dead-code if the issue is unused surface or unreachable logic
4. Technical debt if the issue should be tracked and repaid in hops
```

Consider:

- evidence available
- blast radius
- build/test risk
- whether the issue is local or workspace-wide

## Do Not

Avoid using Sonar for a lint-only problem.

Avoid using ESLint for a debt-tracking decision.

Avoid cleaning dead code without verifying contracts.

Avoid broad refactors when the decision matrix is enough.

## Review Checklist

- [ ] The problem type is identified.
- [ ] The smallest correct quality tool was chosen.
- [ ] The hop stays bounded.
- [ ] The output is actionable.

## Expected Output

When this skill is used, the agent should:

1. Classify the quality problem.
2. Choose the smallest viable quality primitive.
3. Explain why the other options were rejected.
4. Keep the cleanup bounded.
5. Point to the next specialized skill if needed.

