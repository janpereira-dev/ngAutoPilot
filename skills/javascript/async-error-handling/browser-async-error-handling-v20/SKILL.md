---
id: javascript.async-error-handling.browser-async-error-handling-v20
name: Browser Async Error Handling v20+
description: >
  Reviews asynchronous JavaScript error handling in browser-facing code for modern runtime baselines, focusing on user-facing failure states, safe fallbacks, retry behavior, and preserved error context.
stack:
  - JavaScript
  - TypeScript
  - Browser
category: javascript
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - browser async error handling v20
  - web async handling v20
  - browser promise errors
  - user facing failure state
  - retry behavior
  - browser rejection handling
compatibility:
  runtime:
    browser: true
---

# Browser Async Error Handling v20+

## Purpose

Use this skill for browser-facing async error handling where user experience and safe fallback behavior matter.

This variant keeps the browser guidance aligned with modern runtime baselines and emphasizes failure visibility in UI, retry behavior, and safe continuation when the browser can recover.

## When to Use

Use this skill when:

- the runtime is browser-based
- user-facing failure states are needed
- retry or fallback UX matters
- async operations drive UI state

## Do

Surface errors in a user-visible way.

Keep fallbacks semantically valid.

Use retry when the condition may recover.

Preserve technical context for logs and telemetry.

## Do Not

Avoid silent UI failure.

Avoid fake success states.

Avoid browser guidance that assumes Node-style process control.

## Review Checklist

- [ ] Browser runtime is explicit.
- [ ] Failure states are user-visible.
- [ ] Retry and fallback are intentional.
- [ ] Error context is preserved.

## Expected Output

When this skill is used, the agent should:

1. Review browser-facing failure paths.
2. Recommend safe fallbacks and retry behavior.
3. Preserve error context for telemetry.
4. Keep UX recoverable.
5. Produce browser-specific guidance.
