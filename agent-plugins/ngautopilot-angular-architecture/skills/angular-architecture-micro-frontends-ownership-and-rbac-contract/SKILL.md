---
name: angular-architecture-micro-frontends-ownership-and-rbac-contract
description: "Reviews ownership, permissions, and role-based access control for Angular micro-frontends in Nx monorepos, focusing on team responsibility, route access, remote boundaries, and least-privilege policy."
license: MIT
metadata:
  ngautopilot-id: "angular.architecture.micro-frontends-ownership-and-rbac-contract"
  ngautopilot-source: "skills/angular/architecture/micro-frontends-ownership-and-rbac-contract/SKILL.md"
  ngautopilot-version: "0.5.3"
---


# Micro-frontends Ownership and RBAC Contract

## Purpose

Use this skill to review ownership and RBAC for Angular micro-frontends.

Micro-frontends require clear responsibility and explicit access control. Each remote should have an owner, and each route or capability should respect least privilege. This keeps the architecture governable when several teams contribute to the same frontend platform.

The core rule is simple:

```txt
Ownership without permissions is incomplete.
Permissions without ownership are ungoverned.
```

## When to Use

Use this skill when:

- multiple teams own different remotes
- route access must be restricted
- shell or remote permissions need governance
- platform ownership is unclear
- audits need to map team boundaries to UI capabilities

## Do

Document ownership:

```txt
Remote:
Team:
Domain:
Primary contact:
Backup contact:
Release owner:
```

Document RBAC policy:

```txt
Route:
Allowed roles:
Denied roles:
Fallback:
Audit trail:
```

Keep permission checks at the boundary:

```txt
Shell gate -> route access
Remote gate -> capability access
Domain gate -> business permission
```

## Do Not

Avoid ambiguous ownership.

Avoid granting broad access because it is easier than policy design.

Avoid placing business permission logic in the shell if the domain owns it.

Avoid duplicating access rules without a clear source of truth.

## Review Checklist

- [ ] Every remote has an owner.
- [ ] Routes have access rules where needed.
- [ ] RBAC is least-privilege by default.
- [ ] Fallbacks for denied access are defined.
- [ ] Permission checks have a clear source of truth.
- [ ] Ownership is operationally meaningful, not just documented.

## Expected Output

When this skill is used, the agent should:

1. Map remotes to owners.
2. Review route and capability access rules.
3. Flag unclear or overly broad permissions.
4. Define boundary checks at shell and remote levels.
5. Recommend a least-privilege governance model.
