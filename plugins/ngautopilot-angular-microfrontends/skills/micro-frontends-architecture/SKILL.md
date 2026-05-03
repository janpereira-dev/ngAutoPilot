---
id: angular.microfrontends.micro-frontends-architecture
name: Micro-frontends Architecture
description: Classify whether Angular micro-frontends are warranted and choose the simplest viable integration pattern before introducing shell and remote boundaries.
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

# Micro-frontends Architecture

Use this skill to decide whether micro-frontends are justified for the repository.

## Core Rule

```txt
If the team does not need independent delivery and ownership, prefer a modular monolith with lazy loading.
```

## Check

- real organizational boundaries
- domain-level ownership
- independent release need
- shell and remote contract scope
- shared library boundaries

## Output

Return:

1. Whether micro-frontends are warranted.
2. The simplest viable integration pattern.
3. The domain boundaries that should exist.
4. The contracts that must be written before implementation.
