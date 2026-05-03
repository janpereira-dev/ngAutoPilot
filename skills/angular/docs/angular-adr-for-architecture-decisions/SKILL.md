---
id: angular.docs.angular-adr-for-architecture-decisions
name: Angular ADR for Architecture Decisions
description: Capture Angular architecture decisions as short ADRs with context, decision, consequences, and validation criteria before implementation.
stack:
  - Angular
category: docs
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - adr
  - architecture decision
  - decision record
---

# Angular ADR for Architecture Decisions

Use this skill when a decision needs to be recorded before code changes land.

## Core Rule

```txt
If the decision changes architecture, write an ADR first.
```

## ADR Minimum

- context
- decision
- alternatives considered
- consequences
- validation criteria

## Purpose

Record important Angular architecture decisions before code changes land.

## When to Use

Use this skill when a change affects architecture or boundaries.

## Do

- write the ADR before implementation
- keep it short and decision-focused

## Do Not

- hide architecture changes in unrelated PRs
- write a long essay instead of a decision record

## Review Checklist

- [ ] Context is clear.
- [ ] Decision is explicit.
- [ ] Alternatives were considered.
- [ ] Validation criteria are named.

## Output

Return:

1. The architectural decision.
2. Why it was taken.
3. Alternatives rejected.
4. Validation criteria.

## Expected Output

Return:

1. A concise diagnosis.
2. The minimal safe change or decision.
3. Validation steps.
4. Risks or rollback notes.
