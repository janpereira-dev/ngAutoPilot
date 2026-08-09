---
id: angular.templates.extended-diagnostics-governance
name: Angular Extended Diagnostics Governance
description: >
  Configures and governs Angular Extended Diagnostics with a progressive severity policy so template correctness issues are surfaced without turning upgrades into brittle compile blockers.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.6.0
owner: NgAutoPilot
triggers:
  - extended diagnostics governance
  - angular extended diagnostics
  - strict templates
  - diagnostics warning error suppress
  - template diagnostics policy
  - extended diagnostics
  - template diagnostics
  - ng810x
compatibility:
  angular:
    min: "17"
    recommendedModern: "17+"
---

# Angular Extended Diagnostics Governance

## Purpose

Use this skill to configure, govern, and progressively enforce Angular Extended Diagnostics in an Angular codebase.

Extended Diagnostics detect Angular template patterns that are technically valid but likely incorrect, confusing, risky, or misleading.

This skill focuses on configuration strategy, severity policy, and safe adoption.

## When to Use

Use this skill when:

- enabling `strictTemplates`
- configuring `angularCompilerOptions.extendedDiagnostics`
- moving diagnostics from `warning` to `error`
- defining CI quality gates for Angular templates
- cleaning template correctness issues before or after an Angular upgrade
- standardizing Extended Diagnostics across apps, libraries, or monorepos

## When Not to Use

Do not use this skill for:

- general ESLint style rules
- pure TypeScript strictness issues outside Angular templates
- formatting-only changes
- blind suppression without root-cause analysis
- large refactors unrelated to diagnostics

## Do

Inspect:

- Angular version
- tsconfig files
- `angularCompilerOptions`
- `strictTemplates`
- `strictNullChecks`
- CI/build commands

Prefer `warning` during discovery and migration.

Promote to `error` only when the team has cleaned the baseline or explicitly accepts blocking builds.

Use `suppress` only with a written justification.

## Do Not

Avoid `"defaultCategory": "error"` during upgrades when new diagnostics may appear in minor versions.

Avoid mass suppressions.

Avoid mixing diagnostics policy with general lint style policy.

## Review Checklist

- [ ] `strictTemplates` status is known.
- [ ] Extended diagnostics are configured explicitly.
- [ ] Severity decisions are justified.
- [ ] CI/build impact is understood.

## Expected Output

When this skill is used, the agent should:

1. Inspect compiler configuration.
2. Classify current diagnostics policy.
3. Recommend a safe severity strategy.
4. Avoid broad suppressions.
5. Summarize the configuration decisions.
