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
version: 0.3.1
owner: NgAutoPilot
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
