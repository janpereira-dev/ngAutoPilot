# Changelog

All notable changes to NgAutoPilot will be documented in this file.

## 0.3.1 - 2026-05-03

Release focused on public DX, naming consistency, and cleaner release communication.

### Changed

- Renamed the public CLI command from `ng-autopilot` to `ngautopilot`.
- Renamed the generated local workspace from `.ng-autopilot/` to `.ngautopilot/`.
- Renamed the packaged CLI entry file from `bin/ng-autopilot.mjs` to `bin/ngautopilot.mjs`.
- Reworked the root README into a shorter public landing page with quick start, naming guidance, and high-signal badges.
- Split public usage and maintainer guidance into dedicated docs pages.
- Expanded npm keywords for better package discoverability.

### Breaking Changes

- `ng-autopilot` no longer exists as the supported CLI command. Use `ngautopilot`.
- Existing examples, shell aliases, or scripts that target `.ng-autopilot/` must be updated to `.ngautopilot/`.

## 0.2.4 - 2026-05-03

Release built from the accumulated changes after the unpublished 0.2.3 snapshot.

### Added

- CSS skill bundle and plugin packaging:
  - `css.host-custom-properties`
  - `css.content-aware-layouts`
- Repository release hygiene:
  - pre-commit git hook
  - release bundle archiving

### Changed

- Normalized Angular skill structure to keep catalog and bundle paths aligned.
- Hardened CI release and marketplace validation workflows.
- Added consistency validation to keep the repo, catalog, and bundles in sync.
- Documented CSS plugin installation in the root README.

## 0.2.3 - 2026-05-02

### Added

- Angular enterprise training and primitives:
  - `angular.architecture.angular-enterprise-training-blueprint`
  - `angular.architecture.angular-enterprise-training-assessment`
  - `angular.architecture.angular-enterprise-onboarding-plan`
  - `angular.architecture.angular-version-aware-training-matrix`
  - `angular.architecture.angular-enterprise-primitives`
- Angular micro-frontends architecture family:
  - `angular.architecture.micro-frontends-architecture`
  - `angular.architecture.micro-frontends-shell-container-contract`
  - `angular.architecture.module-federation-runtime-contract`
  - `angular.architecture.micro-frontends-communication-patterns`
  - `angular.architecture.design-system-for-micro-frontends`
  - `angular.testing.micro-frontends-e2e-validation`
  - `angular.architecture.micro-frontends-release-governance`
  - `angular.architecture.micro-frontends-fallback-and-rollback`
  - `angular.architecture.micro-frontends-ownership-and-rbac-contract`
  - `angular.architecture.micro-frontends-version-compatibility-gate`
  - `angular.architecture.micro-frontends-observability-contract`
  - `angular.architecture.micro-frontends-dependency-sharing-policy`
- JavaScript fundamentals and runtime variants:
  - `javascript.fundamentals`
  - `javascript.async-error-handling`
  - `javascript.async-error-handling.nodejs-async-error-handling-v18`
  - `javascript.async-error-handling.browser-async-error-handling-v18`
  - `javascript.async-error-handling.nodejs-async-error-handling-v20`
  - `javascript.async-error-handling.browser-async-error-handling-v20`
  - `javascript.modules`
  - `javascript.pure-functions`
- TypeScript fundamentals and strictness:
  - `typescript.fundamentals`
  - `typescript.strict-types`
  - `typescript.strict-types.typescript-strict-types-strict-mode`
  - `typescript.dto-mappers.browser-dto-mappers-v14`
  - `typescript.dto-mappers.node-dto-mappers-v18`
- Quality governance and cleanup:
  - `quality.fundamentals`
  - `quality.fundamentals.quality-decision-matrix`
  - `quality.eslint.eslint-baseline-hardening`
  - `quality.eslint.eslint-disable-governance`
  - `quality.eslint.eslint-autofix-safe-cleanup`
  - `quality.eslint.eslint-autofix-safe-cleanup-browser-v18`
  - `quality.eslint.eslint-autofix-safe-cleanup-node-v20`
  - `quality.eslint.eslint-baseline-hardening-monorepo`
  - `quality.no-dead-code.unused-exports-cleanup`
  - `quality.no-dead-code.orphan-files-cleanup`
  - `quality.no-dead-code.orphan-files-cleanup-monorepo`
  - `quality.no-dead-code.dead-branches-cleanup`
  - `quality.sonarqube.sonarqube-quality-gate-triage`
  - `quality.sonarqube.sonarqube-quality-gate-triage-monorepo`
  - `quality.sonarqube.sonarqube-cognitive-complexity-reduction`
  - `quality.sonarqube.sonarqube-duplication-coverage-hardening`
  - `quality.technical-debt.debt-ledger-cleanup-hop`
- Angular template diagnostics:
  - `angular.templates.extended-diagnostics-governance`
  - `angular.templates.extended-diagnostics-remediation`
  - `angular.templates.strict-templates-adoption`
  - `angular.templates.template-diagnostics-matrix`
  - `angular.upgrades.templates.angular-extended-diagnostics-upgrade-gate`
- Catalog cleanup:
  - removed placeholder `skills/git/` source folders
  - removed placeholder `.gitkeep` files from populated skill folders

## 0.2.2 - 2026-05-01

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
