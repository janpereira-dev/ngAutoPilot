---
id: angular.architecture.micro-frontends-observability-contract
name: Micro-frontends Observability Contract
description: >
  Reviews observability contracts for Angular micro-frontends in Nx monorepos, focusing on logging, metrics, tracing, error boundaries, and runtime failure visibility.
stack:
  - Angular
  - TypeScript
  - Nx
  - Module Federation
category: architecture
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - micro fronts observability
  - micro-frontends observability
  - observability contract
  - logging metrics tracing
  - runtime failure visibility
  - error boundaries
  - micro frontends logs
  - shell telemetry
  - remote telemetry
compatibility:
  angular:
    min: "2"
    signalInputsFrom: "17"
    recommendedModern: "17+"
---

# Micro-frontends Observability Contract

## Purpose

Use this skill to review or design observability contracts for Angular micro-frontends.

Runtime composition is hard to debug unless the shell and remotes emit meaningful telemetry. This skill defines the minimum logging, metrics, tracing, and error visibility needed to operate distributed frontend delivery safely.

The core rule is simple:

```txt
If a remote fails, the failure must be visible and attributable.
```

## When to Use

Use this skill when:

- runtime remotes need monitoring
- shell and remote errors must be attributable
- release health needs telemetry
- support needs to debug remote load failures
- observability gaps make runtime composition hard to operate

## Do

Define the observability surface:

```txt
Shell events:
- remote load started
- remote load failed
- remote loaded
- fallback shown

Remote events:
- route activated
- user intent emitted
- domain action failed
```

Track the minimum signals:

```txt
- error count
- remote load latency
- fallback frequency
- retry count
- release version
```

Include correlation identifiers where practical.

Expose enough context for support without leaking secrets or sensitive data.

## Do Not

Avoid silent failure states.

Avoid logs that cannot identify the failing remote.

Avoid dumping sensitive payloads into telemetry.

Avoid telemetry contracts that only exist in one remote and not the shell.

## Review Checklist

- [ ] Remote load success and failure are observable.
- [ ] Fallback usage is measurable.
- [ ] Logs identify shell versus remote responsibility.
- [ ] Telemetry avoids sensitive data leakage.
- [ ] Release version is visible in support workflows.

## Expected Output

When this skill is used, the agent should:

1. Identify required telemetry events.
2. Separate shell and remote observability concerns.
3. Flag blind spots in failure visibility.
4. Recommend minimal but useful metrics and logs.
5. Produce an operational visibility contract.
