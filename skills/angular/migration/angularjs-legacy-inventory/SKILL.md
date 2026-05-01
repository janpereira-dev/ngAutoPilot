---
id: angular.migration.angularjs-legacy-inventory
name: AngularJS Legacy Inventory
description: >
  Scans an AngularJS 1.x repository and inventories modules, controllers, directives, services, routes, templates, and high-risk legacy APIs before any modernization slice is selected.
stack:
  - AngularJS
  - Angular
  - TypeScript
category: migration
status: draft
version: 0.1.0
owner: NgAutoPilot
triggers:
  - AngularJS inventory
  - legacy scan
  - ngUpgrade preparation
  - AngularJS modernization inventory
compatibility:
  angularjs:
    min: "1.x"
---

# AngularJS Legacy Inventory

## Purpose

Use this skill to build a technical inventory of an AngularJS 1.x codebase before any modernization work begins.

This skill does not migrate code. It identifies the legacy surface area, the risky APIs, and the structural facts needed by the modernization orchestrator.

## When to Use This Skill

Use this skill when:

- The repository contains AngularJS 1.x code.
- The modernization path has not been selected yet.
- You need a factual map of controllers, directives, services, routes, templates, and bootstrap points.
- The repo may contain hybrid AngularJS and Angular code.
- You need to understand migration complexity before choosing rewrite, strangler, or hybrid.

## When Not to Use This Skill

Do not use this skill when:

- The codebase is already fully Angular 2+ and no AngularJS evidence exists.
- The modernization strategy has already been chosen and the task is to execute a bounded slice.
- The user wants a template migration, service migration, or routing migration directly.
- The request is only for Angular 2+ version upgrades.

## Inputs Expected

- AngularJS evidence
- Root module and bootstrap entry point
- Routing approach
- Template locations
- Test framework and build commands
- AngularJS version if it can be detected
- Hybrid or non-hybrid runtime evidence

## Compatibility by Version

| Framework | Strategy recommended | Observations |
|---|---|---|
| AngularJS 1.x | Inventory first | Capture legacy APIs before deciding a migration strategy. |
| Hybrid AngularJS + Angular | Inventory both sides separately | Track boundary files and shared services explicitly. |
| Angular 2+ only | Do not use this skill | Use Angular upgrade or feature-specific skills instead. |

If a version cannot be confirmed from the repository, mark it as `verify in project`.

## Procedure

1. Detect AngularJS evidence in code and templates.
2. Identify the root bootstrap path.
3. Enumerate modules, controllers, directives, services, factories, providers, filters, and routes.
4. Count or estimate template and `$scope` usage.
5. Record high-risk APIs and structural smells.
6. Separate legacy-only files from hybrid boundary files.
7. Summarize test coverage and validation commands.
8. Hand the inventory to the strategy selector or orchestrator.

## Do

- Capture facts before opinion.
- Separate framework facts from migration hypotheses.
- Include route, controller, and template hotspots.
- Note direct DOM, jQuery, `$watch`, `$compile`, `$rootScope`, and `$digest` usage.
- Highlight shared services and globals that complicate migration.
- Keep the inventory bounded to what the repository actually contains.

## Recommended Patterns

Build an inventory table or report with at least:

| Area | Evidence | Count/Scope | Risk | Notes |
|---|---|---|---|---|
| Bootstrap | `ng-app`, manual bootstrap, hybrid bootstrap | verify in project | low/medium/high | root entry point |
| Modules | AngularJS modules | count | medium | shared vs feature |
| Controllers | controller files and registrations | count | medium | route-aligned or not |
| Directives | custom directives | count | medium/high | link, transclusion, isolate scope |
| Services | services/factories/providers | count | medium | shared state, `$http`, `$q` |
| Filters | custom filters | count | low/medium | pure or stateful |
| Routes | `ngRoute`, `ui-router`, custom | count | high | route ownership |
| Templates | inline and external templates | count | medium | conversion scope |
| High-risk APIs | `$scope`, `$rootScope`, `$watch`, `$compile`, jQuery, DOM access | count | high | migration risk |

## Anti-Patterns

- Writing a modernization plan without inventory data.
- Mixing inventory with migration edits.
- Assuming AngularJS version without evidence.
- Treating every file as equally risky.
- Ignoring shared globals and event buses.

## Do Not

- Do not rewrite code during the inventory pass.
- Do not introduce Angular 21 syntax in inventory output.
- Do not claim exact counts if the repository scan only provides estimates.
- Do not skip hybrid boundary files when both frameworks are present.
- Do not run commands that are not present in `package.json`.

## Review Checklist

- [ ] AngularJS evidence has been confirmed.
- [ ] Bootstrap method is identified or marked verify in project.
- [ ] Modules, controllers, directives, services, filters, routes, and templates are inventoried.
- [ ] High-risk APIs are listed.
- [ ] Hybrid boundary files are identified when relevant.
- [ ] Validation commands are known.
- [ ] The next migration decision can be made from the inventory.

## Validation Minimum

Use only commands that exist in the repository.

Prefer:

- build
- test
- lint

If validation cannot run, explain why and what evidence is still missing.

## Risks

- Missing files can make the inventory incomplete.
- Dynamic registration can hide controllers or routes from simple scans.
- Shared `$rootScope` patterns can understate the actual migration risk.
- Mixed AngularJS and Angular code can blur boundary ownership.

## Expected Output

When this skill is used, return:

1. AngularJS evidence found.
2. Bootstrap method.
3. Inventory summary.
4. High-risk APIs and hotspots.
5. Hybrid boundary evidence, if any.
6. Validation commands known or run.
7. Recommended next skill.

## Exit Criteria

This skill is complete only when:

- AngularJS evidence has been captured.
- The inventory covers the major legacy surfaces.
- Risk hotspots are identified.
- The next skill or strategy can be selected from the report.
- No migration code has been changed.

