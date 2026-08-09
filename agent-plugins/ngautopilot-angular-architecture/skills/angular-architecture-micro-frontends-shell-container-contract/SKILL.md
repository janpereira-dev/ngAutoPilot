---
name: angular-architecture-micro-frontends-shell-container-contract
description: "Audits Angular shell or container apps in micro-frontends architectures, focusing on routing, composition, error handling, cross-cutting concerns, and strict separation from domain logic."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.micro-frontends-shell-container-contract"
  ngautopilot-source: "skills/angular/architecture/micro-frontends-shell-container-contract/SKILL.md"
  ngautopilot-version: "0.5.3"
---


# Micro-frontends Shell Container Contract

## Purpose

Use this skill to evaluate or design the shell or container application in a micro-frontends architecture.

The shell owns composition and cross-cutting concerns, not business logic. It should remain thin, predictable, and resilient when remotes fail or change.

The core rule is simple:

```txt
The shell orchestrates. Remotes own domain behavior.
```

## When to Use

Use this skill when:

- a shell app composes multiple remotes
- routing is centralized in a host application
- error handling or fallback UX is needed for remote loading
- authentication, layout, or navigation are shared across remotes
- the shell risks accumulating domain rules from multiple teams

## Do

Keep the shell responsibilities narrow:

```txt
- route resolution
- remote composition
- layout chrome
- cross-cutting auth integration
- loading and error boundaries
- navigation contracts
```

Use explicit route ownership:

```txt
/checkout -> checkout MFE
/catalog -> catalog MFE
/profile -> profile MFE
```

Handle remote failure gracefully:

```txt
remote fails -> shell catches -> fallback UI -> retry or safe redirect
```

Define the shell contract alongside remotes:

```txt
Shell:
  - load mode
  - shared dependencies
  - route map
  - fallback policy
  - event bridge
```

## Do Not

Avoid business rules in the shell.

Avoid direct coupling from the shell to remote internals.

Avoid global state that mixes remote domain data.

Avoid using the shell as a dumping ground for every shared helper.

## Review Checklist

- [ ] The shell owns only composition and cross-cutting concerns.
- [ ] Route ownership is explicit.
- [ ] Remote failure has a fallback path.
- [ ] Shared dependencies are minimal.
- [ ] Domain logic remains in remotes.
- [ ] The shell does not become a hidden monolith.

## Expected Output

When this skill is used, the agent should:

1. Inspect shell responsibilities.
2. Separate composition from domain logic.
3. Define route and remote ownership clearly.
4. Add fallback and retry behavior where needed.
5. Recommend the smallest safe shell contract.
