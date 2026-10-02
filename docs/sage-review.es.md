# Revisión orientada a Sage: primero expediente, después revisión externa

<!-- docs:navigation:start -->
[English](sage-review.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

NgAutoPilot puede generar un expediente de revisión de instrucciones, workflows y automatización de publicación. **Generarlo no ejecuta un revisor externo ni certifica seguridad.**

## Cuándo utilizarlo

Revisa cambios en `skills/**/SKILL.md`, `adapters/**`, `.github/workflows/**`, `scripts/*.mjs`, `catalog.json`, bundles de publicación y automatización de releases.

Busca ejecución insegura, dependencia oculta de un proveedor, copias demasiado amplias, exposición de secretos en workflows, archivos publicados por error e instrucciones permisivas. Revisa escrituras, acceso a URL e instalación de paquetes como límites de confianza separados.

## Tres pasos

1. Genera desde el repositorio:

   ```bash
   npm run review:sage:pack
   ```

2. Inspecciona `dist/review/sage/`. Revisa su contenido y elimina información sensible antes de compartir con un servicio externo.
3. Si utilizas Sage, envía el expediente mediante una integración instalada y autorizada. Verifica su soporte actual y política de datos; este repositorio no instala ni autentica ese servicio.

Registra el resultado externo por separado de la creación del expediente. Una integración ausente es un paso pendiente, no una aprobación automática.

## Mantén las validaciones deterministas

Sage u otro revisor externo complementa, pero no sustituye:

- `npm run skills:validate`
- `npm run skills:catalog`
- `npm run skills:publish:pack` cuando cambia el contenido publicado

Utiliza los hallazgos para inspeccionar comportamientos concretos antes de una PR. El veredicto de un proveedor no equivale a certificación de seguridad.
