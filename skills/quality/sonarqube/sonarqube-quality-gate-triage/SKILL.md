---
id: quality.sonarqube.sonarqube-quality-gate-triage
name: SonarQube Quality Gate Triage
description: >
  Triage SonarQube findings by separating blockers from lower-priority issues across bugs, vulnerabilities, code smells, coverage, duplication, and security hotspots.
stack:
  - JavaScript
  - TypeScript
category: sonarqube
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - sonar triage
  - sonarqube quality gate
  - sonar quality gate
  - code smell triage
  - coverage gate
compatibility:
  runtime:
    browser: true
    node: true
---

# SonarQube Quality Gate Triage

## Purpose

Use this skill to triage SonarQube findings and decide what blocks delivery.

The goal is to prioritize based on delivery impact, not just issue count.

The core rule is simple:

```txt
Triaged issues should separate blockers from cleanup.
```

## When to Use

Use this skill when:

- a quality gate fails
- many Sonar issues need prioritization
- blockers must be separated from cleanups

## Do

Classify findings into:

- bugs
- vulnerabilities
- code smells
- security hotspots
- coverage
- duplication
- new code versus overall code

Prioritize gate blockers first.

## Do Not

Avoid treating every issue as equally urgent.

Avoid fixing low-value smells before blockers.

## Review Checklist

- [ ] Blocking issues are identified.
- [ ] New code and overall code are separated.
- [ ] Cleanup items are prioritized after blockers.

## Expected Output

When this skill is used, the agent should:

1. Triage Sonar findings.
2. Separate blockers from cleanup.
3. Recommend a priority order.
4. Keep the response actionable.
5. Avoid noisy over-reporting.
