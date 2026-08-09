---
name: angular-architecture-module-federation-runtime-contract
description: "Evaluates Angular Module Federation and Native Federation runtime contracts in Nx monorepos, focusing on remote exposure, shared dependency policy, fallback behavior, and version compatibility."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.module-federation-runtime-contract"
  ngautopilot-source: "skills/angular/architecture/module-federation-runtime-contract/SKILL.md"
  ngautopilot-version: "0.5.3"
---


# Module Federation Runtime Contract

## Purpose

Use this skill to evaluate or design the runtime contract for Angular Module Federation or Native Federation setups.

This skill focuses on the remote boundary itself: what a remote exposes, what the shell consumes, which dependencies are shared, and how failure is handled at runtime.

The core rule is simple:

```txt
If a remote cannot be loaded safely, the shell must still work.
```

## When to Use

Use this skill when:

- a shell loads remotes at runtime
- Module Federation or Native Federation is used
- remote entries need contract validation
- shared dependency configuration must be reviewed
- version compatibility between shell and remotes is a risk
- fallback behavior for remote loading is required

## Do

Define the exposed remote surface explicitly:

```txt
Remote name:
Exposes:
Consumes:
Shared singletons:
Version range:
Fallback:
Smoke tests:
```

Keep shared dependencies intentional:

```txt
shared:
- @angular/core
- @angular/common
- @angular/router
- rxjs
- shared/ui
```

Prefer a minimal runtime contract:

```ts
// exposed route module or standalone routes
export const remoteRoutes = [...]
```

Add fallback handling in the shell:

```txt
Remote load failure -> error boundary -> retry -> safe fallback screen
```

## Do Not

Avoid exposing unstable internal modules.

Avoid sharing arbitrary application state as a singleton.

Avoid letting each remote configure dependencies differently without governance.

Avoid shipping runtime federation without smoke tests and rollback strategy.

## Review Checklist

- [ ] The remote exposes a stable, documented surface.
- [ ] Shared dependency configuration is explicit.
- [ ] Version compatibility is understood.
- [ ] A fallback exists when loading fails.
- [ ] Smoke tests cover shell and remote integration.
- [ ] The runtime boundary is smaller than the application boundary it replaces.

## Expected Output

When this skill is used, the agent should:

1. Identify the remote runtime surface.
2. Review shared dependency policy and versioning.
3. Flag unsafe exposure or hidden coupling.
4. Define fallback and rollout behavior.
5. Recommend the smallest safe runtime contract.
