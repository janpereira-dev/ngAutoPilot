# Guía de mantenimiento 🛠️

<!-- docs:navigation:start -->
[English](maintainer-guide.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Valida, indexa, sincroniza, compara y revisa el diff generado y la lista completa de publicación.](../assets/ngautopilot-flow.es.svg)

Esta guía cubre mantenimiento del repositorio, gobierno del catálogo, empaquetado y publicación. El punto de entrada público sigue siendo el [README](../README.es.md).

## Ruta rápida

1. Edita la fuente adecuada, no un bundle generado.
2. Valida y regenera la distribución afectada.
3. Revisa diferencias y evidencia antes de publicar.

## Estructura

| Ubicación | Propósito |
| --- | --- |
| `skills/` | Catálogo original |
| `plugins/` | Bundles de distribución generados |
| `agent-plugins/` | Recursos portables generados |
| `adapters/` | Manifiestos y plantillas de clientes |
| `docs/` | Guías públicas y de mantenimiento |
| `.claude-plugin/marketplace.json` | Manifiesto Claude Code |
| `.agents/plugins/marketplace.json` | Manifiesto Codex |

## Reglas

Inspecciona antes de editar. Prefiere cambios pequeños y reversibles. No inventes APIs, comandos o compatibilidad. Separa saltos Angular de modernización. No añadas dependencias innecesarias. Conserva la separación entre originales y distribuciones.

## Validación central

```bash
npm run skills:validate
npm run skills:catalog
npm run plugins:sync
npm run agent-plugins:sync
npm run consistency:validate
npm run marketplaces:validate
npm run skills:publish:pack
npm run publish:validate
npm run pack:dry
```

Para documentación:

```bash
npm run docs:index
npm run docs:validate
```

Revisa el diff generado. Para publicar utiliza también el control amplio `npm run release:validate` y la [lista de publicación](release-checklist.es.md); estos comandos aislados no prueban publicación externa.

## Intención de los workflows

- `ci.yml`: generar catálogo y bundles, revisar diferencias, construir y validar paquetes.
- `release-gates.yml`: validar fuentes, cobertura, consistencia, marketplaces y empaquetado.
- `release.yml`: construir recursos; publicación npm únicamente por ejecución manual con la opción de publicar.
- Workflows de marketplace: validar manifiestos y raíces empaquetadas.

Verifica el archivo actual antes de afirmar que un paso se ejecuta: la configuración y el resultado real son evidencias distintas.

## Límites de documentación

El README presenta el proyecto. Primeros pasos y referencia CLI atienden al usuario. La lista de publicación describe operaciones de mantenimiento. Mantén detalles profundos fuera del README salvo que ayuden a empezar.

Los originales ingleses y compañeros `.es.md` deben mantenerse juntos. Conserva fechas y decisiones de registros históricos; no los presentes como capacidades actuales. No traduzcas instrucciones operativas de forma que cambien sus identificadores o descubrimiento.

## Manifiestos de fixtures de Skill Lab

Son datos de pruebas históricos, no proyectos npm. Guarda simulaciones como `package.fixture.json`, nunca `package.json`. No ejecutes gestores de paquetes ni crees lockfiles dentro de fixtures.

Esto conserva versiones históricas sin confundirlas con dependencias del producto. Revisa `npm pack --dry-run --json` y confirma que `skill-lab/` no aparece en el paquete.

## Marketplaces

Mantén las guías alineadas con la CLI disponible. Genera `plugins/` desde `skills/`; cada skill debe aparecer en al menos un bundle. Valida estructura Codex directamente y utiliza `claude plugin validate .` cuando esa CLI esté disponible.

No afirmes publicación en un marketplace externo cuando solo hayas creado recursos deterministas para envío. [Packs](packs.es.md) · [Arquitectura](ecosystem-architecture.es.md).

## Mantener los gráficos de documentación

Los diagramas SVG se generan desde `scripts/documentation-graphics.mjs`, con una edición inglesa y otra española. No necesitan fuentes remotas ni dependencias. Cambia los textos y la composición en ese archivo, no en las copias SVG.

```bash
node scripts/documentation-graphics.mjs
node scripts/documentation-graphics.mjs --check
npm run docs:validate
```

Comprueba ambas ediciones a tamaño de lectura. Conserva el texto alternativo, el contraste y el contenido equivalente en Markdown. Solo el indicador de la ruta usa una animación decorativa de una pasada, desactivada con movimiento reducido. El resto es estático.
