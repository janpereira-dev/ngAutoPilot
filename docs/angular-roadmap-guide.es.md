# Catálogo Angular: elige una ruta 🧭

<!-- docs:navigation:start -->
[English](angular-roadmap-guide.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**Detectar → comprobar → un salto → validar.** Esta guía orienta hacia las skills de origen; no promete que instalar un pack migre una aplicación.

## Empieza aquí

1. Reúne contexto con `skills/_core/project-intake/SKILL.md`.
2. Detecta stack y versiones con `skills/_core/stack-version-detection/SKILL.md`.
3. Selecciona la ruta mediante `skills/angular/versioning/angular-versioning-index/SKILL.md`.
4. Aplica `skills/angular/versioning/angular-version-compatibility-gate/SKILL.md`.
5. Elige solo el siguiente salto y las guías específicas exigidas por riesgos reales.
6. Valida build, pruebas, routing, SSR y Material cuando existan. Crea un commit solo con autorización.
7. Repite únicamente tras estabilizar el cambio; moderniza en una tarea separada.

Consulta el [mapa por épocas](angular-version-era-map.es.md) y la [política de versiones](angular-version-support.es.md) para carpetas y límites de soporte.

## Versiones: tres funciones diferentes

| Skill | Función | Evidencia esperada |
| --- | --- | --- |
| `angular.versioning.angular-version-gates` | Selección ligera por compatibilidad | Perfil detectado, API permitidas y ruta futura si las modernas no están disponibles |
| `angular.versioning.angular-version-compatibility-gate` | Decisión formal de compatibilidad | Rangos Node, TypeScript, RxJS, CLI y navegadores; bloqueos, guías y siguiente salto seguro |
| `angular.versioning.angular-versioning-index` | Navegación principal | Próxima skill y separación entre comprobación, salto y modernización |

## Saltos de actualización

Desde `angular.upgrade.hops.angular-2-to-4` hasta `angular.upgrade.hops.angular-20-to-21` se describe la ruta histórica. Son procedimientos para un agente autorizado, **no transformadores ejecutables de código**. Angular 2 → 4 es la excepción histórica de numeración; en los demás casos avanza una versión mayor, detente en el destino, documenta bloqueos y valida antes del siguiente salto.

Para **21 → 22**, utiliza `skills/angular/upgrades/21-to-22/angular-21-to-22-upgrade-orchestrator/SKILL.md`. Completa preflight y la comprobación de cambios incompatibles antes de una actualización autorizada y reúne evidencias posteriores. El [README del salto](../skills/angular/upgrades/21-to-22/README.es.md) indica el orden de lectura.

## Guías específicas: añade solo lo necesario

| Área / familia | Qué inspeccionar | Resultado |
| --- | --- | --- |
| `angular.upgrade.angularjs.*` | Inventario antiguo, arranque híbrido, plantillas, controladores, servicios, directivas, filtros, routing y API upgrade/downgrade | Salida gradual de AngularJS, límites híbridos y criterios de retirada |
| `angular.upgrade.workspace.angular-cli-workspace-migration-v6` | Configuración antigua → `angular.json` | Base de workspace para Angular 6+ |
| `angular.upgrade.rxjs.angular-rxjs-5-to-6-bridge` | Transición RxJS 5 → 6 | Menos bloqueos por paquetes antiguos |
| `angular.upgrade.http.angular-httpclient-migration-v6` | `Http` / `HttpModule` → `HttpClient` | Base HTTP compatible |
| `angular.upgrade.ivy.*`; `angular.upgrade.libraries.angular-view-engine-library-audit-v13`; `angular.upgrade.libraries.angular-ngcc-view-engine-removal-v16`; `angular.upgrade.i18n.angular-localize-v9-migration` | Preparación Ivy, dependencias View Engine/ngcc y herramientas localize | Riesgos de librerías explícitos para Angular 9+, 13+ y 16+ |
| `angular.upgrade.router.*` | Lazy routes con import dinámico, API públicas, redirecciones, errores, resolvers y validación | Navegación ajustada al destino sin regresiones ocultas |
| `angular.upgrade.ssr.*`; `angular.upgrade.service-worker.*` | Renderizado servidor, transfer state, platform-server y actualizaciones | Compatibilidad SSR y service worker explícita |
| `angular.upgrade.testing.*` | TestBed, tiempos, detección de cambios, router, SSR, animaciones y fakeAsync | Pruebas menos frágiles y evidencia más allá del build verde |
| `angular.upgrade.forms.*` | Puente typed/untyped, escrituras ngModel, validación numérica y form arrays | Seguridad de tipos y migración acotada |
| `angular.upgrade.material.*` | Inventario MDC, temas, densidad, overlays, harnesses y regresión visual | Cambio Material acotado con evidencia visual |
| `angular.upgrade.zone.*`; `angular.upgrade.zoneless.*` | Imports Zone.js, providers raíz y API zoneless preparadas/renombradas | Configuración correcta de runtime |
| `angular.upgrade.signals.*`; `angular.upgrade.resources.*` | Mutación de Signals y cambios resource/rxResource | Contratos de reactividad compatibles |
| `angular.upgrade.templates.*`; `angular.upgrade.components.*` | Operadores, creación dinámica y nodos proyectables | Comportamiento correcto de plantillas y componentes |
| `angular.upgrade.di.*`; `angular.upgrade.debug.*` | DI obsoleta y dependencias de atributos debug | Retirada de supuestos no compatibles |

## Moderniza después

`angular.modernization.*` cubre control flow, `@defer`, standalone-first y preparación zoneless. La disponibilidad sigue dependiendo de la versión. No amplíes una actualización solo porque exista un patrón más nuevo.

## ¿Ya estás en Angular 22?

Lee la [guía de API concretas](angular-22-support.es.md) y elige una skill `angular-v22-*` del área correspondiente:

`skills/angular/build/`, `components/`, `forms/`, `modules/`, `resources/`, `router/`, `security/`, `signals/`, `ssr/`, `templates/`, `testing/`, `zone/` o `zoneless/` (todas bajo `skills/angular/`).

Utiliza los índices de versiones para selección, matriz de riesgos y hoja de ruta. No crees un árbol genérico `skills/angular/v22/` ni supongas que una restricción a versión mayor 22 demuestra disponibilidad en todas las menores.

## Comprobación final

- [ ] Versiones del proyecto y destino respaldadas por evidencias.
- [ ] Un salto y solo las guías necesarias seleccionados.
- [ ] Actualización y modernización separadas.
- [ ] Comprobaciones relevantes ejecutadas; omisiones y bloqueos explícitos.
- [ ] Commit, push o publicación autorizados por separado.
