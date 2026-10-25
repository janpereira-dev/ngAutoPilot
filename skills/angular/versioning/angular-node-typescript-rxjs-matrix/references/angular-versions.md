# Angular toolchain, browser and polyfill compatibility

Verified 2026-10-25 against [Angular Version compatibility](https://angular.dev/reference/versions). Tables adapted from Angular documentation, licensed CC BY 4.0. Support status is a dated snapshot; recheck the source before a new upgrade decision.

## Select the exact row

Use the installed version from the lockfile and the intended target minor. Match the row label exactly: this captured page has a `22.0.x` row, not a separate `22.1.x` or `22.2.x` row. For an unlisted minor, inspect its tagged/published compiler, core, CLI and builder packages and report the evidence separately. Never widen a range from a nearby row or from a permissive package engine.

Intersect the selected Node/TypeScript/RxJS ranges with all CLI, builder, Nx and other peer/engine requirements. Check local, CI, container and SSR runtimes independently. NgAutoPilot's own Node runtime contract is separate from the application's requirements.

For example, the 22.0.x row admits Node 24.15.0, but excludes 24.0.0, 20.x and 27.x; it admits TypeScript 6.0.0 and excludes 6.1.0. A supported RxJS version does not establish compatibility for the other tools.

## Supported versions at verification

| Angular | Node.js | TypeScript | RxJS |
| --- | --- | --- | --- |
| 22.0.x | ^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0 | >=6.0.0 <6.1.0 | ^6.5.3 \|\| ^7.4.0 |
| 21.0.x \|\| 21.1.x \|\| 21.2.x | ^20.19.0 \|\| ^22.12.0 \|\| ^24.0.0 | >=5.9.0 <6.0.0 | ^6.5.3 \|\| ^7.4.0 |
| 20.2.x \|\| 20.3.x | ^20.19.0 \|\| ^22.12.0 \|\| ^24.0.0 | >=5.8.0 <6.0.0 | ^6.5.3 \|\| ^7.4.0 |
| 20.0.x \|\| 20.1.x | ^20.19.0 \|\| ^22.12.0 \|\| ^24.0.0 | >=5.8.0 <5.9.0 | ^6.5.3 \|\| ^7.4.0 |

These are the supported rows on the captured page, not a promise that every version remains supported indefinitely. Distinguish regular support from LTS using the [Angular release policy](https://angular.dev/reference/releases).

## Historical versions: Angular 9–19

These rows are historical constraints recorded when each version left LTS. Matching them is useful for reproducing or upgrading a legacy application; it does not restore Angular support, security maintenance, or current support for its old Node runtime.

| Angular | Node.js | TypeScript | RxJS |
| --- | --- | --- | --- |
| 19.2.x | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0 | >=5.5.0 <5.9.0 | ^6.5.3 \|\| ^7.4.0 |
| 19.1.x | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0 | >=5.5.0 <5.8.0 | ^6.5.3 \|\| ^7.4.0 |
| 19.0.x | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0 | >=5.5.0 <5.7.0 | ^6.5.3 \|\| ^7.4.0 |
| 18.1.x \|\| 18.2.x | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0 | >=5.4.0 <5.6.0 | ^6.5.3 \|\| ^7.4.0 |
| 18.0.x | ^18.19.1 \|\| ^20.11.1 \|\| ^22.0.0 | >=5.4.0 <5.5.0 | ^6.5.3 \|\| ^7.4.0 |
| 17.3.x | ^18.13.0 \|\| ^20.9.0 | >=5.2.0 <5.5.0 | ^6.5.3 \|\| ^7.4.0 |
| 17.1.x \|\| 17.2.x | ^18.13.0 \|\| ^20.9.0 | >=5.2.0 <5.4.0 | ^6.5.3 \|\| ^7.4.0 |
| 17.0.x | ^18.13.0 \|\| ^20.9.0 | >=5.2.0 <5.3.0 | ^6.5.3 \|\| ^7.4.0 |
| 16.1.x \|\| 16.2.x | ^16.14.0 \|\| ^18.10.0 | >=4.9.3 <5.2.0 | ^6.5.3 \|\| ^7.4.0 |
| 16.0.x | ^16.14.0 \|\| ^18.10.0 | >=4.9.3 <5.1.0 | ^6.5.3 \|\| ^7.4.0 |
| 15.1.x \|\| 15.2.x | ^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0 | >=4.8.2 <5.0.0 | ^6.5.3 \|\| ^7.4.0 |
| 15.0.x | ^14.20.0 \|\| ^16.13.0 \|\| ^18.10.0 | ~4.8.2 | ^6.5.3 \|\| ^7.4.0 |
| 14.2.x \|\| 14.3.x | ^14.15.0 \|\| ^16.10.0 | >=4.6.2 <4.9.0 | ^6.5.3 \|\| ^7.4.0 |
| 14.0.x \|\| 14.1.x | ^14.15.0 \|\| ^16.10.0 | >=4.6.2 <4.8.0 | ^6.5.3 \|\| ^7.4.0 |
| 13.3.x \|\| 13.4.x | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0 | >=4.4.3 <4.7.0 | ^6.5.3 \|\| ^7.4.0 |
| 13.1.x \|\| 13.2.x | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0 | >=4.4.3 <4.6.0 | ^6.5.3 \|\| ^7.4.0 |
| 13.0.x | ^12.20.0 \|\| ^14.15.0 \|\| ^16.10.0 | ~4.4.3 | ^6.5.3 \|\| ^7.4.0 |
| 12.2.x | ^12.14.0 \|\| ^14.15.0 | >=4.2.3 <4.4.0 | ^6.5.3 \|\| ^7.0.0 |
| 12.1.x | ^12.14.0 \|\| ^14.15.0 | >=4.2.3 <4.4.0 | ^6.5.3 |
| 12.0.x | ^12.14.0 \|\| ^14.15.0 | ~4.2.3 | ^6.5.3 |
| 11.2.x | ^10.13.0 \|\| ^12.11.0 | >=4.0.0 <4.2.0 | ^6.5.3 |
| 11.1.x | ^10.13.0 \|\| ^12.11.0 | >=4.0.0 <4.2.0 | ^6.5.3 |
| 11.0.x | ^10.13.0 \|\| ^12.11.0 | ~4.0.0 | ^6.5.3 |
| 10.2.x | ^10.13.0 \|\| ^12.11.0 | >=3.9.0 <4.1.0 | ^6.5.3 |
| 10.1.x | ^10.13.0 \|\| ^12.11.0 | >=3.9.0 <4.1.0 | ^6.5.3 |
| 10.0.x | ^10.13.0 \|\| ^12.11.0 | ~3.9.0 | ^6.5.3 |
| 9.1.x | ^10.13.0 \|\| ^12.11.0 | >=3.6.0 <3.9.0 | ^6.5.3 |
| 9.0.x | ^10.13.0 \|\| ^12.11.0 | >=3.6.0 <3.8.0 | ^6.5.3 |

## Before Angular 9: check CLI separately

Framework and CLI versions were not synchronized before v9. Inspect both packages; Angular 8.2 can use CLI 8.2 or 8.3, and Angular 2 has no CLI pairing specified in this table. Angular 3 is not a released major or an upgrade hop.

| Angular | Angular CLI | Node.js | TypeScript | RxJS |
| --- | --- | --- | --- | --- |
| 8.2.x | 8.2.x \|\| 8.3.x | ^10.9.0 | >=3.4.2 <3.6.0 | ^6.4.0 |
| 8.0.x \|\| 8.1.x | 8.0.x \|\| 8.1.x | ^10.9.0 | ~3.4.2 | ^6.4.0 |
| 7.2.x | 7.2.x \|\| 7.3.x | ^8.9.0 \|\| ^10.9.0 | >=3.1.3 <3.3.0 | ^6.0.0 |
| 7.0.x \|\| 7.1.x | 7.0.x \|\| 7.1.x | ^8.9.0 \|\| ^10.9.0 | ~3.1.3 | ^6.0.0 |
| 6.1.x | 6.1.x \|\| 6.2.x | ^8.9.0 | >=2.7.2 <3.0.0 | ^6.0.0 |
| 6.0.x | 6.0.x | ^8.9.0 | ~2.7.2 | ^6.0.0 |
| 5.2.x | 1.6.x \|\| 1.7.x | ^6.9.0 \|\| ^8.9.0 | >=2.4.2 <2.7.0 | ^5.5.0 |
| 5.0.x \|\| 5.1.x | 1.5.x | ^6.9.0 \|\| ^8.9.0 | ~2.4.2 | ^5.5.0 |
| 4.2.x \|\| 4.3.x \|\| 4.4.x | 1.4.x | ^6.9.0 \|\| ^8.9.0 | >=2.1.6 <2.5.0 | ^5.0.1 |
| 4.2.x \|\| 4.3.x \|\| 4.4.x | 1.3.x | ^6.9.0 | >=2.1.6 <2.5.0 | ^5.0.1 |
| 4.0.x \|\| 4.1.x | 1.0.x \|\| 1.1.x \|\| 1.2.x | ^6.9.0 | >=2.1.6 <2.4.0 | ^5.0.1 |
| 2.x | - | ^6.9.0 | >=1.8.0 <2.2.0 | ^5.0.1 |

## Browser support

Angular 20+ selects a dated, widely available Baseline for each major. The policy uses the core Chrome, Edge, Firefox and Safari browser set and versions released within the preceding 30 months; approximately 95% reach is a policy target, not measured coverage of the application's users.

| Angular | Baseline date | Browser set |
| --- | --- | --- |
| v22 | 2026-05-07 | [Set for v22](https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2026-05-07&includeDownstream=false) |
| v21 | 2025-10-20 | [Set for v21](https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2025-10-20&includeDownstream=false) |
| v20 | 2025-04-30 | [Set for v20](https://web-platform-dx.github.io/supported-browsers/?widelyAvailableOnDate=2025-04-30&includeDownstream=false) |

For Angular versions before v20, the captured page lists Chrome, Edge, Safari, iOS and Android's two most recent major versions, and Firefox latest plus ESR. Treat this as the historical policy for that Angular release; it is not evidence that an unsupported Angular release works in today's latest browsers.

Inspect the application's Browserslist/build targets and real user requirements alongside the official browser set. Record unsupported required browsers as blockers and exercise critical journeys in the supported browsers.

## Polyfills by application configuration

- Inventory the browser APIs the application and its dependencies actually use. Angular's own required polyfills may not cover those APIs. Use the target browsers to decide the smallest required set; a polyfill does not certify an unsupported browser or fix its performance limits.
- For Angular CLI workspaces, inspect both build and test builder `polyfills` options. Entries may be file paths, workspace-relative paths or module specifiers. Include a TypeScript polyfill entry file in the applicable tsconfig `files` list and verify the target actually loads it.
- For non-CLI projects, load the required scripts in the host HTML (`index.html`) or the equivalent bundler entry before code that depends on them. Apply any necessary ZoneJS flags before loading ZoneJS.
- Check the change-detection mode before adding ZoneJS. The [zoneless guide](https://angular.dev/guide/zoneless) states that zoneless is the default in Angular v21+. An explicit `provideZoneChangeDetection()` can override it. The older host-HTML example containing `zone.js` is conditional guidance for a zone-based application, not a requirement for every Angular version.
- Retain required polyfills in zone-based applications. For a separately authorized zoneless migration, inspect both build and test targets plus explicit `polyfills.ts` imports before removing `zone.js` or `zone.js/testing`. Compatibility review alone is not authorization to change application mode.
- Validate the selected configuration with the application's production build, existing tests and affected real-browser journeys. Report commands that could not run as unverified.

## Refresh and evidence

Record the checked date, installed and target Angular/CLI minor, source row or exact package tag, required ranges, detected versions, browser baseline, polyfill mode and validation outcome. When a source changes, update this reference and regenerate the distributions rather than editing generated copies. Report unavailable evidence or conflicting requirements as unresolved.
