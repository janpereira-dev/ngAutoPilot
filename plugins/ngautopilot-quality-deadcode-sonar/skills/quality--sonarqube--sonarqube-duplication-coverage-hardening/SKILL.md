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
version: 0.9.0
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

Turn each meaningful gap into an observable regression: state the behavior, the input that could break it, and the assertion that would fail. For async searches, cover normalization, the debounce boundary and reset, duplicate suppression, stale responses, teardown, and a successful request after an error fallback.

Keep line/branch coverage separate from behavioral evidence. A suite can execute both requests without detecting that an obsolete response overwrites the current result. Use assertions that distinguish the incorrect implementation, not extra executions added only to move the coverage percentage.

When mutation testing is already configured, report generated, killed, surviving, and untested mutants from its actual output. Inspect the installed Stryker version and enabled mutators before claiming a transformation is generated. Replacing `switchMap` with `mergeMap` is a useful manual counterexample, not a guaranteed automatic Stryker mutation. Do not install mutation tooling or invent scores merely to complete a coverage fix.

## Do Not

Avoid abstractions that are worse than the duplication.

Avoid coverage-only tests that do not assert behavior.

## Review Checklist

- [ ] Duplication is real, not accidental context separation.
- [ ] Coverage gaps are meaningful.
- [ ] Tests assert behavior.
- [ ] No unnecessary abstraction was introduced.
- [ ] Each new test names a regression it would detect.
- [ ] Coverage, manual counterexamples, and executed mutation results are reported separately.

## Expected Output

1. Identify real duplication.
2. Raise meaningful coverage.
3. Avoid bad abstractions.
4. Keep tests behavior-focused.
5. Produce a pragmatic hardening plan.
