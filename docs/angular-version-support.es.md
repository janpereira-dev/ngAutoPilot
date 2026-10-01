# Cobertura de versiones Angular 🧭

<!-- docs:navigation:start -->
[English](angular-version-support.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**La cobertura del catálogo no equivale al soporte del fabricante.** NgAutoPilot contiene guías para Angular 2 y 4–22, incluidos saltos históricos. Esto no convierte versiones fuera de soporte en versiones mantenidas por Angular ni certifica tu aplicación.

## Elige el siguiente paso

1. Inspecciona `package.json`, el archivo de bloqueo y la configuración del workspace.
2. Ejecuta la comprobación de compatibilidad para la **versión instalada y el destino previsto**.
3. Selecciona un salto y valida antes de continuar. Angular 2 → 4 es la excepción histórica porque no hubo una versión Angular 3.
4. Moderniza solo después de estabilizar el cambio de versión.

| Punto de partida | Ruta del catálogo | Qué significa |
| --- | --- | --- |
| Angular 2–12 | Saltos históricos, workspace, RxJS, HttpClient, Ivy e i18n | Procedimientos para proyectos antiguos; no garantía de dependencias mantenidas |
| Angular 12–15 | Guías específicas de librerías, router, formularios, Material y SSR | Revisión de cambios incompatibles concretos |
| Angular 15–19 | Saltos y comprobaciones de standalone, plantillas, Signals y runtime | Ajustar la madurez de las API a la versión detectada |
| Angular 20–21 | Saltos dedicados y guías por área | Verificar herramientas y contratos de API públicas |
| Angular 21 → 22 | `skills/angular/upgrades/21-to-22/` | Preflight, comprobación de cambios incompatibles, orquestador y evidencias posteriores |
| Ya en Angular 22 | [Guía Angular 22](angular-22-support.es.md) | Seleccionar por área y versión menor exacta |
| AngularJS / híbrido | `skills/angular/upgrades/angularjs/` | Migración gradual independiente, no salto entre versiones Angular |

Utiliza el [mapa por épocas](angular-version-era-map.es.md) para localizar carpetas y la [guía de rutas](angular-roadmap-guide.es.md) para elegir skills. Las skills son instrucciones para un agente autorizado, no transformadores ejecutables del código.

## Herramientas: dos requisitos diferentes

Este checkout de NgAutoPilot exige Node `>=24.0.0 <25`. La aplicación Angular tiene requisitos **propios**. Por ejemplo, la matriz oficial de Angular 22.0.x indica Node `^22.22.3 || ^24.15.0 || ^26.0.0`, TypeScript `>=6.0.0 <6.1.0` y RxJS `^6.5.3 || ^7.4.0`. Node 24.0 cumple el mínimo de esta CLI, pero **no** el de ese Angular 22.

Revisado el 2026-10-01 con la [matriz oficial de compatibilidad](https://angular.dev/reference/versions). Consulta sus filas actuales y la [política de soporte](https://angular.dev/reference/releases), en lugar de copiar un rango a una aplicación diferente.

## Cuándo detenerse

- No saltar varias versiones mayores en un único cambio sin validar.
- No recomendar API de Angular 22 antes de detectar la versión.
- No mezclar silenciosamente actualización, modernización, corrección y optimización.
- La presencia en el catálogo, una instalación correcta y un build verde son evidencias diferentes; siguen siendo necesarias las pruebas de la aplicación y la detección real por el agente.
