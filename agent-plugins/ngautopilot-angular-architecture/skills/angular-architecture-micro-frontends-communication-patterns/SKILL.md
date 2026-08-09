---
name: angular-architecture-micro-frontends-communication-patterns
description: "Evaluates communication patterns between Angular micro-frontends in Nx monorepos, focusing on explicit contracts, low coupling, shared state limits, and safe cross-remote event flow."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.micro-frontends-communication-patterns"
  ngautopilot-source: "skills/angular/architecture/micro-frontends-communication-patterns/SKILL.md"
  ngautopilot-version: "0.6.0"
---


# Micro-frontends Communication Patterns

## Purpose

Use this skill to evaluate or design communication patterns between Angular micro-frontends.

Micro-frontends should communicate through explicit contracts, not accidental shared state. The goal is to keep integrations predictable, typed where possible, and easy to reason about at the shell and remote boundaries.

The core rule is simple:

```txt
Prefer explicit contracts over global coupling.
```

## When to Use

Use this skill when:

- a shell needs to receive events from remotes
- one remote needs to notify the shell about user intent
- two remotes appear to need coordination
- URL state, events, or shared state are being evaluated
- a global event bus or pub/sub system is under consideration
- cross-remote communication is becoming hard to trace

## Do

Prefer the narrowest communication mechanism that fits the problem:

```txt
1. URL or query params
2. Custom DOM events
3. Typed event bridge
4. Shared state only for truly transversal concerns
```

Use URL state for navigable or shareable context:

```txt
/checkout?step=payment
/catalog?filter=active
```

Use custom events for low-coupling intent:

```txt
checkout.completed
catalog.filtered
profile.updated
```

Keep shared state minimal:

```txt
Allowed:
- session
- locale
- theme
- feature flags
- permissions
- navigation context
```

Define event contracts explicitly:

```txt
Event name:
Payload:
Sender:
Consumer:
Version:
Fallback:
```

## Do Not

Avoid a global bus without a contract.

Avoid sharing feature state across remotes.

Avoid direct imports from one remote into another remote.

Avoid using shared state for business rules owned by a single domain.

Avoid communication patterns that cannot be traced in debugging or tests.

## Review Checklist

- [ ] The communication mechanism is the simplest one that fits the use case.
- [ ] Events and payloads are documented.
- [ ] Shared state is limited to transversal concerns.
- [ ] Remote-to-remote imports are avoided.
- [ ] The shell remains the coordination point where appropriate.
- [ ] The chosen pattern is testable and observable.

## Expected Output

When this skill is used, the agent should:

1. Classify the communication need.
2. Recommend the narrowest viable pattern.
3. Define event or URL contracts explicitly.
4. Flag hidden coupling or shared-state overreach.
5. Suggest fallback and test coverage for the communication path.
