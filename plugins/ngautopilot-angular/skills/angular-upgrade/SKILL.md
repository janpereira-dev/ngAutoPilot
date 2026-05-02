---
name: angular-upgrade
description: Use this skill when planning, reviewing, or executing Angular upgrades major-by-major with compatibility gates, risk satellites, and validation before moving to the next hop.
disable-model-invocation: false
---

# NgAutoPilot Angular Upgrade

Use this skill when the task involves upgrading Angular, Angular CLI, Angular Material, RxJS, TypeScript, Node.js, or Angular workspace configuration.

## Workflow

1. Detect current Angular, CLI, Node.js, TypeScript, and RxJS versions.
2. Identify the target Angular version.
3. Plan upgrades major-by-major.
4. Do not skip compatibility gates.
5. Separate upgrade hops from modernization.
6. For each hop, detect required satellites:
   - workspace and CLI changes
   - RxJS bridge
   - HttpClient migration
   - Ivy, View Engine, and ngcc
   - Angular Material MDC
   - standalone compatibility
   - SSR and hydration
   - testing behavior changes
   - router changes
   - forms changes
7. Validate before proposing the next hop.

## Hard rules

- One hop upgrades the version.
- One satellite fixes one concrete risk.
- Modernization happens after the hop is stable.
- Do not combine Angular upgrade, Material migration, test rewrite, and architecture refactor in the same change unless explicitly requested.
- Do not invent Angular compatibility data. Verify from project files and official version constraints.

## Output

Return:

1. Current stack.
2. Target stack.
3. Next safe hop.
4. Required satellites.
5. Blocking risks.
6. Commands to validate.
7. Suggested PR split.
