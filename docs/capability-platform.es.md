# Plataforma de capacidades NgAutoPilot

<!-- docs:navigation:start -->
[English](capability-platform.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

NgAutoPilot no es una lista plana de prompts: separa cinco superficies.

1. **Skills fuente:** procedimientos pequeños y revisables.
2. **Packs:** subconjuntos acotados para una tarea o un salto de actualización.
3. **Adaptadores y subagentes:** layouts específicos del host y revisión independiente opcional.
4. **MCP de solo lectura:** catálogo, cobertura, rutas, resolución y validación del repositorio.
5. **Manifiestos de distribución:** misma política fuente, sin afirmar verificación nativa universal.

Un marketplace puede descubrir `SKILL.md`, pero no aplicar la selección de packs ni mostrar todos los activos que no son skills. La CLI npm y el MCP son las entradas autorizadas para resolver selecciones según la versión.

## Contrato de soporte Angular

Se admiten Angular 2 a 22. Angular 3 no fue publicado; el primer salto histórico es `2 -> 4`. La actualización se hace salto a salto y no implica modernización.

Para trabajo cotidiano, resuelve skills compatibles a partir de evidencia local:

~~~bash
npm exec --package=ngautopilot -- ngautopilot angular --profile core --capabilities ui,testing --json
~~~

Lee el `package.json` más cercano y un lockfile compatible cuando existe; informa el nivel de evidencia y explica inclusiones y exclusiones. No escribe archivos ni activa migraciones. Una actualización exige el salto explícito:

~~~bash
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-12-to-13 --dry-run
~~~

Perfiles: `core`, `essentials`, `architecture`, `performance`, `testing`, `migration`. Capacidades opcionales: `foundations`, `runtime`, `state`, `testing`, `ui`. El informe filtrado no es un plan de instalación: `sourcePacks` explica la procedencia, pero sus packs sin filtrar no deben instalarse directamente cuando hay exclusiones. La CLI admite `install --angular <major.minor> --profile <perfil>` para construir un plan con la selección filtrada, sin incorporar las skills excluidas. Las migraciones siguen usando packs de salto explícito.

## Contrato de nombres

Los IDs son estables y tienen espacio de nombres, como `core.risk-assessment` y `angular.versioning.angular-version-gates`. Los títulos reflejan el dominio real: Core coordina distintas tecnologías; Angular declara compatibilidad cuando sus APIs lo exigen; Frontend, TypeScript, JavaScript, CSS y calidad no se presentan como exclusivos de Angular.

Esto conserva el descubrimiento y la compatibilidad de activos, plugins y URLs. Las páginas deben mostrar espacio de nombres y contexto del pack, no efectuar renombrados masivos que rompan contratos.

## Contrato MCP

`ngautopilot-tools` es de solo lectura. `platform.inventory` lista skills, saltos Angular, packs, adaptadores, subagentes, distribución y señales estructurales. `angular.installation.resolve` resuelve evidencia de un proyecto local; `angular.resolve` usa una instantánea enviada por el cliente sin leer sus rutas. `upgrade.plan` planifica saltos explícitos y `catalog.quality` informa señales deterministas. También hay búsqueda, rutas, packs, stack, compatibilidad y consistencia: 13 herramientas en total.

El inventario representa el contrato de `package.json`, no los archivos visibles en cada artefacto. Manifiesto de repositorio, fuente y entrega npm/plugin no equivalen a publicación remota. La calidad estructural no certifica valor semántico; promover orientación requiere benchmarks, pruebas adversariales y revisión humana de [Skill Lab](../skill-lab/README.es.md).

## Veracidad de adaptadores y distribución

`ngautopilot adapters --json` lista los diez IDs y su estado. Nativo, adaptado, experimental, no verificado y solo exportación no son intercambiables. Existen manifiestos Claude/Codex, una fuente OpenAI solo con skills y adaptadores Copilot, Cursor, Gemini, Hermes, OpenClaw, OpenCode, Pi y genérico. Un manifiesto no demuestra aceptación de un marketplace.

## Incorporación de investigación local

`/info/` está ignorado y debe permanecer local; no se lee, indexa, empaqueta ni sube automáticamente. Antes de incorporar material externo:

1. Elimina credenciales, tokens, datos personales, hosts internos, nombres de clientes, código privado y contenido sin licencia.
2. Registra origen, fecha, permiso/licencia y afirmación pública respaldada.
3. Añade pruebas y fixtures deterministas únicamente con material saneado.
4. Ejecuta seguridad, catálogo, distribución y los gates de Skill Lab pertinentes.

## Angular 23 y posteriores

Verifica restricciones publicadas en fuentes Angular; añade el salto anterior al nuevo major solo con hechos y fixtures; crea satélites limitados para cambios reales; declara compatibilidad y selección; añade pruebas resolver/MCP/CLI, regenera catálogo y plugins y actualiza el mapa; valida el release y publica únicamente superficies comprobadas. No reescribas skills antiguas ni deduzcas compatibilidad de una versión más nueva.
