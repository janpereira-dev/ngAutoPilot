---
id: angular.docs.angular-upgrade-report-template
name: Angular Upgrade Report Template
description: Produce a concise upgrade report that records the current stack, hop taken, gates passed, blockers, and next safe step.
stack:
  - Angular
category: docs
status: stable
version: 0.3.1
owner: NgAutoPilot
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

## Output

Return:

1. The upgrade summary.
2. The validation evidence.
3. The remaining blockers.
4. The next safe step.
