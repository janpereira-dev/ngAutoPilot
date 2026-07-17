---
id: angular.security.angular-v22-security-and-server-boundaries
name: Angular v22 Security and Server Boundaries
description: >
  Use this skill when v22 behavior changes could alter the attack surface or create unsafe assumptions around server and template boundaries.
stack:
  - Angular
  - TypeScript
category: security
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - security
  - data-*
  - SSR security
  - server transport
  - redirect safety
compatibility:
  angular:
    min: "22"
---

# Angular v22 Security and Server Boundaries

## Purpose

Use this skill when v22 behavior changes could alter the attack surface or create unsafe assumptions around server and template boundaries.

## When to Use

Use this skill when:

- Template bindings changed in a way that may hide or reveal data flow.
- SSR or platform-server code needs a safer transport path.
- Redirect handling or DOM binding semantics are part of the review.

## When Not to Use

Do not use this skill when:

- The issue is a generic XSS review.
- The task is only about rendering correctness.
- There is no security-relevant surface in the change.

## Required Inputs

- template bindings
- SSR transport
- platform-server configuration
- router redirects

## Procedure

1. Inspect any data-* and attribute bindings that changed meaning.
2. Confirm server-side requests use the safer default transport path.
3. Check redirects, headers, and request forwarding for unintended exposure.

## Do

- Prefer explicit bindings over accidental magic.
- Keep server transport predictable.
- Treat redirects and forwarded headers as security-sensitive.

## Do Not

- Do not rely on deprecated or ambiguous binding behavior.
- Do not keep server XHR paths if the safer default is available.
- Do not assume a routing change is harmless just because it compiles.

## Review Checklist

- [ ] No unsafe binding assumptions remain.
- [ ] Server transport is explicit.
- [ ] The security impact was validated.

## Expected Output

When this skill is used, the agent should:

1. A security boundary summary.
2. The risky surface that changed.
3. The safer replacement path.
