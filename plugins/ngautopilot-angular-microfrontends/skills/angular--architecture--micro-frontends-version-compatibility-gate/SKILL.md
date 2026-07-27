---
id: angular.architecture.micro-frontends-version-compatibility-gate
name: Micro-frontends Version Compatibility Gate
description: >
  Reviews version compatibility gates for Angular micro-frontends in Nx monorepos, focusing on shell and remote compatibility ranges, dependency version drift, and upgrade safety.
stack:
  - Angular
  - TypeScript
  - Nx
  - Module Federation
category: architecture
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - micro fronts version compatibility
  - micro-frontends version compatibility
  - compatibility gate
  - version compatibility gate
  - shell remote version
  - remote version drift
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

## Purpose

Use this skill to review or design version compatibility gates for Angular micro-frontends.

Independent remotes only work safely when version compatibility is controlled. This skill checks whether shell and remote combinations are supported, whether dependency drift is acceptable, and whether upgrades can happen without breaking runtime composition.

The core rule is simple:

```txt
If the shell cannot tolerate the remote version, the release must be blocked.
```

## When to Use

Use this skill when:

- shell and remote versions can diverge
- dependency drift is a risk
- a compatibility matrix is needed
- upgrades need gating before rollout
- Module Federation or Native Federation is used with independent delivery

## Do

Define a compatibility matrix:

```txt
Shell v1 -> Remote v1: supported
Shell v1 -> Remote v2: supported
Shell v1 -> Remote v3: blocked
```

Document the gate inputs:

```txt
- shell version
- remote version
- shared dependency versions
- exposed contract version
- fallback availability
```

Use CI to fail incompatible combinations before deployment.

Prefer explicit semver ranges and supported pairings over assumptions.

## Do Not

Avoid shipping a remote just because it builds locally.

Avoid unbounded dependency drift.

Avoid silent compatibility breakage in runtime composition.

Avoid treating a version mismatch as a UI-only problem.

## Review Checklist

- [ ] Shell and remote compatibility is documented.
- [ ] Unsupported combinations are blocked.
- [ ] Shared dependency drift is reviewed.
- [ ] Upgrade safety is part of the release path.
- [ ] Compatibility checks run before runtime exposure.

## Expected Output

When this skill is used, the agent should:

1. Read the shell and remote version contract.
2. Identify allowed and blocked combinations.
3. Flag dependency drift or exposed contract mismatch.
4. Recommend a compatibility matrix or gate.
5. Produce a safe upgrade policy.
