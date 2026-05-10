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
version: 0.4.0
owner: NgAutoPilot
triggers:
  - micro frontends
  - micro-frontends
  - microfrontend architecture
  - microfrontend
  - micro frontend architecture
  - module federation
  - native federation
  - shell app
  - remote app
  - shell and remotes
  - bounded context architecture
  - distributed frontend
  - runtime composition
  - nx monorepo architecture
  - angular micro frontends
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
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

## Purpose

Classify whether the architecture should become distributed or stay modular.

## When to Use

Use this skill when shell and remote boundaries are being considered.

## Do

- choose the simplest viable integration pattern
- keep boundaries domain-based
- evaluate team ownership and delivery independence before selecting technology

## Do Not

- split by visual components
- introduce federation without a real delivery need

## Review Checklist

- [ ] Micro-frontends are actually warranted.
- [ ] The integration pattern is the simplest viable one.
- [ ] Domain boundaries are explicit.
- [ ] Required contracts are written first.

## Expected Output

Return:

1. Whether micro-frontends are warranted.
2. The simplest viable integration pattern.
3. The domain boundaries that should exist.
4. The contracts that must be written before implementation.
