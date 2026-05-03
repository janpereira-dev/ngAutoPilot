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
