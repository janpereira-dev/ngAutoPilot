# Arquitectura del ecosistema NgAutoPilot 🧩

<!-- docs:navigation:start -->
[English](ecosystem-architecture.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Las fuentes canónicas alimentan el catálogo, los bundles nativos y los paquetes portables; edita fuentes, no copias generadas.](../assets/catalog-map.es.svg)

**Una capacidad se mantiene una vez; las distribuciones se generan.** Utiliza este mapa para decidir dónde editar y qué regenerar.

## Ruta rápida

1. Identifica si el cambio corresponde a una skill, selección de pack o adaptador.
2. Edita la fuente canónica, no una copia de plugin.
3. Regenera y valida el catálogo y las distribuciones afectadas.

## Fuente única

| Ubicación | Responsabilidad |
| --- | --- |
| `skills/` | Fuentes Markdown `SKILL.md` |
| `agents/ngautopilot/` | Definiciones canónicas de roles |
| `adapters/` | Manifiestos, plantillas y núcleo compartido de instalación |
| `packs/` | Selecciones declarativas JSON |
| `plugins/` | Bundles generados desde skills |
| `agent-plugins/` | Distribución portable generada |
| `schemas/` | Esquemas de skills, packs, adaptadores y manifiestos |
| `catalog.json` | Índice generado; no editar manualmente |

## Generación

```text
skills/**/SKILL.md
  → skills:validate / skills:validate:frontmatter
  → skills:catalog → catalog.json
  → plugins:sync / agent-plugins:sync
  → consistency:validate / marketplaces:validate
```

Las validaciones estructurales no demuestran que un agente haya seguido correctamente una guía. Conserva esa evidencia por separado.

## Instalación

```text
packs/<pack-id>.json
  → buildPlan(): dependencias, prefijos de ID, destinos
  → applyPlan(): copia segura y sección gestionada
  → <install-root>/.ngautopilot-manifest.json
```

El catálogo describe capacidades; los packs las seleccionan. El plan combina esa selección con el adaptador:

```text
skills → catalog.json → pack → plan → instalador
                                     ├─ Codex: .agents/skills/ + AGENTS.md raíz
                                     ├─ Claude: .claude/
                                     └─ OpenCode: .opencode/
```

Cada instalación registra su propio manifiesto en la raíz seleccionada. Crea una copia antes de modificar una instalación existente.

## Contrato de adaptador

Cada directorio contiene `manifest.json`: identificador, ámbitos, rutas, formatos y estado. Puede incluir una plantilla de instrucciones.

El núcleo `adapters/_shared/` contiene:

- `safe-fs.mjs`: límites de rutas y detección de escapes mediante enlaces simbólicos.
- `adapter-core.mjs`: carga y detección de adaptadores.
- `planner.mjs`: planificación desde pack, catálogo y adaptador.
- `installer.mjs`: respaldo, aplicación, verificación, eliminación y restauración.

## Regla central

```text
Las skills describen procedimientos.
Los adaptadores transforman el formato.
Los packs seleccionan y resuelven dependencias.
Los plugins distribuyen.
El catálogo indexa.
El instalador aplica.
```

[Instalación](installation.es.md) · [Mantenimiento](maintainer-guide.es.md).
