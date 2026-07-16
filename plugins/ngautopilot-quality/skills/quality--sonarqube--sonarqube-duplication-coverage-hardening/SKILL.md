---
id: quality.sonarqube.sonarqube-duplication-coverage-hardening
name: SonarQube Duplication Coverage Hardening
description: >
  Improves SonarQube duplication and coverage pragmatically by removing real duplication, raising meaningful coverage, and avoiding unnecessary abstractions.
stack:
  - JavaScript
  - TypeScript
category: sonarqube
status: stable
version: 0.5.0
owner: NgAutoPilot
triggers:
  - duplication coverage
  - sonar coverage
  - duplicate code
  - coverage hardening
  - test coverage
compatibility:
  runtime:
    browser: true
    node: true
---

# SonarQube Duplication Coverage Hardening

## Purpose

Use this skill to improve duplication and coverage pragmatically.

The goal is to remove real duplication and raise meaningful coverage without creating bad abstractions or cosmetic tests.

The core rule is simple:

```txt
Fix real duplication and meaningful coverage gaps first.
```

## When to Use

Use this skill when:

- duplication is high
- coverage is low
- tests need hardening
- abstractions are being considered to satisfy gates

## Do

Distinguish:

- real duplication
- acceptable duplication
- intentional context separation

Raise coverage where branches and contracts matter.

## Do Not

Avoid abstractions that are worse than the duplication.

Avoid coverage-only tests that do not assert behavior.

## Review Checklist

- [ ] Duplication is real, not accidental context separation.
- [ ] Coverage gaps are meaningful.
- [ ] Tests assert behavior.
- [ ] No unnecessary abstraction was introduced.

## Expected Output

When this skill is used, the agent should:

1. Identify real duplication.
2. Raise meaningful coverage.
3. Avoid bad abstractions.
4. Keep tests behavior-focused.
5. Produce a pragmatic hardening plan.
