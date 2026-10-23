# Angular 22.2 knowledge baseline

Verified 2026-10-23. Release presence and API maturity are separate evidence.

## Sources and version boundaries

- Framework release: https://github.com/angular/angular/releases/tag/v22.2.0 (2026-09-23).
- CLI/build/SSR release: https://github.com/angular/angular-cli/releases/tag/v22.2.0.
- Framework patch baseline observed: https://github.com/angular/angular/releases/tag/v22.2.3.
- CLI patches have independent numbering; do not require framework and CLI patch equality.
- Compatibility table: https://angular.dev/reference/versions. Its captured table lists 22.0.x, not a separate 22.2.x row: do not silently relabel it.
- Exact 22.2 compiler contract: https://github.com/angular/angular/blob/v22.2.0/packages/compiler-cli/package.json declares TypeScript >=6.0 <6.1 and Node ^22.22.3 || ^24.15.0 || >=26.0.0. Also verify published CLI/build engines and all peer ranges; a permissive engine does not establish support for every future Node major.
- Keep NgAutoPilot's own Node >=24.0.0 <25 contract separate. Node 24.0 is insufficient for the Angular 22 compiler.

## Choose guidance by installed version

| Project | Required decision |
| --- | --- |
| AngularJS / Angular 2–21 | Preserve era-specific patterns and toolchain; route major upgrades through existing sequential hops. Do not introduce 22.2 APIs. Angular 3 is not a historical major hop. |
| Angular 22.0 / 22.1 | Audit the minor delta before adopting 22.2 APIs; no 21-to-22 major hop is needed. |
| Angular 22.2 | Confirm lockfile and published packages, then apply only relevant concerns below. |
| Angular 22.3 next / future versions | Treat prereleases separately; no automatic stable certification. |

For a library, verify the oldest supported consumer as well as the development application. A major-22 routing tag does not establish exact-minor availability. Skill status describes the skill, not Angular API maturity.

## Framework delta and acceptance evidence

| Concern | 22.2 evidence | Action and proof |
| --- | --- | --- |
| Route injector disposal | withAutoCleanupInjectors is stable since 22.2; old experimental name is deprecated | Opt in explicitly; test shouldDestroyInjector and retrieveStoredRouteHandles in custom RouteReuseStrategy, retained handles and eviction. https://angular.dev/api/router/withAutoCleanupInjectors |
| Detached handles | destroyDetachedRouteHandle is stable since 22.2 | Destroy only evicted handles, remove stored references, prove no reattachment and correct teardown. https://angular.dev/api/router/destroyDetachedRouteHandle |
| Router resources | Public resources APIs and reload on ActivatedRoute resources; withRouterResources is developer preview since 22.2 | Keep adoption separate from upgrade. Test blocking/nonblocking load, cancellation, reload, errors and redirect rollback. https://angular.dev/api/router/withRouterResources |
| Rendering failures | ErrorBoundary programmatic APIs and language-service support for @boundary | @boundary is developer preview. Test fallback, reset and projected-content limits before adoption. Do not claim it catches arbitrary asynchronous errors. https://angular.dev/api/core/%40boundary |
| Templates | Private property access and strictUnclaimedEventNames option | Do not expose private state mechanically. The event-name option defaults to false even with strictTemplates; assess camelCase events, dashed custom events and CUSTOM_ELEMENTS_SCHEMA exceptions. https://angular.dev/tools/cli/template-typecheck |
| Deferred views / CSS | Keyed defer type checking, deferred-import deduplication and nested CSS scoping fixes | Compile real deferred blocks and compare scoped/nested styles and ::ng-deep behavior visually. |
| Directive tests | New directive-testing utility exposed as TestBed.createDirective | Verify installed exports/types and runner adapter; assert host bindings, input changes and destruction. Existing Jest tests need no automatic runner replacement. https://angular.dev/api/core/testing/TestBed |
| Signal Forms | Permanent hidden fields and fixed WebMCP implicit-form hints | Prove hidden/submitted model behavior and validation; preserve server authorization. Hints are not permission controls. |
| WebMCP | Tool annotations added | Review actual schema, consent and authorization; Angular MCP developer tooling and application WebMCP have different trust boundaries. Do not infer maturity from the stable framework release. |
| Animation / navigation | Function/signal animation bindings, nested leave cancellation and FakeNavigation changes | Run reorder/destruction tests and navigation mocks for affected behavior. |

## CLI, builder and CI delta

The CLI 22.2 release adds `ng mcp --root`; verify `ng mcp --help` on the local CLI and point at the directory containing the intended Angular workspace. For Maven/JEE repositories this can be under `1-DEVELOPMENT/jeeApp/*-web/src/main/front/`, not the Git root. Do not assume the globally installed CLI or start an unrelated devserver.

The build release changes the Angular linker to Oxc, watchers to @parcel/watcher/chokidar, uses native sass-embedded, changes caches, separates browser/server stats and precompiles SSR critical CSS. These are builder internals, not an instruction to install Oxc or rewrite a working builder.

Acceptance for affected applications:

1. Record OS/architecture, Node, package manager, lockfile, Angular/CLI/build/Material/CDK/Nx versions, builder and test adapter peer ranges.
2. Run clean install and cold/warm production builds on the real CI platform. Check native Sass availability and fallback behavior with actual logs; do not promise universal native binary support.
3. Run watch mode with one TS edit and one external/inline stylesheet edit. Check symlinked workspace libraries, cache invalidation and source maps.
4. For SSR, compare browser/server output and stats consumers; exercise hydration, critical CSS, proxy/baseHref and authenticated API contracts.
5. For service-worker apps, verify offline/update behavior; the release changes preloadInitial default when serviceWorker is enabled.
6. For the Angular unit-test builder using Vitest 5, review deprecated splitting and coverage setup hooks. For Jest, verify Jest/preset peers independently and retain the runner unless a separate migration is authorized.
7. Report PASS/FAIL/SKIPPED with commands and artifacts. A generic build pass is insufficient for a custom route cache or native Sass in CI.

## Refresh contract

Record checked date, exact source tag, installed/target minor, API status, toolchain evidence and validation. Prefer version-tagged source over main when the current documentation differs. Preserve historical skills; append verified minor knowledge. Never convert release notes into an untested claim of complete runtime support.
