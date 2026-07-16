# Angular v22 Support

## Verification

Verified against Context7 (official angular.dev documentation) on 2026-07-16.

## Stable APIs (production ready)

| API | Status | Source |
| --- | --- | --- |
| Signal Forms | stable | angular.dev/guide/forms/signals |
| Resource API | stable | angular.dev/roadmap |
| httpResource | stable | angular.dev/roadmap |
| Asynchronous Signals | stable | angular.dev/events/v22 |
| Angular Aria | stable | angular.dev/events/v22 |
| Zoneless change detection | stable | angular.dev/roadmap |
| Linked Signal API | stable | angular.dev/roadmap |
| Incremental hydration | stable | angular.dev/roadmap |
| Effect API | stable | angular.dev/roadmap |
| Event replay (SSR) | stable | angular.dev/roadmap |
| Route-level render mode | stable | angular.dev/roadmap |
| OnPush (default for new apps) | stable | angular.dev/best-practices |
| ChangeDetectionStrategy.Eager (renamed from Default) | stable | angular.dev |

## New APIs (v22)

| API | Status | Notes |
| --- | --- | --- |
| `@Service()` decorator | stable | Replacement for `@Injectable({ providedIn: 'root' })` |
| `injectAsync()` | stable | Lazy DI; service must be auto-provided |
| Template spread/rest syntax | stable | Object, array, function calls |
| Template arrow functions | stable | Short inline functions |
| Multi-case `@switch` | stable | Shared output across cases |
| Exhaustive `@switch` (never) | stable | Compile-time error for unhandled unions |
| HTML element-level comments | stable | `// comment` and `/* comment */` in templates |
| Host directive de-duplication | stable | Template match wins over host match |

## Experimental APIs

| API | Status | Notes |
| --- | --- | --- |
| `@boundary` / `@error` | developer preview (Q3 2026) | Error boundaries in templates |
| WebMCP | experimental | Tools for agents to interact with the app |
| `withExperimentalPlatformNavigation` | experimental | Browser Navigation API integration |
| `withExperimentalAutoCleanupInjectors` | experimental | Auto-destroy route injectors |
| `destroyDetachedRouteHandle` | stable | Public API for custom reuse strategy cleanup |

## Deprecated

| Feature | Notes |
| --- | --- |
| Webpack builders | `@angular-devkit/build-angular`, `@ngtools/webpack` deprecated; TSGo application builder is the focus |

## TypeScript support

TypeScript 6.x is supported in v22.

## NgAutoPilot skill coverage

NgAutoPilot ships Angular 22-specific skills under `skills/angular/ai/angular-v22-*`:
- `angular-v22-agent-skills-integration` — use Angular Agent Skills as reference
- `angular-v22-ai-tutor-safe-usage` — safe AI tutor usage
- `angular-v22-angular-mcp-agent-workflow` — Angular MCP devserver workflow
- `angular-v22-devserver-self-healing-loop` — self-healing build loop
- `angular-v22-webmcp-tool-exposure` — WebMCP experimental exposure

All v22 skills use `compatibility.angular.min: "22"` frontmatter gate.

## Rules

- Do not declare an experimental API stable.
- Do not recommend Angular 22 in a project without detecting its version.
- Keep upgrade hops major-by-major.
- Separate upgrade work from modernization, remediation, and optimization.