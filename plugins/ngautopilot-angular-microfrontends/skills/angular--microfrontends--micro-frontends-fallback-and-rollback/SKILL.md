---
id: angular.microfrontends.micro-frontends-fallback-and-rollback
name: Micro-frontends Fallback and Rollback
description: Design fallback UI, safe redirects, and rollback paths for failed Angular remote loading or incompatible deploys.
stack:
  - Angular
  - TypeScript
  - Nx
  - Module Federation
category: architecture
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - fallback
  - rollback
  - remote failure
  - micro fronts fallback
  - micro-frontends fallback
  - rollback policy
  - fallback strategy
  - safe degradation
  - retry flow
  - graceful fallback
  - micro frontends rollback
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Micro-frontends Fallback and Rollback

Use this skill when remote loading can fail or a rollout needs a safe escape path.

## Core Rule

```txt
Remote failure should degrade safely, not cascade through the shell.
```

## Requirements

- fallback UI for each remote boundary
- retry path or safe redirect
- release rollback strategy
- smoke tests for exposed contracts

## Purpose

Design safe degradation paths when a remote cannot load.

## When to Use

Use this skill when remote loading can fail or rollout needs an escape path.

## Do

- add fallback UI for each remote boundary
- define rollback or safe redirect behavior
- define fallback tiers and recovery ownership explicitly

## Do Not

- let remote failure cascade into the shell
- deploy without smoke tests

## Review Checklist

- [ ] Failure modes are listed.
- [ ] The fallback UX is defined.
- [ ] Rollback or safe redirect exists.
- [ ] Smoke tests cover exposed contracts.

## Expected Output

Return:

1. Failure modes to expect.
2. The fallback UX that should appear.
3. The rollback or safe redirect strategy.
4. The minimum smoke tests required.
