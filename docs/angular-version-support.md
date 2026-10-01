# Angular version coverage 🧭

<!-- docs:navigation:start -->
[Español](angular-version-support.es.md) · [Map](README.md) · [Home](../README.md)

<!-- docs:navigation:end -->

**Catalog coverage is not vendor support.** NgAutoPilot contains guidance for Angular 2 and 4–22, including legacy upgrade hops. This does not make unsupported Angular releases supported by Angular itself or certify your application.

## Pick your next step

1. Inspect `package.json`, the lockfile, and the workspace configuration.
2. Run the compatibility gate for the **installed version and intended target**.
3. Select one hop; validate before continuing. Angular 2 → 4 is the historical exception because there was no Angular 3 release.
4. Modernize only after the upgrade slice is stable.

| Starting point | Catalog route | What it means |
| --- | --- | --- |
| Angular 2–12 | Historical hops, workspace, RxJS, HttpClient, Ivy, i18n | Procedures for legacy work; not a promise of maintained dependencies |
| Angular 12–15 | Library, router, forms, Material and SSR satellites | Review the precise breaking changes |
| Angular 15–19 | Hops plus standalone, templates, Signals and runtime gates | Match API maturity to the detected version |
| Angular 20–21 | Dedicated hops and concern-first satellites | Verify target toolchain and public API contracts |
| Angular 21 → 22 | `skills/angular/upgrades/21-to-22/` | Preflight, breaking-change gate, orchestrator and post-upgrade evidence |
| Already Angular 22 | [Angular 22 guide](angular-22-support.md) | Select by concern and exact minor version |
| AngularJS / hybrid | `skills/angular/upgrades/angularjs/` | Separate staged migration, not an Angular major hop |

Use the [era map](angular-version-era-map.md) to locate folders and the [roadmap guide](angular-roadmap-guide.md) to select skills. Skills are instructions for an authorized coding agent, not executable source transformers.

## Toolchain: two different requirements

NgAutoPilot itself requires Node `>=24.0.0 <25` in this checkout. Your Angular application has its **own** requirements. For example, the official Angular 22.0.x matrix lists Node `^22.22.3 || ^24.15.0 || ^26.0.0`, TypeScript `>=6.0.0 <6.1.0`, and RxJS `^6.5.3 || ^7.4.0`. Node 24.0 satisfies this CLI's floor but **not** that Angular 22 floor.

Reviewed on 2026-10-01 against the [official compatibility matrix](https://angular.dev/reference/versions). Consult its current rows and [release support policy](https://angular.dev/reference/releases) rather than copying a range into an unrelated application.

## Stop conditions

- No skipping multiple majors in a single unvalidated change.
- No Angular 22 APIs recommended before version detection.
- No upgrade, modernization, remediation and optimization silently merged into one scope.
- Catalog presence, installation success and a green build are different kinds of evidence; application tests and actual host discovery remain necessary.
