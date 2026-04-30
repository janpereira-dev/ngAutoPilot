# Changelog

All notable changes to NgAutoPilot will be documented in this file.

## Unreleased

### Added

- Public documentation and release automation:
  - `CODE_OF_CONDUCT.md`
  - `SECURITY.md`
  - `.github/workflows/ci.yml`
  - `.github/workflows/publish-packages.yml`
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
