---
id: angular.versioning.angular-version-compatibility-gate
name: Angular Version Compatibility Gate
description: >
  Determines Angular compatibility across Node.js, TypeScript, RxJS, Angular CLI and browser support before planning or executing upgrade hops.
stack:
  - Angular
  - TypeScript
  - RxJS
category: versioning
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - angular version
  - angular compatibility
  - node typescript rxjs compatibility
  - angular upgrade
  - ng update
  - angular hop
  - angular cli version
  - typescript range
  - rxjs range
compatibility:
  angular:
    min: "2"
    recommendedDetection: "package.json"
---

# Angular Version Compatibility Gate

## Purpose

Use this skill to determine whether an Angular project is compatible with a target Angular version based on its required Node.js, TypeScript, RxJS, Angular CLI and browser support constraints.

This skill is a compatibility gate. It does not perform the upgrade by itself.

It must be used before planning or executing any Angular version upgrade, especially when moving between major versions.

## When to Use

Use this skill when the task involves:

- Detecting the valid runtime and tooling range for an Angular version.
- Planning an Angular upgrade hop.
- Validating whether the current project stack can move to a target Angular version.
- Checking Node.js, TypeScript or RxJS compatibility.
- Reviewing `package.json`, lockfiles, `.nvmrc`, `.node-version`, `tsconfig`, Angular CLI version or CI runtime.
- Deciding whether a project can safely run `ng update`.
- Detecting unsupported Angular versions.
- Planning multi-hop upgrades such as Angular 12 → 13 → 14 → 15.
- Validating pre-v9 projects where Angular and Angular CLI versions were not synchronized.

## When Not to Use

Do not use this skill for:

- Refactoring Angular code.
- Migrating Angular Material APIs.
- Migrating RxJS operators.
- Replacing deprecated Angular APIs.
- Adopting standalone components, signals, control flow or zoneless APIs.
- Changing application architecture.
- Updating dependencies blindly.
- Installing the latest Node.js, TypeScript or RxJS without checking the matrix.

For those cases, route to a specific upgrade satellite or modernization skill.

Angular 22 specific routing:

- Route Angular 21 -> 22 upgrade work to `skills/angular/upgrades/21-to-22/angular-21-to-22-upgrade-orchestrator/SKILL.md`.
- Route post-hop Angular 22 concerns to the narrow `angular-v22-*` satellite by domain.
- Verify production-ready vs experimental status from official Angular sources before recommending Signal Forms, Angular Aria, resources, MCP, or WebMCP.

## Required Inputs

The agent must collect these inputs before making a compatibility decision:

```txt
Current Angular version:
Target Angular version:
Current Angular CLI version:
Current Node.js version:
Current TypeScript version:
Current RxJS version:
Package manager:
Lockfile type:
Operating system:
CI Node.js version:
Uses Angular Material:
Uses SSR:
Uses Angular Universal:
Uses ngUpgrade / AngularJS:
Uses custom builders:
Uses Nx:
Uses monorepo:
```

If any critical version is missing, inspect the repository before deciding.

Primary files to inspect:

```txt
package.json
package-lock.json
yarn.lock
pnpm-lock.yaml
angular.json
nx.json
workspace.json
tsconfig.json
tsconfig.base.json
.nvmrc
.node-version
.tool-versions
.github/workflows/**
.gitlab-ci.yml
Dockerfile
```

## Procedure

1. Detect current project versions.
2. Normalize the Angular version to the compatibility row.
3. Validate current compatibility.
4. Validate target compatibility.
5. Identify required bridge versions.
6. Route to the minimum necessary satellite skills.
7. Produce a compatibility decision and validation plan.

## Do

- Use direct evidence from files.
- Keep compatibility decisions separate from code modernization.
- Prefer one Angular major per hop.
- Route AngularJS, Ivy, ngcc, SSR, router, forms, testing, Material, build and zone risks to the corresponding satellite skill.
- Return exact blockers and exact required ranges.
- Validate before recommending the next hop.

## Do Not

- Do not assume the latest Node.js, TypeScript or RxJS version is valid for a given Angular version.
- Do not upgrade several Angular majors at once without explicit risk acceptance.
- Do not mix compatibility analysis with refactoring.
- Do not invent migration commands.
- Do not ignore CI runtime differences.

## Review Checklist

- [ ] Current Angular version is detected.
- [ ] Target Angular version is detected.
- [ ] Node.js, TypeScript and RxJS ranges are checked.
- [ ] Angular CLI compatibility is checked when relevant.
- [ ] Browser support constraints are considered.
- [ ] Required satellite skills are identified.
- [ ] Blocking issues and warnings are explicit.
- [ ] Validation commands are listed.

## Expected Output

When this skill is used, the agent should:

1. Report detected Angular, TypeScript, RxJS, Node and tooling versions when available.
2. Select a compatibility profile.
3. List APIs that are safe to use.
4. List APIs to avoid for this project.
5. Provide a compatibility decision and the next safe hop.

## Exit Criteria

- Compatibility is explicit enough to decide whether the next hop is allowed.
- Required satellite skills are identified when the target version needs them.
- The skill does not perform any migration work.
