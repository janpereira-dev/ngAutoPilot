---
id: angular.microfrontends.micro-frontends-dependency-sharing-policy
name: Micro-frontends Dependency Sharing Policy
description: Control which libraries may be shared across Angular micro-frontends and prevent domain leakage through shared packages.
stack:
  - Angular
  - TypeScript
  - Nx
  - Module Federation
category: architecture
status: stable
version: 0.3.0
owner: NgAutoPilot
triggers:
  - dependency sharing
  - shared libraries
  - domain leakage
---

# Micro-frontends Dependency Sharing Policy

Use this skill to decide what may be shared between shell and remotes.

## Core Rule

```txt
Share contracts, not domain ownership.
```

## Safe Shares

- shared/ui
- shared/domain
- shared/data-access
- shared/util
- design-system

## Purpose

Allow only contracts that are safe to share across remotes.

## When to Use

Use this skill when deciding what a shell and remotes may share.

## Do

- share contracts, not ownership
- block domain services from shared libraries

## Do Not

- leak remote-private state into shared packages
- introduce hidden singleton coupling

## Review Checklist

- [ ] Safe shared libraries are identified.
- [ ] Blocked shared libraries are explicit.
- [ ] Dependency drift risks are described.
- [ ] The sharing policy is minimal.

## Avoid

- remote-private services in shared libraries
- domain state leaking across remotes
- hidden runtime coupling through singleton services

## Output

Return:

1. Shared libraries that are acceptable.
2. Shared libraries that should be blocked.
3. Dependency drift risks.
4. A minimal sharing policy.

## Expected Output

Return:

1. A concise diagnosis.
2. The minimal safe change or decision.
3. Validation steps.
4. Risks or rollback notes.
