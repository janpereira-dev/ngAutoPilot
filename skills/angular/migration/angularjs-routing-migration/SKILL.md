---
id: angular.migration.angularjs-routing-migration
name: AngularJS Routing Migration
description: >
  Migrates AngularJS routing, route ownership, and navigation patterns to Angular Router in bounded, version-aware slices.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - AngularJS routing
  - ngRoute migration
  - ui-router migration
  - route ownership
  - navigation migration
compatibility:
  angularjs:
    min: "1.x"
  angular:
    min: "2"
---

# AngularJS Routing Migration

## Purpose

Use this skill to migrate AngularJS routing and navigation ownership to Angular Router in a controlled slice.

This skill focuses on route definitions, route params, guards, redirects, and route ownership. It does not migrate templates, services, or forms unless those are directly required by the route boundary.

## When to Use This Skill

Use this skill when:

- The routing inventory already exists.
- The app uses `ngRoute`, `ui-router`, or a custom AngularJS routing setup.
- You need to move route ownership from AngularJS to Angular.
- Navigation is the main blocker for feature migration.
- The route graph is the natural business boundary for the next slice.

## When Not to Use This Skill

Do not use this skill when:

- There is no routing evidence in the repository.
- The route strategy has not been selected.
- The task is only about template or service migration.
- The app is already Angular-only and does not need AngularJS routing conversion.

## Inputs Expected

- Routing inventory
- Target Angular major
- Current AngularJS router type
- Route params and redirects
- Guard/auth requirements
- Validation commands

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS `ngRoute` | Convert one route group at a time | Keep redirects and params stable while migrating. |
| AngularJS `ui-router` | Map states to Angular routes or route groups | Preserve deep-link behavior and transition assumptions. |
| Angular 2+ | Use Angular Router with route-level boundaries | Prefer lazy loading when route ownership is clear. |
| Angular 17+ | Modern router APIs may be available if the project supports them | Verify project support before using modern syntax. |

If a version cannot be confirmed from the project files, mark it as `verify in project`.

## Procedure

1. Identify the router type and route inventory.
2. Map route ownership to Angular route boundaries.
3. Preserve route params, redirects, and guard requirements.
4. Move one route group or state family at a time.
5. Update navigation links and route templates only when needed.
6. Validate the route slice.
7. Document remaining AngularJS routes.

## Do

- Preserve deep-link behavior.
- Keep route names, params, and redirects understandable.
- Prefer route-by-route migration over wholesale navigation rewrites.
- Use lazy loading where it matches route ownership and version support.
- Keep auth and guard behavior explicit.
- Treat routing as a business boundary, not just a URL list.

## Recommended Patterns

Convert AngularJS routes to Angular Router routes:

```ts
export const routes: Routes = [
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.routes').then((m) => m.ORDERS_ROUTES),
  },
];
```

Map legacy `ui-router` states to Angular route segments and nested routes when needed.

Prefer route-level lazy loading for separated domains.

## Anti-Patterns

- Moving all routes at once.
- Breaking deep links during migration.
- Changing route ownership without updating navigation entry points.
- Mixing routing migration with unrelated template rewrites.
- Leaving duplicate route definitions active without a clear boundary.

## Do Not

- Do not migrate templates, services, or forms in the same slice unless the route requires it.
- Do not invent Angular Router APIs or features that the target version cannot support.
- Do not remove legacy routes before the replacement route is ready.
- Do not keep both route systems permanently without a decommission plan.
- Do not run commands that do not exist in `package.json`.

## Review Checklist

- [ ] The router type was identified.
- [ ] The route inventory was read.
- [ ] Route ownership was mapped to Angular boundaries.
- [ ] Deep links and redirects were preserved.
- [ ] Only one route slice was migrated.
- [ ] Legacy routes still have a safe fallback or decommission plan.
- [ ] Validation was planned or executed.

## Validation Minimum

Use only repository commands that actually exist.

Prefer:

- build
- test
- lint

If validation cannot run, report the blocker and the safest next step.

## Risks

- Route migrations can break URLs and bookmarks if redirects are missed.
- Changing route ownership can expose hidden coupling to guards or resolvers.
- `ui-router` and Angular Router do not map one-to-one in every case.
- Hybrid route setups can become hard to decommission if left open-ended.

## Expected Output

When this skill is used, return:

1. Router type and route inventory summary.
2. Route boundary selected.
3. Angular route mapping.
4. Legacy routes remaining.
5. Validation commands and results.
6. Next recommended skill.

## Exit Criteria

This skill is complete only when:

- The router type is known.
- A route slice has been migrated or planned.
- Deep links remain understandable.
- The next route step is clear.
- No unrelated areas were changed.

