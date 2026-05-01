# Changelog

All notable changes to NgAutoPilot will be documented in this file.

## Unreleased

### Added

- Public release checklist:
  - `docs/release-checklist.md`
- Markdownlint workspace support:
  - `.markdownlint.json`
  - `.vscode/settings.json`
- Workflow updates for release automation:
  - `.github/workflows/ci.yml`
  - `.github/workflows/release.yml`
  - `scripts/build-publish-bundles.mjs`
- Public publish bundle targets:
  - AutoSkills
  - SkillsMP
  - SkillsLLM
  - LobeHub Skills
  - MCPMarket
- Core autopilot operating layer:
  - `core.autopilot-orchestrator`
  - `core.project-intake`
  - `core.stack-version-detection`
  - `core.skill-router`
  - `core.compatibility-router`
  - `core.risk-assessment`
- Angular versioning layer:
  - `angular.versioning.angular-version-gates`
  - `angular.versioning.angular-version-compatibility-gate`
  - `angular.versioning.angular-versioning-index`
- Angular major-hop system:
  - `angular-15-to-16`
  - `angular-16-to-17`
  - `angular-17-to-18`
  - `angular-18-to-19`
  - `angular-19-to-20`
  - `angular-20-to-21`
- Angular upgrade satellites:
  - AngularJS/ngUpgrade inventory, bootstrap, routing, service, directive, controller, filter, and decommission skills
  - Workspace, RxJS, and HttpClient migration bridges
  - Ivy, localize, router lazy-route, service worker, SSR, forms, and testing cleanup skills
  - Angular Material MDC v15 family and v14 cleanup skill
  - Router, SSR, hydration, zone, zoneless, signals, resources, templates, components, DI, debug, and hybrid follow-up skills
- Angular modernization satellites:
  - control flow adoption/migration for v17 through v21
  - defer views adoption for v17 through v21
  - standalone-first adoption for v19 through v21
  - zoneless readiness for v17 through v21
- Angular dependency injection skill:
  - `angular.dependency-injection`
- Angular architecture skill family:
  - `angular.architecture.angular-patterns-senior`
  - `angular.components.container-presentational`
  - `angular.state.signals-vs-rxjs`
  - `angular.architecture.facade-pattern`
  - `angular.services.single-responsibility-services`
  - `angular.rxjs.observable-contracts`
  - `angular.versioning.angular-version-gates`
### In progress

- Public npm distribution and npx CLI support.
- Release workflow consolidation and publication automation review.

### In progress

- Public npm distribution and npx CLI support.
- Release workflow consolidation and publication automation review.

## 0.2.0 - 2026-05-01

### Added

- Expanded the Angular skill catalog into a full major-hop roadmap from Angular 2 through Angular 21.
- Added Angular compatibility gates, a master versioning index, and hop routing hooks.
- Added AngularJS migration, workspace, RxJS, HttpClient, Ivy, localize, router, SSR, service worker, testing, forms, Material, zone, zoneless, resources, templates, DI, and hybrid satellite skills.
- Added Angular modernization satellites for control flow, `@defer`, standalone-first, and zoneless readiness.
- Updated the root README and changelog to explain the new versioning structure.

## 0.2.0 - 2026-05-01

### Added

- Expanded the Angular skill catalog into a full major-hop roadmap from Angular 2 through Angular 21.
- Added Angular compatibility gates, a master versioning index, and hop routing hooks.
- Added AngularJS migration, workspace, RxJS, HttpClient, Ivy, localize, router, SSR, service worker, testing, forms, Material, zone, zoneless, resources, templates, DI, and hybrid satellite skills.
- Added Angular modernization satellites for control flow, `@defer`, standalone-first, and zoneless readiness.
- Updated the root README and changelog to explain the new versioning structure.

## 0.1.0 - 2026-04-30

### Added

- Initial public repository structure.
- Official skill template.
- Initial skill metadata schema.
- Initial catalog with Angular and TypeScript micro-skills.
- Adapter templates for generic agents, Copilot, Claude, Codex, Cursor, and Gemini.
- Basic scripts for creating skills, validating skills, generating the catalog, and exporting adapters.
- Initial skills:
  - `angular.performance.onpush-change-detection`
  - `angular.performance.trackby-for-lists`
  - `angular.performance.avoid-template-functions`
  - `angular.rxjs.avoid-nested-subscriptions`
  - `typescript.strict-types.avoid-any`
