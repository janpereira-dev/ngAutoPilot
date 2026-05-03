---
id: angular.microfrontends.micro-frontends-version-compatibility-gate
name: Micro-frontends Version Compatibility Gate
description: Gate Angular shell and remote version drift so incompatible combinations are blocked before runtime exposure.
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

# Micro-frontends Version Compatibility Gate

Use this skill when shell and remote versions may diverge.

## Core Rule

```txt
If the shell cannot tolerate the remote version, the release is blocked.
```

## Gate Inputs

- shell version
- remote version
- shared dependency versions
- exposed contract version
- fallback availability

## Output

Return:

1. Allowed and blocked combinations.
2. Compatibility matrix.
3. Upgrade safety policy.
4. CI gate that should fail incompatible combinations.
