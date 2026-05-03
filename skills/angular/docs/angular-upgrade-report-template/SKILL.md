---
id: angular.docs.angular-upgrade-report-template
name: Angular Upgrade Report Template
description: Produce a concise upgrade report that records the current stack, hop taken, gates passed, blockers, and next safe step.
stack:
  - Angular
category: docs
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - upgrade report
  - migration report
  - hop summary
---

# Angular Upgrade Report Template

Use this skill after an Angular hop, migration, or compatibility gate change.

## Core Rule

```txt
No upgrade is complete until the report says what changed and what remains blocked.
```

## Report Fields

- current stack
- target stack
- hop or change applied
- gates passed
- blockers found
- validation run
- next safe step

## Purpose

Summarize the upgrade state after a hop or migration step.

## When to Use

Use this skill after an Angular upgrade, migration, or compatibility gate change.

## Do

- record the current and target stack
- list blockers and the next safe step

## Do Not

- claim the upgrade is done without validation evidence
- omit blockers from the report

## Review Checklist

- [ ] The upgrade summary is concise.
- [ ] Validation evidence is included.
- [ ] Blockers are visible.
- [ ] The next safe step is identified.

## Output

Return:

1. The upgrade summary.
2. The validation evidence.
3. The remaining blockers.
4. The next safe step.

## Expected Output

Return:

1. A concise diagnosis.
2. The minimal safe change or decision.
3. Validation steps.
4. Risks or rollback notes.
