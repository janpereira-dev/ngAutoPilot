---
name: angular-architecture-micro-frontends-dependency-sharing-policy
description: "Reviews shared dependency policy for Angular micro-frontends in Nx monorepos, focusing on singleton control, version alignment, bundle duplication risk, and shared library boundaries."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.micro-frontends-dependency-sharing-policy"
  ngautopilot-source: "skills/angular/architecture/micro-frontends-dependency-sharing-policy/SKILL.md"
  ngautopilot-version: "0.6.0"
---


# Micro-frontends Dependency Sharing Policy

## Purpose

Use this skill to review shared dependency policy for Angular micro-frontends.

Runtime composition only stays maintainable when shared dependencies are intentionally selected, version-aligned, and governed. This skill determines what should be shared, what should remain isolated, and how to prevent bundle duplication or hidden coupling.

The core rule is simple:

```txt
Share less than you think. Share only what is truly transversal.
```

## When to Use

Use this skill when:

- Module Federation shared configuration needs review
- singleton dependencies may conflict
- bundle duplication is a concern
- remotes use shared libraries inconsistently
- shared dependency governance is unclear

## Do

Keep the shared set small:

```txt
Typically shared:
- @angular/core
- @angular/common
- @angular/router
- rxjs
- shared/ui
- design-system
```

Treat domain-specific code as isolated by default.

Prefer explicit version alignment for singleton candidates.

Review bundle impact before sharing large libraries.

## Do Not

Avoid sharing arbitrary app state through dependency config.

Avoid turning every dependency into a singleton.

Avoid sharing domain services across remotes.

Avoid letting bundle convenience override architectural clarity.

## Review Checklist

- [ ] The shared dependency set is intentionally small.
- [ ] Singleton candidates have a reason to be shared.
- [ ] Domain-specific libraries remain isolated.
- [ ] Version alignment is reviewed.
- [ ] Bundle duplication risk is understood.
- [ ] Shared configuration is documented and enforced.

## Expected Output

When this skill is used, the agent should:

1. Identify dependencies that are candidates for sharing.
2. Flag over-sharing or bundle bloat risk.
3. Recommend a minimal shared set.
4. Separate transversal libraries from domain libraries.
5. Produce a dependency sharing policy.
