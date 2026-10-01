# Historial de cambios

<!-- docs:navigation:start -->
[English](CHANGELOG.md) · [Mapa](docs/README.es.md) · [Inicio](README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

Este archivo documenta los cambios destacados de NgAutoPilot.

## 0.10.0 - Sin publicar

### Añadido

- Documentación completa EN/ES, pares SVG accesibles y validación estricta de cobertura y enlaces.
- Instalaciones Angular filtradas, planes de trabajo acotados, migración por checkpoints y resolución por instantáneas con factoría HTTPS optativa autenticada.
- Inventario unificado de skills, packs, miembros npm y hashes; plan ordenado de 21 destinos.

### Seguridad y release

- Integración de protecciones recientes de main: contención fuente, ediciones locales, binarios, expedientes exactos y aprobaciones protegidas.
- Los releases GitHub publican el tarball npm exacto tras aprobación; reintentos con integridad idéntica y sin retroceder latest.
- Envío público, invocación real y credencial npm protegida siguen pendientes del responsable.

## 0.9.0 - 2026-09-17

### Seguridad

- Actions de release fijadas por SHA, sin credenciales persistidas y permisos predeterminados de lectura.
- Fuentes de instalación limitadas al paquete; rechazo de traversal, enlaces y archivos no regulares antes de leer, copiar, respaldar o restaurar.
- Carga segura de manifiestos de packs y adaptadores.

### Cambiado

- Compatibilidad major/minor: guards funcionales desde 14.2 y Signals desde 16.
- Informes filtrados no instalables directamente como packs; CLI muestra destino efectivo.

## 0.8.1 - 2026-09-16

### Seguridad

- Parser literal estricto en lugar de evaluación dinámica de datos Angular Can I Use; CSV protegido frente a fórmulas.
- Sin instalación automática de hooks ni limpieza recursiva de Skill Lab en el paquete público.
- Prueba de enlace del binario ngautopilot tras instalación npm.

### Cambiado

- Eliminado always-auth no soportado; catálogo, packs, plugins, marketplaces y expediente OpenAI sincronizados a 0.8.1.

## 0.8.0 - 2026-09-15

### Añadido

- Gates cerrados ante fallos de padres de salida, SemVer, manifiestos y copia pública allowlist OpenAI.
- Seguridad determinista ampliada a todo texto publicable, SVG y instantáneas anidadas.
- Regresiones de enlaces de salida, tipos inválidos, NUL y contenido publicable anidado.

### Cambiado

- Paquete, catálogo, 413 skills, packs, bundles, marketplaces y expediente a 0.8.0; lockfile e instantáneas alineados.

## 0.6.0 - 2026-08-09

### Añadido

- Añadida generación en vista previa de Agent Plugins 1.0 para Core, arquitectura Angular, pruebas Angular y salto 21 → 22.
- Añadido `ngautopilot-tools`, plugin MCP stdio con nueve herramientas de inspección de solo lectura validadas por esquema en aquella release.
- Añadidos validación portable, distribución ZIP determinista y checksums SHA-256.

### Modificado

- Base de runtime del repositorio y CI trasladada a Node.js 24.x para MCP SDK v2.
- Ampliadas comprobaciones de release con sync, validación y smoke de Agent Plugins, preservando bundles y marketplaces nativos.

## 0.5.3 - 2026-07-27

Release centrada en el flujo gobernado Skill Lab, distribución de la skill raíz y evidencias más exigentes de actualización Angular.

### Añadido

- Añadido flujo `skill-lab/` con gobierno para evaluación con benchmarks, comprobación de candidatos y expedientes de promoción.
- Añadidos workflows CI Skill Lab para validación estática y optimización protegida.
- Añadido `SKILL.md` raíz para instalar y descubrir NgAutoPilot como skill de nivel superior.
- Añadidos casos exigentes de fase E: scripts compuestos, workspaces, peticiones de omisión, advertencias parciales y logs inyectados.

### Modificado

- Actualizados paquete, catálogo, skills, bundles y metadatos marketplace a `0.5.3`.
- Reforzado el evaluador del benchmark de validación Angular para scripts `ci` y `preflight`.
- Bloqueada aprobación cuando una comprobación disponible se omite explícitamente.
- Ampliada seguridad a skills raíz, recursos Skill Lab, puente Python y metadatos TOML.

## 0.5.2 - 2026-07-17

Release centrada en cadena de suministro de skills, análisis automático de seguridad y descubrimiento público.

### Añadido

- Añadido análisis determinista del contenido de skills para scripts, manteniendo CodeQL Default Setup gestionado por GitHub.
- Añadido Dependabot para npm y GitHub Actions.
- Añadidos distintivos de descubrimiento Pi y skills.sh verificados en aquella revisión.
- Añadidos 26 packs Angular específicos: fundamentos, estado, UI, runtime, pruebas, modernización, migración y todos los saltos documentados.

### Modificado

- Actualizados paquete, catálogo, 413 skills, packs, bundles y metadatos marketplace a `0.5.2`.
- Reforzado el cambio de versión para conservar entradas anteriores del historial.
- Resolución de dependencias durante planificación y retirada de archivos gestionados sin modificar al cambiar packs.

## 0.5.1 - 2026-07-16

Release centrada en un contrato de distribución activo único, integridad y portabilidad entre agentes.

### Añadido

- Añadidos metadatos Pi para `skills/` canónicas y prompts NgAutoPilot.
- Añadida palabra clave `pi-package` para descubrimiento en Pi Gallery.
- Añadidas 20 skills estables de calidad de diseño: 18 contratos frontend y 2 de librerías Angular.
- Añadida guía de calidad de diseño con selección y referencias.
- Añadida validación de contrato de pack activo y adaptador, incluidos roles y prompts seleccionados.

### Modificado

- Todas las skills de origen y packs pasan a stable; los validadores rechazan estados no estables.
- Descubrimiento de plantillas independiente de nombres de archivos instalados.
- Recursos de roles y prompts declarados por packs incorporados a planes de instalación.
- Alineados workflows con validación de versión y suite completa.
- Corregidos comandos iniciales, nombres de packs y documentación de copias independiente de plataforma.

### Retirado

- Retirados contrato lifecycle-engine/config obsoleto y pruebas antiguas; la CLI activa utiliza packs, manifiestos y módulos de instalación compartidos.
- Retiradas transcripciones no publicadas y auditorías/traspasos locales de documentación distribuible.

## 0.4.0 - 2026-05-10

Release centrada en cerrar el catálogo para publicación.

### Añadido

- Añadida sincronización de bundles generados desde el catálogo `skills/`.
- Añadida validación de cobertura: cada skill en al menos un bundle.
- Añadido bundle `ngautopilot-javascript`.
- Añadidos límites de responsabilidad Signals para `signal`, `computed`, `linkedSignal`, `resource`, plantillas, `effect` y `afterRenderEffect`.

### Modificado

- Reorganizados bundles por uso: Core, Angular, micro-frontends, CSS, JavaScript, calidad, lint, código muerto/SonarQube y TypeScript.
- Completadas skills Angular con cuerpos provisionales.
- Reforzada validación para detectar drafts, marcadores provisionales, cobertura ausente y diferencias generadas.
- Incluidos bundles, manifiestos marketplace y scripts en npm.

## 0.3.1 - 2026-05-03

Release centrada en experiencia de desarrollo pública, nombres coherentes y comunicación clara.

### Modificado

- Renombrado comando público de `ng-autopilot` a `ngautopilot`.
- Renombrado workspace de `.ng-autopilot/` a `.ngautopilot/`.
- Renombrada entrada de `bin/ng-autopilot.mjs` a `bin/ngautopilot.mjs`.
- README raíz reducido con primeros pasos, nombres y distintivos útiles.
- Separadas guías de uso y mantenimiento.
- Ampliadas palabras clave npm para descubrir el paquete.

### Cambios incompatibles

- `ng-autopilot` deja de ser el comando admitido. Utiliza `ngautopilot`.
- Actualizar ejemplos, alias y scripts de `.ng-autopilot/` a `.ngautopilot/`.

## 0.2.4 - 2026-05-03

Release construida con cambios posteriores a la instantánea 0.2.3 no publicada.

### Añadido

- Bundle CSS y empaquetado:
  - `css.host-custom-properties`
  - `css.content-aware-layouts`
- Higiene de release:
  - Hook Git pre-commit
  - Archivado de bundles de release

### Modificado

- Normalizada estructura Angular para alinear rutas de catálogo y bundles.
- Reforzados workflows de release CI y validación marketplace.
- Añadida validación de coherencia de repositorio, catálogo y bundles.
- Documentada instalación CSS en README raíz.

## 0.2.3 - 2026-05-02

### Añadido

- Formación empresarial Angular y primitivas:
  - `angular.architecture.angular-enterprise-training-blueprint`
  - `angular.architecture.angular-enterprise-training-assessment`
  - `angular.architecture.angular-enterprise-onboarding-plan`
  - `angular.architecture.angular-version-aware-training-matrix`
  - `angular.architecture.angular-enterprise-primitives`
- Familia de arquitectura micro-frontends Angular:
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
- Fundamentos JavaScript y variantes runtime:
  - `javascript.fundamentals`
  - `javascript.async-error-handling`
  - `javascript.async-error-handling.nodejs-async-error-handling-v18`
  - `javascript.async-error-handling.browser-async-error-handling-v18`
  - `javascript.async-error-handling.nodejs-async-error-handling-v20`
  - `javascript.async-error-handling.browser-async-error-handling-v20`
  - `javascript.modules`
  - `javascript.pure-functions`
- Fundamentos y rigor TypeScript:
  - `typescript.fundamentals`
  - `typescript.strict-types`
  - `typescript.strict-types.typescript-strict-types-strict-mode`
  - `typescript.dto-mappers.browser-dto-mappers-v14`
  - `typescript.dto-mappers.node-dto-mappers-v18`
- Gobierno de calidad y limpieza:
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
- Diagnósticos de plantillas Angular:
  - `angular.templates.extended-diagnostics-governance`
  - `angular.templates.extended-diagnostics-remediation`
  - `angular.templates.strict-templates-adoption`
  - `angular.templates.template-diagnostics-matrix`
  - `angular.upgrades.templates.angular-extended-diagnostics-upgrade-gate`
- Limpieza del catálogo:
  - Retiradas carpetas provisionales `skills/git/`
  - Retirados `.gitkeep` provisionales de carpetas con contenido

## 0.2.2 - 2026-05-01

### Añadido

- Ampliado catálogo con ruta de saltos desde Angular 2 hasta 21.
- Añadidas comprobaciones de compatibilidad, índice principal y mecanismos de selección de saltos.
- Añadidas guías de AngularJS, workspace, RxJS, HttpClient, Ivy, localize, router, SSR, service worker, pruebas, formularios, Material, zone, zoneless, resources, plantillas, DI e híbridos.
- Añadidas guías de modernización para control flow, `@defer`, standalone-first y preparación zoneless.
- Actualizados README e historial para explicar la estructura de versiones.

## 0.2.0 - 2026-05-01

### Añadido

- Ampliado catálogo con ruta de saltos desde Angular 2 hasta 21.
- Añadidas comprobaciones de compatibilidad, índice principal y mecanismos de selección de saltos.
- Añadidas guías de AngularJS, workspace, RxJS, HttpClient, Ivy, localize, router, SSR, service worker, pruebas, formularios, Material, zone, zoneless, resources, plantillas, DI e híbridos.
- Añadidas guías de modernización para control flow, `@defer`, standalone-first y preparación zoneless.
- Actualizados README e historial para explicar la estructura de versiones.

## 0.1.0 - 2026-04-30

### Añadido

- Estructura pública inicial.
- Plantilla oficial de skill.
- Esquema inicial de metadatos.
- Catálogo inicial con micro-skills Angular y TypeScript.
- Plantillas para agentes genéricos, Copilot, Claude, Codex, Cursor y Gemini.
- Scripts básicos de creación, validación, catálogo y exportación de adaptadores.
- Skills iniciales:
  - `angular.performance.onpush-change-detection`
  - `angular.performance.trackby-for-lists`
  - `angular.performance.avoid-template-functions`
  - `angular.rxjs.avoid-nested-subscriptions`
  - `typescript.strict-types.avoid-any`
