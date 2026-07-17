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
version: 0.5.2
owner: NgAutoPilot
triggers:
  - compatibility gate
  - version compatibility
  - remote version drift
  - micro fronts version compatibility
  - micro-frontends version compatibility
  - version compatibility gate
  - shell remote version
  - upgrade safety
  - module federation versioning
  - micro frontends compatibility
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
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

## Purpose

Block incompatible shell and remote combinations before runtime.

## When to Use

Use this skill when shell and remote versions may diverge.

## Do

- define an explicit compatibility matrix
- fail unsupported combinations in CI
- prefer explicit semver ranges and supported pairings

## Do Not

- ship a remote only because it builds locally
- allow silent compatibility drift

## Review Checklist

- [ ] Shell and remote compatibility is documented.
- [ ] Unsupported combinations are blocked.
- [ ] Shared dependency drift is reviewed.
- [ ] Upgrade safety is part of the release path.

## Expected Output

Return:

1. Allowed and blocked combinations.
2. Compatibility matrix.
3. Upgrade safety policy.
4. CI gate that should fail incompatible combinations.
