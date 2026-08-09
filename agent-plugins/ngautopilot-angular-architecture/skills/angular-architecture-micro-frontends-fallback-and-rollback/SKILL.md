---
name: angular-architecture-micro-frontends-fallback-and-rollback
description: "Designs fallback and rollback behavior for Angular micro-frontends in Nx monorepos, focusing on remote load failure, safe degradation, retry flow, and release rollback readiness."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.micro-frontends-fallback-and-rollback"
  ngautopilot-source: "skills/angular/architecture/micro-frontends-fallback-and-rollback/SKILL.md"
  ngautopilot-version: "0.5.3"
---


# Micro-frontends Fallback and Rollback

## Purpose

Use this skill to design fallback and rollback behavior for Angular micro-frontends.

Runtime composition makes failure a normal case, not an edge case. The shell must remain usable when a remote cannot load, and the release process must allow quick rollback when a bad remote slips through.

The core rule is simple:

```txt
Assume remotes fail and plan for safe recovery.
```

## When to Use

Use this skill when:

- remote loading may fail at runtime
- fallback UX is required
- retry behavior needs to be defined
- release rollback must be fast
- a shell needs to degrade safely when a remote is unavailable

## Do

Define fallback tiers:

```txt
1. Inline retry
2. Safe fallback screen
3. Route redirect
4. Degraded shell mode
```

Keep fallback behavior user-centered:

```txt
- explain the failure
- preserve navigation where possible
- avoid blank shells
- allow retry if the condition may self-resolve
```

Document rollback readiness:

```txt
- last known good version
- rollback trigger
- rollback owner
- rollback window
- verification after rollback
```

## Do Not

Avoid silent failures.

Avoid a blank screen when a remote dies.

Avoid rollback procedures that depend on manual tribal knowledge.

Avoid fallback behavior that hides the fact that a remote is broken.

## Review Checklist

- [ ] Fallback exists for remote load failure.
- [ ] Retry behavior is defined.
- [ ] Shell remains navigable under failure.
- [ ] Rollback can be executed quickly.
- [ ] The user gets a clear failure state.
- [ ] Recovery steps are documented.

## Expected Output

When this skill is used, the agent should:

1. Identify failure scenarios.
2. Define fallback tiers.
3. Specify rollback readiness requirements.
4. Recommend UX that preserves shell usability.
5. Produce a safe recovery plan.
