---
id: javascript.async-error-handling.nodejs-async-error-handling-v20
name: Node.js Async Error Handling v20+
description: >
  Reviews asynchronous JavaScript error handling in Node.js 20+ projects, focusing on process-level failure behavior, modern runtime expectations, and safe propagation from scripts, services, and workers.
stack:
  - JavaScript
  - TypeScript
  - Node.js
category: javascript
status: stable
version: 0.3.1
owner: NgAutoPilot
triggers:
  - node async error handling v20
  - nodejs async handling v20
  - node v20 errors
  - process rejection handling
  - script failure behavior
  - node promise errors
compatibility:
  runtime:
    node: "20+"
---

# Node.js Async Error Handling v20+

## Purpose

Use this skill for Node.js 20+ projects where async error behavior matters at process, script, service, or worker boundaries.

This variant refines the Node guidance for newer runtime expectations and keeps process-level failure behavior explicit.

## When to Use

Use this skill when:

- the runtime is Node.js 20 or newer
- scripts or services handle async failures
- process exit behavior matters
- file, network, or worker operations need safe contracts

## Do

Make process-level failure explicit.

Avoid unhandled promise rejections in long-running services and scripts.

Use exit codes and logs intentionally in CLIs.

Preserve the original error when wrapping failures.

## Do Not

Avoid assuming browser-style recovery behavior in Node.

Avoid swallowing process-level failures that should stop the job.

## Review Checklist

- [ ] Node.js version is 20 or newer.
- [ ] Process failure behavior is explicit.
- [ ] Scripts and services handle rejections safely.
- [ ] Logs and exit codes are intentional.

## Expected Output

When this skill is used, the agent should:

1. Review Node-specific async failure boundaries.
2. Recommend process-safe error handling.
3. Keep rejection behavior explicit.
4. Preserve error context.
5. Produce Node 20+ guidance.
