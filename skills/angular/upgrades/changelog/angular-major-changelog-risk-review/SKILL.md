---
id: angular.upgrade.changelog.angular-major-changelog-risk-review
name: Angular Major Changelog Risk Review
description: >
  Review Angular minor and patch changelog entries for the current major version before continuing to the next major upgrade. Use when the project has just upgraded to an Angular major version, is about to leave that major version, or needs a patch/minor baseline decision before the next major hop. Especially important for Angular 16 before Angular 17 because changelog entries can affect ngcc removal, View Engine libraries, SSR, hydration, Router, Forms, TransferState, Service Worker, Signals, NgOptimizedImage, and ES2022 output.
stack:
  - Angular
  - TypeScript
category: changelog
status: stable
version: 0.5.3
owner: NgAutoPilot
triggers:
  - Angular changelog review
  - patch baseline review
  - minor baseline review
  - Angular 16 to 17 risk review
compatibility:
  angular:
    min: "16"
---

# Angular Major Changelog Risk Review

## Purpose

Review Angular minor and patch changelog entries for the current major version before continuing to the next major upgrade.

This skill identifies hidden risks that are not always fully represented in the Angular Update Guide.

## When to Use

- The project has just upgraded to a new Angular major version.
- The project is about to move from one Angular major to the next.
- The current major has important minor or patch behavior changes.
- The project uses Angular Material, SSR, hydration, TransferState, Service Worker, Router, custom DI, dynamic components, or Angular libraries.
- The validation gate needs stronger evidence before continuing.

## When Not to Use

- The next hop is blocked by a basic build failure already.
- The current Angular major is not yet successfully installed.
- The repository cannot run any validation command.
- The request is only to summarize a changelog for humans without repository impact analysis.

## Required Inputs

- `package.json`
- lock file
- current Angular version
- current Angular CLI version
- current Angular Material/CDK version
- TypeScript version
- RxJS version
- Zone.js version
- Node.js version
- `angular.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.spec.json`
- SSR files
- Service Worker config
- current build/test/lint/e2e scripts
- custom library projects
- postinstall scripts
- hydration usage
- standalone bootstrap usage
- signals usage
- router tests
- service worker usage
- Angular Material usage
- ngUpgrade usage
- custom build tooling

## Default Policy

Before leaving a major version, prefer stabilizing on the latest patch or minor of that major unless there is a documented blocker.

For Angular 16, prefer the latest 16.2.x patch baseline before Angular 17 unless a blocker is documented.

## Angular 16 Risk Areas

### 1. ngcc and View Engine removal

Search:

- `ngcc`
- `__ivy_ngcc__`
- `metadata.json`
- `postinstall`
- `View Engine`

Gate behavior:

- Critical View Engine dependency = `FAIL_BLOCK_NEXT_HOP`
- Unknown Angular library compatibility = `FAIL_BLOCK_NEXT_HOP`

Route to:

`skills/angular/upgrades/libraries/angular-ngcc-view-engine-removal-v16/SKILL.md`

### 2. Angular Package Format and ES2022 output

Search:

- `fesm2015`
- `fesm2020`
- `esm2015`
- `esm2020`
- `es2020`
- `babel`
- `webpack`
- `jest`
- `ts-jest`
- `karma`
- `terser`
- `custom builder`

Gate behavior:

- Custom build tooling incompatible with ES2022 = `FAIL_BLOCK_NEXT_HOP`

### 3. Signals and reactive context

Search:

- `signal(`
- `computed(`
- `effect(`
- `toSignal(`
- `toObservable(`
- `takeUntilDestroyed(`
- `DestroyRef`
- `assertInInjectionContext`
- `runInInjectionContext`

Gate behavior:

- Signals used in production + failing reactive behavior tests = `FAIL_BLOCK_NEXT_HOP`

### 4. Hydration and SSR

Search:

- `provideClientHydration`
- `withNoHttpTransferCache`
- `withHttpTransferCacheOptions`
- `provideServerRendering`
- `renderApplication`
- `renderModule`
- `bootstrapApplication`
- `server.ts`
- `main.server.ts`
- `TransferState`

Gate behavior:

- SSR/hydration app without server validation = `FAIL_BLOCK_NEXT_HOP`
- Hydration mismatch unresolved = `FAIL_BLOCK_NEXT_HOP`

### 5. HTTP fetch backend and HTTP cache

Search:

- `provideHttpClient`
- `withFetch`
- `HttpClient`
- `HttpBackend`
- `FetchBackend`
- `withInterceptors`
- `withInterceptorsFromDi`
- `TransferHttpCacheModule`

Gate behavior:

- HTTP fetch backend used + SSR/test instability = `FAIL_BLOCK_NEXT_HOP`

### 6. Router behavior and RouterTestingHarness

Search:

- `RouterTestingHarness`
- `RouterEvent`
- `NavigationSkipped`
- `NavigationEnd`
- `NavigationCancel`
- `ActivatedRoute`
- `createUrlTree`
- `canceledNavigationResolution`
- `named outlets`
- `location.go`
- `SpyLocation`

Gate behavior:

- Router tests failing due to invalid `ActivatedRoute` mocks = `FAIL_BLOCK_NEXT_HOP`
- `NavigationSkipped` unhandled in critical routing logic = `PASS_WITH_WARNINGS` or `FAIL_BLOCK_NEXT_HOP`

### 7. Forms behavior

Search:

- `FormGroup`
- `FormArray`
- `FormControl`
- `reset(`
- `patchValue(`
- `setValue(`
- `Validators`
- `AsyncValidatorFn`

Gate behavior:

- Critical forms with `reset(null)` behavior untested = `FAIL_BLOCK_NEXT_HOP`

### 8. `ngTemplateOutletContext` strictness

Search:

- `ngTemplateOutletContext`
- `*ngTemplateOutlet`
- `let-`

Gate behavior:

- Template context typing errors unresolved = `FAIL_BLOCK_NEXT_HOP`

### 9. Dynamic component creation and factory resolver removal

Search:

- `ComponentFactoryResolver`
- `resolveComponentFactory`
- `ViewContainerRef.createComponent`
- `RouterOutletContract`
- `OutletContext`

Gate behavior:

- Custom dynamic component loader unresolved = `FAIL_BLOCK_NEXT_HOP`

Route to:

`skills/angular/upgrades/components/angular-create-component-projectable-nodes-v19/SKILL.md`

### 10. TransferState migration

Search:

- `TransferState`
- `makeStateKey`
- `StateKey`
- `BrowserTransferStateModule`

Gate behavior:

- TransferState app with unresolved imports or modules = `FAIL_BLOCK_NEXT_HOP`

### 11. Platform location and tests

Search:

- `BrowserPlatformLocation`
- `MockPlatformLocation`
- `PlatformLocation`
- `window.history`
- `Location.getState`

Gate behavior:

- Location/router tests failing with unknown platform location assumptions = `FAIL_BLOCK_NEXT_HOP`

### 12. Service Worker behavior

Search:

- `ServiceWorkerModule.register`
- `provideServiceWorker`
- `SwUpdate`
- `versionUpdates`
- `ngsw-config.json`

Gate behavior:

- PWA-critical app without service worker validation = `FAIL_BLOCK_NEXT_HOP`

### 13. NgOptimizedImage

Search:

- `ngSrc`
- `ngSrcset`
- `priority`
- `fill`

Gate behavior:

- NgOptimizedImage critical usage untested = `PASS_WITH_WARNINGS`
- Broken image rendering = `FAIL_BLOCK_NEXT_HOP`

### 14. Input transforms and required inputs

Search:

- `@Input({`
- `required:`
- `transform:`
- `booleanAttribute`
- `numberAttribute`
- `input(`

Gate behavior:

- Required input errors unresolved = `FAIL_BLOCK_NEXT_HOP`
- Input transform library compatibility unknown = `PASS_WITH_WARNINGS` or `FAIL_BLOCK_NEXT_HOP`

### 15. ngUpgrade / AngularJS hybrid

Search:

- `downgradeComponent`
- `downgradeInjectable`
- `UpgradeModule`
- `@angular/upgrade/static`

Gate behavior:

- Hybrid app with unvalidated downgraded components = `FAIL_BLOCK_NEXT_HOP`

## Changelog Review Procedure

1. Detect current exact Angular version.
2. Detect target patch or minor baseline within the same major.
3. Identify changelog entries between current and baseline.
4. Classify entries by package.
5. Search the repository for affected APIs.
6. Route to specialized skills if needed.
7. Run available validation commands.
8. Produce a changelog risk report.
9. Decide whether the next major hop is allowed.

## Do

- Stabilize on the latest patch or minor baseline for the current major when no blocker exists.
- Search the repository for APIs and behaviors referenced by changelog entries.
- Route library, SSR, router, forms, and build-risk findings to the appropriate specialized skills.
- Keep the current major baseline and the next hop decision explicit.

## Do Not

- Do not create one skill per patch release.
- Do not skip changelog review just because the major upgrade already succeeded.
- Do not treat a patch baseline as optional when critical risk exists.
- Do not continue to the next major with unresolved library or runtime blockers.

## Review Checklist

- [ ] Current version is known.
- [ ] Patch/minor baseline is known.
- [ ] Changelog entries are classified by risk.
- [ ] Repository usage of affected APIs is searched.
- [ ] Specialized follow-up skills are selected when needed.
- [ ] Validation commands have run.
- [ ] Gate decision is explicit.

## Patch Baseline Policy

For Angular 16, prefer Angular 16.2.x latest patch before Angular 17.

Do not remain on 16.0.x unless the blocker is documented, validation passes, and the next hop gate accepts the risk.

## Validation

Run only existing commands:

- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run e2e`
- `ng build --configuration production`
- `npm run build:ssr`
- `npm run prerender`
- `npm run serve:ssr`
- `ng build <library-name>`

## Validation Gate

Use `FAIL_BLOCK_NEXT_HOP` when:

- current Angular patch or minor baseline is unknown
- project remains on an early patch without documented reason
- build fails
- tests fail
- production build fails
- SSR or hydration behavior is unvalidated in an SSR app
- View Engine or ngcc dependency remains
- Angular library compatibility is unknown
- Service Worker behavior is unvalidated in a PWA-critical app
- Router tests fail due to changed behavior
- critical forms behavior is untested or broken
- dynamic component creation is unresolved
- TransferState migration is unresolved
- custom build tooling cannot handle ES2022 output
- ngUpgrade hybrid behavior is unvalidated
- Material or MDC visual risks remain unresolved

Use `PASS_WITH_WARNINGS` when:

- project is not on the latest patch but blocker is documented
- non-critical changelog risks remain
- optional modern APIs are not adopted
- warnings are documented with follow-up tasks

## Expected Output

1. Current version summary.
2. Patch/minor baseline summary.
3. Changelog risk areas.
4. Repository findings.
5. Validation result.
6. Gate decision.

## Exit Criteria

- Current Angular exact version is known.
- Target patch/minor baseline is known.
- Relevant changelog entries are classified.
- Repository usage of affected APIs is searched.
- Specialized follow-up skills are selected when needed.
- Available validation commands have been run.
- Production build has been validated when applicable.
- SSR, PWA, and library validation have been run when applicable.
- Changelog risk is documented.
- Gate result is explicit.
- Next major hop is allowed or blocked explicitly.
