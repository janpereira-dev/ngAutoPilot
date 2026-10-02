# Guía del paquete npm 📦

<!-- docs:navigation:start -->
[English](npm-package-guide.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

El paquete npm es la distribución entre agentes. Incluye CLI, catálogo, packs, adaptadores, skills, artefactos Agent Plugins, entrada MCP y documentación pública para inspeccionar o instalar sin clonar el repositorio.

Los ejemplos sin versión utilizan el paquete disponible en el registro. Las funciones descritas corresponden al checkout documentado; no supongas que están publicadas sin verificar la versión exacta.

## Uso puntual y global

```bash
npm exec --package=ngautopilot -- ngautopilot doctor
npm exec --package=ngautopilot -- ngautopilot packs
npm install --global ngautopilot
ngautopilot help
```

Fija una versión exacta para automatización reproducible. En CI utiliza `npm exec` y evita depender de instalaciones globales.

## Verificar un artefacto

```bash
npm run release:validate
npm pack --dry-run --json
```

La lista `package.json#files` determina el contenido. Confirma `bin/`, `lib/`, `mcp/`, `skills/`, `packs/`, `adapters/`, `agent-plugins/`, `docs/` y metadatos de release. No debe incluir `skill-lab/`. Comprueba también las ediciones inglesas y españolas de la documentación pública.

Para una comprobación E2E local, crea el tarball fuera de los fixtures, instálalo en un proyecto temporal y ejecuta `npm exec -- ngautopilot doctor` desde ese proyecto. No añadas tarballs ni `node_modules/` a Git.

## Instalar un pack específico

```bash
ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --dry-run
ngautopilot install --agent codex --pack ngautopilot-angular-5-to-6 --scope project --yes
ngautopilot verify --agent codex --scope project
```

Codex coloca las skills de proyecto en `.agents/skills/` y las instrucciones gestionadas en `AGENTS.md` raíz. En ámbito usuario utiliza `~/.agents/skills/` y `~/.codex/AGENTS.md`. El registro del servidor stdio MCP es independiente; consulta la [guía MCP](mcp-and-chatgpt.es.md).

Ejecuta `ngautopilot packs --json` antes de seleccionar. Los packs con nombre son adecuados para un pack o salto exacto. Para instalar según el proyecto Angular utiliza el modo mutuamente excluyente `--angular`:

```bash
ngautopilot install --agent codex --angular 22 --profile essentials --scope project --dry-run
ngautopilot install --agent codex --angular 22 --profile essentials --scope project --yes
```

Los perfiles son `essentials`, `architecture`, `performance`, `testing`, `migration` y `core`. Puedes elegir capacidades específicas, por ejemplo `--profile testing --capabilities ui,testing`, revisando primero un dry-run de esa misma selección. `--profile` y `--capabilities` requieren `--angular` y no se combinan con `--pack`. `--dry-run` no escribe; `--yes` aprueba la escritura.

Haz una copia de los archivos gestionados que hayas editado antes de actualizar o cambiar packs: la reinstalación rechaza reemplazar cambios locales salvo force explícito. Consulta [actualización](updating.es.md).

## Migración y planificación

Son comprobaciones controladas por evidencias, no transformadores de código:

```bash
ngautopilot migrate setup --from 12 --to 22 --agent codex --yes
ngautopilot migrate run --plan .ngautopilot/migration-plan.json --agent codex --yes
ngautopilot migrate resume --run <run-id> --agent codex --yes
ngautopilot work plan --goal "Inspect Angular tests" --agent codex --yes --dry-run
```

`migrate setup` (también `migrador`) crea solo un plan aprobado. `migrate run` valida como máximo un salto y se detiene en `awaiting-executor` si no existe transformador autorizado. `resume` revalida el checkpoint y no elude una comprobación fallida o bloqueada. `work plan` es una asignación de solo lectura, sujeta a aprobación y limitada a inventario, inspección, validación e informe.
