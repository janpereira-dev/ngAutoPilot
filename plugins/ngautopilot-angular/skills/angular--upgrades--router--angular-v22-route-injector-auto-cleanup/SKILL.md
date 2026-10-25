---
id: angular.upgrades.router.angular-v22-route-injector-auto-cleanup
name: Angular v22 Route Injector Auto Cleanup
description: >
  Evaluate version-specific route injector cleanup, including stable withAutoCleanupInjectors since Angular 22.2 and the deprecated experimental name. For Angular 22 projects and 21-to-22 upgrade planning.
stack:
  - Angular
  - TypeScript
category: router
status: stable
version: 0.11.0
owner: NgAutoPilot
triggers:
  - withAutoCleanupInjectors
  - withExperimentalAutoCleanupInjectors
  - route injector
  - cleanup
  - Angular v22 Route Injector Auto Cleanup
  - Router
  - Angular 22
compatibility:
  angular:
    min: "22"
---

# Angular v22 Route Injector Auto Cleanup

## Purpose

Evaluate version-specific route injector cleanup, including stable withAutoCleanupInjectors since Angular 22.2 and the deprecated experimental name.

Keep the work concern-first: this skill handles one risk area and does not replace the Angular 21 to 22 hop orchestrator.

## When to Use

- The task concerns route-level provider disposal, custom route reuse or migration from the experimental cleanup name.
- The project is on Angular 22 or planning the Angular 22 hop.
- A narrower concern-first skill is better than a generic v22 baseline skill.

## Do Not Use When

- The project version is unknown and the compatibility router has not run.
- The task is unrelated to this risk area.
- The user only needs a general Angular explanation.

## Why This Matters

Angular 22 changes router behavior enough that agents need a narrow checklist instead of a generic v22 bucket. The goal is to make the risk visible, testable, and reviewable.

## Inputs Expected

- package.json
- lockfile
- Angular version evidence
- angular.json or workspace config
- tsconfig files
- available build/test/lint scripts
- route configuration
- guards/resolvers
- RouteReuseStrategy
- route params/data consumers

## Version Scope

Angular 22.x and later where this Angular 22 behavior is relevant.

## Angular 22.2 evidence and procedure

For Angular 22.2+, use `withAutoCleanupInjectors` (stable since 22.2). The old `withExperimentalAutoCleanupInjectors` name is deprecated. For 22.0/22.1, inspect that version's experimental contract and do not import the stable name.

- This is opt-in: inspect `provideRouter` and existing behavior before enabling it.
- A custom `RouteReuseStrategy` must return true from `shouldDestroyInjector` for routes to dispose.
- When storing handles, implement `retrieveStoredRouteHandles` so retained routes keep their injectors alive.
- Test deactivate/reactivate, detach/reattach, eviction and service teardown. Verify retained handles remain usable and evicted handles cannot reattach.
- Route final handle disposal to the detached-handle skill; do not destroy injectors through private fields.

Source: https://angular.dev/api/router/withAutoCleanupInjectors (reviewed 2026-10-23).

## Procedure

1. Inspect the inputs and confirm the risk is present.
2. Read the exact Angular 22 documentation or changelog entry before making API claims.
3. Make the smallest targeted change or produce a concrete audit result.
4. Route adjacent concerns to their own satellite instead of expanding scope.
5. Record validation commands and unresolved follow-ups.

## Do

- Verify Angular version and feature status before changing code.
- Prefer the smallest reversible change that resolves this specific risk.
- Keep upgrade, modernization, testing, and education responsibilities separate.
- Capture commands, warnings, and unresolved risks in the final report.

## Do Not

- Do not invent APIs, versions, commands, or dependency requirements.
- Do not treat roadmap or experimental APIs as stable unless official Angular sources say so.
- Do not hide failed validation or convert blockers into vague follow-ups.
- Do not broaden this satellite into a cross-domain refactor.

## Validation Checklist

- Run only validation commands that exist in the target repository.
- Run TypeScript/template compilation or production build when the change affects Angular code.
- Run unit tests for affected behavior when a test script exists.
- Run lint if the repository exposes a lint script.

## Review Checklist

- [ ] Version evidence is recorded.
- [ ] Official Angular source or repo-local source was checked for the claim.
- [ ] The selected change is scoped to this skill.
- [ ] Adjacent risks are routed to separate skills.
- [ ] Validation outcome is PASS, FAIL, or SKIPPED with reason.

## Exit Criteria

- The risk is resolved, explicitly not applicable, or blocked with evidence.
- The change is narrow enough for a focused review.
- Validation results are documented.

## Risks and Failure Modes

- Using a v22 API without verifying project compatibility.
- Turning a targeted satellite into a broad refactor.
- Missing runtime-only behavior when compile checks pass.

## Examples

- Use this skill to review `withExperimentalAutoCleanupInjectors` in an Angular 22 migration.
- Do not use it to perform the entire 21-to-22 dependency hop.

## Expected Output

1. A short summary of the inspected risk.
2. Files or configuration areas reviewed.
3. Changes made or a clear no-change decision.
4. Validation commands and results.
5. Remaining risks or follow-up skills, if any.

## References

- Angular v22 announcement: https://blog.angular.dev/announcing-angular-v22-c52bb83a4664
- Angular roadmap: https://angular.dev/roadmap
- Angular changelog: https://github.com/angular/angular/blob/main/CHANGELOG.md
- NgAutoPilot versioning gates: skills/angular/versioning/angular-version-gates/SKILL.md
