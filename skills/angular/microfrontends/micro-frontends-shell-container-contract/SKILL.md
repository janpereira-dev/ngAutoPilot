---
id: angular.microfrontends.micro-frontends-shell-container-contract
name: Micro-frontends Shell Container Contract
description: Define a thin Angular shell contract that handles routing, composition, fallback UX, and cross-cutting concerns without owning domain logic.
stack:
  - Angular
  - TypeScript
  - Nx
  - Module Federation
category: architecture
status: stable
version: 0.1.0
owner: NgAutoPilot
triggers:
  - shell container
  - host app
  - remote loading
---

# Micro-frontends Shell Container Contract

Use this skill when a shell or host app composes multiple remotes.

## Core Rule

```txt
The shell orchestrates. Remotes own domain behavior.
```

## Shell Responsibilities

- routing
- composition
- layout chrome
- auth integration
- loading and error boundaries
- navigation contracts

## Purpose

Keep the shell thin and predictable while remotes own domain behavior.

## When to Use

Use this skill when a shell or container app composes multiple remotes.

## Do

- keep shell logic orchestration-only
- define fallback and retry behavior

## Do Not

- place business logic in the shell
- couple shell internals to remote implementation details

## Review Checklist

- [ ] The shell owns only composition and cross-cutting concerns.
- [ ] Route ownership is explicit.
- [ ] Remote failure has a fallback path.
- [ ] Shared dependencies are minimal.

## Do Not

- put business logic in the shell
- couple shell internals to remote implementation details
- let the shell become a hidden monolith

## Output

Return:

1. Shell responsibilities.
2. Route ownership.
3. Fallback and retry behavior.
4. The smallest safe shell contract.

## Expected Output

Return:

1. A concise diagnosis.
2. The minimal safe change or decision.
3. Validation steps.
4. Risks or rollback notes.
