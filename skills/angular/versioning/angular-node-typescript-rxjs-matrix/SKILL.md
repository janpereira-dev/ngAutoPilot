---
id: angular.versioning.angular-node-typescript-rxjs-matrix
name: Angular Node TypeScript RxJS Matrix
description: Check exact Angular toolchain ranges, historical CLI pairings, browser support and polyfills against the bundled official compatibility reference.
stack:
  - Angular
  - TypeScript
  - RxJS
category: versioning
status: stable
version: 0.11.0
owner: NgAutoPilot
triggers:
  - node typescript rxjs matrix
  - compatibility matrix
  - version gate
---

# Angular Node TypeScript RxJS Matrix

## Purpose

Determine whether the installed and target Angular toolchains satisfy the official compatibility ranges. Keep a compatible historical stack separate from a currently supported release.

Read [the version, browser and polyfill reference](references/angular-versions.md) for the exact matrix, Angular/CLI pairings before v9, browser Baseline dates and conditional polyfill setup. It contains the official table verified on 2026-10-25; recheck the source when making a new upgrade decision.

## When to Use

Use this skill when:

- Node, TypeScript or RxJS versions must be checked for an installed or target Angular minor;
- a pre-v9 application needs a separate Angular/CLI pairing;
- browser requirements or build/test polyfills affect an Angular compatibility decision.

## Do

- Detect installed Angular, CLI, TypeScript and RxJS from the owning package and lockfile; inspect local and CI Node versions, builders and peer constraints.
- Select the exact source row for the installed and target minor. For a minor absent from the table, verify its tagged or published packages and label that evidence separately.
- Intersect all required ranges. Distinguish declaration-only evidence from locked versions and report each mismatch as a blocker.
- Use the browser policy for the Angular major and inspect application targets and required browser journeys.
- Inspect build and test polyfills plus the application's zone-based or zoneless configuration before recommending changes.

Recommended workflow:

```txt
1. Record installed and target versions, exact source row and checked date.
2. Compare every toolchain version with its required ranges, including local and CI Node.
3. Check support status, pre-v9 CLI pairing, browser policy and polyfill mode.
4. Return blockers and the project's existing build, test and browser-validation commands.
```

## Do Not

- Do not treat historical compatibility as current Angular or Node security support.
- Do not relabel the official 22.0.x row as a verified 22.2.x row or widen `^26.0.0` to all future Node majors.
- Do not use NgAutoPilot's own Node requirement as the Angular application's runtime requirement.
- Do not add ZoneJS to a zoneless application just because an older polyfill example includes it.
- Do not perform an upgrade, dependency installation or change-detection migration as part of the compatibility decision alone.

## Review Checklist

- [ ] Installed and target minor, source row/tag and verification date are recorded.
- [ ] Node, TypeScript and RxJS satisfy all applicable ranges, or each blocker is explicit.
- [ ] Pre-v9 CLI pairing and historical support limits are considered when applicable.
- [ ] Browser policy, required browsers and build/test polyfill configuration are checked.
- [ ] Validation results distinguish completed checks from unavailable evidence.

## Expected Output

1. Installed and target Angular/CLI versions, support status and source row/tag.
2. Required versus detected Node, TypeScript and RxJS ranges, with local/CI differences.
3. Browser baseline and required polyfills for the actual application mode.
4. PASS, BLOCKED or UNVERIFIED decision with evidence and validation commands; route any authorized upgrade through `angular.versioning.angular-version-compatibility-gate`.
