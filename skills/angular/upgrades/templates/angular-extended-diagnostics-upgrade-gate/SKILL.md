---
id: angular.upgrades.templates.angular-extended-diagnostics-upgrade-gate
name: Angular Extended Diagnostics Upgrade Gate
description: >
  Controls Angular Extended Diagnostics during framework upgrades so new or changed diagnostics do not turn a minor upgrade into an uncontrolled compile-time blocker.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - extended diagnostics upgrade gate
  - angular upgrade diagnostics
  - template upgrade blocker
  - diagnostics after upgrade
compatibility:
  angular:
    min: "17"
    recommendedModern: "17+"
---

# Angular Extended Diagnostics Upgrade Gate

## Purpose

Use this skill during Angular upgrades to control new or changed Extended Diagnostics without turning the upgrade into an uncontrolled quality-gate failure.

Angular may add or enable Extended Diagnostics in minor versions. This means an upgrade can surface new warnings in existing code.

## When to Use

Use this skill before and after Angular upgrades when diagnostics may change.

## Do

Capture a pre-upgrade diagnostics baseline.

Inspect `angularCompilerOptions`, especially `strictTemplates` and `extendedDiagnostics`.

Avoid `defaultCategory: error` during the upgrade unless the baseline is already stable.

Classify post-upgrade diagnostics as:

- must fix before merge
- can remain warning
- follow-up PR
- temporary suppress with justification

## Do Not

Avoid mixing full modernization into the upgrade PR.

Avoid broad suppressions to hide new compiler feedback.

## Review Checklist

- [ ] The baseline is recorded.
- [ ] New diagnostics are classified.
- [ ] Blocking diagnostics are fixed or justified.
- [ ] No broad modernization was mixed into the upgrade.

## Expected Output

When this skill is used, the agent should:

1. Capture the diagnostics baseline.
2. Classify new warnings and errors.
3. Keep the upgrade scope bounded.
4. Avoid brittle severity policy.
5. Produce a clear follow-up backlog.

