---
id: quality.eslint.eslint-autofix-safe-cleanup-node-v20
name: ESLint Autofix Safe Cleanup Node v20+
description: >
  Applies safe ESLint autofix cleanup in Node.js 20+ projects where mechanical fixes must preserve process behavior, script output, and service contracts.
stack:
  - JavaScript
  - TypeScript
category: eslint
status: stable
version: 0.5.1
owner: NgAutoPilot
triggers:
  - eslint autofix node
  - node lint fix
  - safe autofix node
  - mechanical fix node
compatibility:
  runtime:
    node: "20+"
---

# ESLint Autofix Safe Cleanup Node v20+

## Purpose

Use this skill for Node.js 20+ projects where ESLint autofix must preserve process and script behavior.

This variant keeps the cleanup mechanical and ensures no command-line, worker, or service contract changes slip in through a lint pass.

## When to Use

Use this skill when:

- the runtime is Node.js 20 or newer
- autofix touches scripts or services
- process behavior must stay unchanged
- the cleanup should remain small and reviewable

## Do

Keep process behavior intact.

Review the diff before accepting it.

Validate scripts or services when relevant.

## Do Not

Avoid broad autofix changes that alter process behavior.

Avoid mixing Node behavior changes with lint cleanup.

## Review Checklist

- [ ] Node process behavior is unchanged.
- [ ] The fix is mechanical.
- [ ] The diff is bounded.

## Expected Output

When this skill is used, the agent should:

1. Decide whether autofix is safe in Node code.
2. Apply only mechanical changes.
3. Preserve process behavior.
4. Validate relevant tests or scripts.
5. Keep the cleanup bounded.
