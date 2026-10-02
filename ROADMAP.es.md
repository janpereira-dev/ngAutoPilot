# Hoja de ruta de NgAutoPilot 🧭

<!-- docs:navigation:start -->
[English](ROADMAP.md) · [Mapa](docs/README.es.md) · [Inicio](README.es.md)

<!-- docs:navigation:end -->

**La cobertura se organiza por problema, no como una lista de promesas de versión.** Este documento distingue la dirección del catálogo de la entrega y verificación de una aplicación real.

## Enfoque actual: cobertura Angular 22

La dirección existente del catálogo incluye:

- Salto acotado 21 → 22 en `skills/angular/upgrades/21-to-22/`.
- Skills específicas por riesgo: detección de cambios, zoneless, formularios, recursos, HTTP, DI, router, plantillas, componentes, SSR, seguridad, accesibilidad, pruebas, herramientas, AI/MCP/WebMCP y formación.
- Índices de versión para selección de funcionalidades, matriz de riesgos, alineación con la hoja de ruta y salto 21 → 22.

La presencia de estas guías no demuestra que todas las APIs estén disponibles en una versión anterior ni que una aplicación haya sido migrada.

## Reglas de trabajo

1. Un salto actualiza la versión mayor; una skill específica aborda un riesgo concreto.
2. Moderniza después de estabilizar, salvo petición explícita.
3. Prioriza fuentes oficiales Angular sobre artículos secundarios.
4. Mantén WebMCP sujeto a revisión de seguridad y estado experimental hasta verificar el contrato oficial correspondiente.

## Prioridades de la próxima publicación

- Mantener catálogo y bundles sincronizados.
- Validar manifiestos después de ampliar el catálogo.
- Añadir ejemplos donde mejoren selección o validación.
- Preferir skills pequeñas para ejecución; las guías generales sirven de marco.
- Mantener documentación inglesa y española con el mismo alcance y límites.

[Versiones Angular](docs/angular-version-support.es.md) · [Lista de publicación](docs/release-checklist.es.md).
