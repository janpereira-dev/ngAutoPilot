# Informe de extracción Angular Can I Use

<!-- docs:navigation:start -->
[English](README.md) · [Mapa](../README.es.md) · [Inicio](../../README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

Generado el: 2026-07-05T19:48:27.842Z

Esta es una instantánea histórica de una fuente secundaria, no la matriz oficial de compatibilidad de Angular ni una verificación actual de las API.

## Recuentos

| Sección | Esperado | Real | Fuente |
| --- | ---: | ---: | --- |
| Features | 220 | 220 | https://www.angular.courses/caniuse?tab=features |
| Diff | 220 | 220 | https://www.angular.courses/caniuse?tab=diff |
| Migrations | 13 | 13 | https://www.angular.courses/caniuse?tab=migrations |
| Update | 112 | 112 | https://www.angular.courses/caniuse?tab=update |
| MCP | 14 | 14 | https://www.angular.courses/caniuse?tab=mcp |
| ESLint | 88 | 88 | https://www.angular.courses/caniuse?tab=eslint |

## Artefactos

- `angular-caniuse.normalized.csv`: tabla plana con las columnas solicitadas.
- `angular-caniuse.normalized.json`: mismos datos con metadatos de extracción por fila.
- `*.raw.json`: instantáneas originales de las secciones.
- `manifest.json`: recuentos, fechas y URL de origen.
- `scrape-angular-caniuse.mjs`: extractor reproducible con Playwright.

## Límites conocidos

- Features y Diff se extraen del bloque de datos Angular Courses del cliente porque la tabla renderizada solo muestra parte de las 220 filas a la vez.
- Las migraciones Update exponen URL por elemento, guardadas en `angular_courses_url`.
- Las migraciones CLI exponen enlaces Angular cuando existen, guardados en `angular_dev_url`.
- Las filas MCP no ofrecen anclas estables por elemento; se registra la URL de la pestaña.

## Repetir la extracción

El repositorio no añade Playwright como dependencia solo para la instantánea. Para actualizar datos, instala Playwright deliberadamente y ejecuta:

```bash
npm i -D playwright
npx playwright install chromium
node docs/angular-caniuse/scrape-angular-caniuse.mjs
```

Preferiblemente utiliza un clon temporal dedicado. Si instalas en tu checkout, revisa únicamente los cambios de dependencias creados por este refresco; no reviertas cambios previos o ajenos.
