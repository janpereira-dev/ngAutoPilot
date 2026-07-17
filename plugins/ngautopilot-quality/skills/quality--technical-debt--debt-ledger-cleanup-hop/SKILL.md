---
id: quality.technical-debt.debt-ledger-cleanup-hop
name: Debt Ledger Cleanup Hop
description: >
  Tracks and resolves technical debt in small, bounded cleanup hops so agents can record what was fixed, what was deferred, and why a broader refactor was not taken.
stack:
  - JavaScript
  - TypeScript
category: technical-debt
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - debt ledger
  - technical debt cleanup
  - cleanup hop
  - debt tracking
  - incremental debt repayment
  - refactor hop
compatibility:
  runtime:
    browser: true
    node: true
---

# Debt Ledger Cleanup Hop

## Purpose

Use this skill to record and clean up technical debt in small hops.

This is the coordination skill for debt work. It does not fix every issue in one pass. It identifies what can be cleaned safely now, what should be deferred, and what should be tracked explicitly.

The core rule is simple:

```txt
Fix the debt that fits the hop. Record the rest.
```

## When to Use

Use this skill when:

- a migration reveals non-blocking debt
- quality work needs to stay small and traceable
- cleanup must not mix with a risky feature refactor
- debt should be tracked without inflating the PR

## Do

Record:

- debt detected
- debt cleaned
- debt deferred
- reason for deferment
- risk
- suggested owner
- validation performed

Keep the hop bounded and reversible.

## Do Not

Avoid turning a debt cleanup hop into a broad refactor.

Avoid hiding unresolved debt.

Avoid mixing debt cleanup with unrelated feature work.

## Review Checklist

- [ ] The debt cleaned fits the hop.
- [ ] Deferred debt is recorded.
- [ ] Validation was run.
- [ ] No unrelated refactor was introduced.

## Expected Output

When this skill is used, the agent should:

1. Record the debt ledger entry.
2. Clean only the safe portion.
3. Defer and explain the rest.
4. Validate the hop.
5. Keep the PR small and traceable.
