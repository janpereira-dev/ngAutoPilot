---
id: angular.performance.performance-orchestrator
name: Angular Performance Orchestrator
description: >
  Selects the smallest Angular performance skill based on symptoms, available code, detected Angular version, and measured evidence.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.4.0
owner: NgAutoPilot
triggers:
  - Angular performance
  - performance diagnosis
  - slow Angular app
  - performance skill selection
  - rendering issue
compatibility:
  angular:
    min: "2"
    recommended: "17+"
    currentSafe: "20+"
---

# Angular Performance Orchestrator

## Purpose

Use this skill to route an Angular performance task to the smallest applicable performance skill. The goal is to diagnose first, select the correct pattern for the detected Angular version, and avoid mixing unrelated optimizations.

## Compatibility

Use version-aware routing:

- Angular 2-14: prefer legacy-compatible patterns such as `*ngFor`, `trackBy`, NgModules, `async`, pure pipes, and `takeUntil`.
- Angular 15-16: allow standalone patterns when the project already uses them; signals are available from Angular 16.
- Angular 17-19: prefer modern control flow, `@for`, `@defer`, standalone routes, and signals when they fit.
- Angular 20+: avoid introducing `NgFor` for new code; prefer `@for` with `track`.

Never recommend syntax unsupported by the detected project version.

## When to Use

Use this skill when:

- The user reports Angular performance issues but the root cause is unclear.
- The task includes multiple possible symptoms such as slow rendering, large bundles, laggy inputs, or duplicated requests.
- The agent must decide which performance skill to apply.
- The project Angular version is unknown.
- A performance review needs triage before refactoring.

## Do

Select the smallest skill based on the dominant symptom:

```txt
rendering or excessive checks -> angular.performance.change-detection-optimization
explicit OnPush adoption -> angular.performance.onpush-change-detection
large or unstable lists -> angular.performance.list-rendering-optimization
missing trackBy or unstable identity -> angular.performance.trackby-for-lists
complex HTML or repeated template work -> angular.performance.template-logic-optimization
expensive pure transformations -> angular.performance.pipes-and-memoization
slow initial load or large bundle -> angular.performance.lazy-loading-strategy
duplicated HTTP calls or RxJS leaks -> angular.performance.rxjs-performance
unclear evidence -> angular.performance.measure-before-optimizing
broad review -> angular.performance.performance-audit
```

When version evidence is missing, inspect `package.json`, lockfiles, `angular.json`, templates, and component code before recommending a modern Angular-only pattern.

## Do Not

Avoid applying every performance pattern at once:

```txt
Add OnPush, rewrite lists, introduce signals, add @defer, replace RxJS, and restructure routes in one pass.
```

Avoid optimizing based only on intuition when measurement or code evidence is available.

Avoid recommending `@for`, `@defer`, signals, or `takeUntilDestroyed` as mandatory without checking version compatibility.

## Review Checklist

- [ ] The Angular version or compatibility profile is identified.
- [ ] The dominant symptom is classified before selecting a skill.
- [ ] The selected skill is the smallest useful skill.
- [ ] Unsupported syntax is avoided.
- [ ] The recommendation separates diagnosis, action, risk, and follow-up.
- [ ] Broad refactors are deferred unless the evidence justifies them.

## Expected Output

When this skill is used, the agent should:

1. Identify the project version and performance symptom.
2. Select one primary performance skill and optional secondary skills.
3. Explain why the selected skill applies.
4. Recommend the smallest safe next action.
5. Document compatibility risks and future migration options.
