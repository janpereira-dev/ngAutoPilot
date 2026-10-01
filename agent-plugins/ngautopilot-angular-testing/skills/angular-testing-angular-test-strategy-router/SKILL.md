---
name: angular-testing-angular-test-strategy-router
description: "Route Angular testing work to Vitest, Jest, or Karma based on the current project and migration goals."
license: MIT
metadata:
  ngautopilot-id: "angular.testing.angular-test-strategy-router"
  ngautopilot-source: "skills/angular/testing/angular-test-strategy-router/SKILL.md"
  ngautopilot-version: "0.10.0"
---


# Angular Test Strategy Router

## Purpose

Choose a testing path that fits the existing Angular project. Keep a local test fix separate from a deliberate runner migration.

## When to Use

- The team needs to choose or migrate between Vitest, Jest, and Karma.
- The current runner or async testing model is unclear.
- A proposed testing change depends on Angular, Zone.js, or runner compatibility.

For a single failing assertion in a known runner, use its focused testing guidance rather than reopening the runner decision.

## Do

Inspect the resolved Angular version, package and lockfile, test scripts, runner configuration, setup files, and representative specs. Record whether the suite depends on Zone.js, runner-specific mocks, snapshots, or Angular async helpers.

For a local fix, preserve the runner and use its existing assertion and mock APIs. For an explicitly requested migration, verify the target's compatibility and list the affected setup, test helpers, reporting, and CI integration before changing configuration.

Choose one owner of virtual time per test: the runner's fake timers, Angular async helpers where supported, or RxJS `TestScheduler`. Check the installed setup before recommending a helper. Do not layer several clock mechanisms together to make a test pass.

For timed or concurrent streams, require tests of the public temporal contract: boundaries, debounce reset, obsolete work, cleanup, and continued operation after an error. Route Jest examples to the existing Jest skill; do not install Jest into a Vitest or Karma project solely to copy an example.

## Do Not

- Do not replace the runner just because another runner is newer.
- Do not prescribe Jest mock syntax for every Angular project.
- Do not mix a runner migration with an unrelated Angular major-version hop.
- Do not count compilation or structural skill validation as proof that the target suite runs.

## Review Checklist

- [ ] Resolved Angular and runner versions, configuration, and async setup are known.
- [ ] A local fix or a deliberate migration has been selected explicitly.
- [ ] Existing test conventions are preserved unless migration is requested.
- [ ] Each async test has one clock owner and a cleanup path.
- [ ] Validation uses available project scripts and records unavailable checks.

## Expected Output

State the selected runner path and why it fits the project. For a fix, identify the focused testing guidance and the check to run. For a migration, describe compatibility evidence, setup changes, representative suite results, and any remaining blockers. Do not imply that a recommended migration has already been executed.
