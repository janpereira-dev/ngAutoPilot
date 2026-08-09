---
name: angular-architecture-micro-frontends-release-governance
description: "Reviews release governance for Angular micro-frontends in Nx monorepos, focusing on ownership, versioning, deployment independence, compatibility checks, and coordinated rollout policy."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.micro-frontends-release-governance"
  ngautopilot-source: "skills/angular/architecture/micro-frontends-release-governance/SKILL.md"
  ngautopilot-version: "0.6.0"
---


# Micro-frontends Release Governance

## Purpose

Use this skill to review or design release governance for Angular micro-frontends.

Micro-frontends only work sustainably when ownership, versioning, deployment policy, and compatibility checks are explicit. This skill focuses on the operational controls that keep independent delivery safe.

The core rule is simple:

```txt
Independent deployment requires explicit release governance.
```

## When to Use

Use this skill when:

- remotes are released independently
- teams need versioning and compatibility policy
- rollout and rollback need coordination
- shell and remote release timing differs
- CI/CD gates must protect runtime composition

## Do

Define the release contract:

```txt
Owner:
Remote:
Version:
Deployment target:
Compatibility range:
Rollback strategy:
Approval gate:
Smoke tests:
```

Coordinate shell and remote compatibility:

```txt
shell v1 + remote v1 -> supported
shell v1 + remote v2 -> supported
shell v1 + remote v3 -> blocked
```

Use release policy that matches the delivery model:

```txt
Shared release train -> simpler governance
Independent remotes -> stricter compatibility gates
```

## Do Not

Avoid shipping a remote without an owner.

Avoid version drift without compatibility checks.

Avoid independent deployment without rollback policy.

Avoid approving releases only on the basis of build success.

## Review Checklist

- [ ] Each remote has an owner.
- [ ] Version compatibility is documented.
- [ ] Rollback strategy exists.
- [ ] Smoke tests gate the release.
- [ ] Shell and remote compatibility is validated.
- [ ] The release policy matches the actual team topology.

## Expected Output

When this skill is used, the agent should:

1. Identify the release model.
2. Check ownership and version policy.
3. Flag compatibility risks.
4. Recommend rollout and rollback controls.
5. Define the smallest safe release governance model.
