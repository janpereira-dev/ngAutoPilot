---
id: angular.templates.template-diagnostics-matrix
name: Angular Template Diagnostics Matrix
description: >
  Groups Angular NG81xx and NG8021 template diagnostics by problem type so agents can triage diagnostics by cause instead of by code number.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - template diagnostics matrix
  - ng81xx matrix
  - diagnostic grouping
  - template problem types
  - angular diagnostics triage
compatibility:
  angular:
    min: "17"
    recommendedModern: "17+"
---

# Angular Template Diagnostics Matrix

## Purpose

Use this skill to group Angular Extended Diagnostics by problem type instead of by diagnostic code.

This makes template triage easier because the agent can focus on the kind of issue, not just the code number.

The core rule is simple:

```txt
Group diagnostics by root cause, then fix by smallest safe change.
```

## When to Use

Use this skill when:

- many NG81xx diagnostics appear together
- diagnostics need triage by problem family
- the team wants to plan remediation work

## Do

Group issues into:

- binding syntax
- nullability mismatch
- missing imports
- signal invocation
- event binding invocation
- track function invocation
- hydration/defer behavior

Use the matrix to route each issue to the smallest corrective action.

## Do Not

Avoid treating every diagnostic code as a separate strategy.

Avoid using the matrix to suppress diagnostics.

## Review Checklist

- [ ] Diagnostics were grouped by problem type.
- [ ] The matrix helps choose the fix path.
- [ ] The result stays actionable.

## Expected Output

When this skill is used, the agent should:

1. Group diagnostics by root cause.
2. Route each group to a fix strategy.
3. Keep the triage actionable.
4. Avoid code-number-only thinking.
5. Produce a diagnostic matrix.
