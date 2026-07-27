---
id: angular.templates.extended-diagnostics-remediation
name: Angular Extended Diagnostics Remediation
description: >
  Fixes Angular Extended Diagnostics reported by the compiler by making the smallest safe template or type correction without changing policy or suppressing diagnostics.
stack:
  - Angular
  - TypeScript
category: templates
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - extended diagnostics remediation
  - angular diagnostic fix
  - NG8101
  - NG8113
  - template warning fix
compatibility:
  angular:
    min: "17"
    recommendedModern: "17+"
---

# Angular Extended Diagnostics Remediation

## Purpose

Use this skill to fix Angular Extended Diagnostics reported by the Angular compiler.

This skill focuses on correcting Angular template issues, not on configuring the global diagnostics policy.

## When to Use

Use this skill when the build, compiler, IDE, or CI reports diagnostics such as:

- `NG8101`
- `NG8102`
- `NG8103`
- `NG8104`
- `NG8105`
- `NG8106`
- `NG8107`
- `NG8108`
- `NG8109`
- `NG8111`
- `NG8113`
- `NG8114`
- `NG8115`
- `NG8116`
- `NG8117`
- `NG8021`

## When Not to Use

Do not use this skill to enable `strictTemplates` globally, change compiler policy, or suppress diagnostics.

## Do

Find the exact template expression reported by the compiler.

Apply the smallest safe correction.

Validate the semantic intent before changing nullability or bindings.

For standalone components, inspect `imports`.

For `skipHydrationNotStatic`, keep the attribute static.

For `deferTriggerMisconfiguration`, simplify or correct the trigger strategy.

## Do Not

Avoid suppressing diagnostics by default.

Avoid broad template rewrites.

Avoid changing business fallbacks casually.

## Review Checklist

- [ ] The diagnostic is fixed.
- [ ] The fix matches intended runtime behavior.
- [ ] Template and TypeScript types are aligned.
- [ ] No unrelated file changed.

## Expected Output

When this skill is used, the agent should:

1. Identify the reported diagnostic.
2. Apply the smallest safe correction.
3. Preserve behavior.
4. Validate the result.
5. Report remaining diagnostics.
