# Diseño histórico de Agent Plugins NgAutoPilot 0.6.0

<!-- docs:navigation:start -->
[English](2026-08-09-agent-plugins-0-6-design.md) · [Mapa](../../README.es.md) · [Inicio](../../../README.es.md)

> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.

<!-- docs:navigation:end -->

## Objetivo

Entregar una vista previa completa de Agent Plugins 1.0 sin sustituir bundles, adaptadores ni marketplaces específicos. `skills/` sigue siendo canónico y `packs/` pasa a ser la única política de selección de plugins portables.

## Alcance

Generar cuatro plugins de skills:

- `ngautopilot-core`
- `ngautopilot-angular-architecture`
- `ngautopilot-angular-testing`
- `ngautopilot-angular-21-to-22`

Generar un plugin MCP separado de solo lectura: `ngautopilot-tools`.

Incluir validación portable, ZIP reproducibles con SHA-256, trazabilidad desde origen, documentación, integración de release y sincronización a `0.6.0`.

No reducir adaptadores, retirar marketplaces, añadir validación de instalación por cliente ni herramientas MCP que modifiquen datos.

## Arquitectura

```text
skills/ + packs/
  -> lib/agent-plugins/
  -> agent-plugins.config.json
  -> agent-plugins/<plugin>/
  -> dist/agent-plugins/*.zip + SHA256SUMS
```

`agent-plugins.config.json` declara identidad, ID del pack y estado habilitado. Las listas se derivan de dependencias y prefijos del catálogo. Cada plugin especializado contiene sus skills Core transitivas.

`plugins/`, `.agents/plugins/marketplace.json`, `.claude-plugin/marketplace.json`, adaptadores y flujo CLI siguen independientes y sin cambios de comportamiento.

## Formato portable

Cada plugin de skills contiene:

```text
plugin.json
skills/<portable-skill-name>/SKILL.md
```

`plugin.json` utiliza esquema Agent Plugins `1.0.0` y solo campos raíz válidos. El descubrimiento utiliza `skills/` fijo; no se emite un campo de manifiesto `skills`.

El generador copia todo el directorio de la skill y sustituye únicamente el frontmatter de `SKILL.md`. Los nombres portables se derivan de los ID canónicos: minúsculas y caracteres no alfanuméricos convertidos a un guion. Se rechazan nombres vacíos, de más de 64 caracteres o en colisión. Los metadatos de origen se conservan como cadenas en `metadata`.

## Plugin MCP

`ngautopilot-tools` es un plugin separado con `plugin.json` y `mcp.json` raíz, `bin/server.mjs` autosuficiente y una skill operativa. El origen utiliza paquetes MCP SDK v2 (`@modelcontextprotocol/server` y `@modelcontextprotocol/client`) y Zod sobre Node 24; el bundle incluye dependencias de runtime.

El diseño original expone estas herramientas deterministas de solo lectura:

- `catalog.search`
- `pack.list`
- `pack.resolve`
- `project.inspect`
- `stack.detect`
- `skill.route`
- `compatibility.check`
- `upgrade.plan`
- `repository.validate`

Reutiliza funciones internas de catálogo, packs, stack, selección y validación cuando es práctico. No modifica repositorios, instala dependencias, ejecuta actualizaciones, accede a secretos ni escribe Git.

`mcp.json` utiliza `stdio`, un comando contenido en el plugin, `${PLUGIN_ROOT}` para recursos y `${PLUGIN_DATA}` solo para datos persistentes aportados por el cliente. No incluye credenciales, headers ni configuración ambiental.

## Límites de seguridad y fallo

- Toda ruta copiada, descubierta o lanzada debe resolverse dentro de la raíz del plugin.
- Symlinks, junctions y reparse points que escapen de la raíz hacen fallar generación o validación.
- Referencias relativas en skills portables deben resolverse dentro de su directorio.
- Un manifiesto inválido hace fallar ese plugin.
- Una skill inválida omite únicamente esa skill durante smoke.
- Una configuración MCP inválida deshabilita únicamente su validación MCP; los plugins de skills siguen independientes.
- El generador no lanza procesos MCP ni accede a la red.

## Validación

Pruebas y validación específicas cubren:

- Esquema, nombres y campos desconocidos de manifiestos.
- Frontmatter Agent Skills, coincidencia de directorio y metadatos solo de cadenas.
- Selección de packs y Core transitivo.
- Copia completa, colisiones, referencias y contención de rutas.
- Sync determinista y archivos reproducibles.
- Inventario y manifiesto SHA-256.
- MCP `tools/list`, llamadas válidas, entradas inválidas y ausencia de escrituras.
- Catálogo, bundles nativos, marketplaces, CLI y validaciones de release existentes.

`release:validate` añade sync y validación de Agent Plugins antes de empaquetar. Las pruebas de conformidad de navegador/editor/cliente quedan como actividad explícita de cierre fuera del cambio.

## Contrato de release

`0.6.0` es la versión NgAutoPilot, no la de Agent Plugins. La sincronización cubre paquete, catálogo, todas las skills, packs, bundles nativos, marketplaces, plugins portables, documentación y artefactos generados.

## Criterios de aceptación

- Cuatro plugins de skills basados en packs y un MCP separado en `agent-plugins/`.
- Ninguna lista portable manual fuera de packs.
- Skills generadas conformes a Agent Skills.
- Manifiestos conformes a Agent Plugins 1.0.
- Salidas nativas y marketplaces siguen válidos.
- Archivos deterministas y con checksum.
- Herramientas MCP de solo lectura, con esquema y pruebas.
- Validación de release correcta sin comprobaciones de instalación cliente por cliente.

**Referencia actual:** la [guía de vista previa](../../agent-plugins/overview.es.md) describe el conjunto de herramientas del checkout. El inventario de nueve herramientas anterior pertenece al diseño original.
