---
id: quality.eslint.eslint-autofix-safe-cleanup-browser-v18
name: ESLint Autofix Safe Cleanup Browser v18+
description: >
  Applies safe ESLint autofix cleanup in browser-oriented projects where mechanical fixes must preserve UI behavior, build output, and user-facing runtime contracts.
stack:
  - JavaScript
  - TypeScript
category: eslint
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - eslint autofix browser
  - browser lint fix
  - safe autofix browser
  - mechanical fix browser
compatibility:
  runtime:
    browser: true
---

# ESLint Autofix Safe Cleanup Browser v18+

## Purpose

Use this skill for browser-oriented projects where ESLint autofix must preserve UI behavior.

This variant keeps the cleanup mechanical and ensures no DOM, rendering, or user interaction behavior changes slip in through a lint pass.

## When to Use

Use this skill when:

- the runtime is browser-based
- autofix touches UI code
- behavior must stay unchanged
- the cleanup should remain small and reviewable

## Do

Keep browser behavior intact.

Review the diff before accepting it.

Validate rendering or interaction tests when relevant.

## Do Not

Avoid broad autofix changes that alter UI behavior.

Avoid mixing browser behavior changes with lint cleanup.

## Review Checklist

- [ ] Browser behavior is unchanged.
- [ ] The fix is mechanical.
- [ ] The diff is bounded.

## Expected Output

When this skill is used, the agent should:

1. Decide whether autofix is safe in browser code.
2. Apply only mechanical changes.
3. Preserve UI behavior.
4. Validate relevant tests.
5. Keep the cleanup bounded.
