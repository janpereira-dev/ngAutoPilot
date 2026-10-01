# Modelo de seguridad de NgAutoPilot 🛡️

<!-- docs:navigation:start -->
[English](security-model.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**Leer una guía no concede permiso para ejecutar sus recomendaciones.** Revisa tanto el contenido como la operación real, los archivos afectados y la distribución.

## Ruta rápida

1. Clasifica la acción y la información que manejará.
2. Revisa límites, autorización y copia de seguridad.
3. Valida contenido y paquete; comunica lo que no se comprobó.

## Superficie de riesgo

| Superficie | Pregunta |
| --- | --- |
| Contenido de skills | ¿Podría orientar al agente a una acción insegura? |
| Instalador | ¿Puede sobrescribir trabajo o escapar de una ruta permitida? |
| Dependencias | ¿Existen vulnerabilidades o riesgos de suministro? |
| Distribución | ¿Se incluyen secretos, rutas privadas o archivos no previstos? |

## 1. Contenido

Las skills son Markdown: orientan, no ejecutan directamente. Se revisan mediante `npm run skills:validate`, `npm run skills:validate:frontmatter` y `npm run security:scan`.

No deben recomendar ejecución de scripts remotos no confiables, paquetes no revisados, credenciales incrustadas ni rutas privadas. Evita suposiciones de sistema operativo, shell o rutas absolutas. [Niveles de confianza](trust-levels.es.md).

`security:scan` es un control determinista sobre fuentes, agentes, adaptadores, packs, scripts, documentación y workflows. Detecta marcadores de conflicto, controles Unicode invisibles o bidireccionales, ejecución remota mediante pipelines shell/PowerShell, material con forma de credencial o clave privada y permisos shell demasiado amplios en frontmatter. Es defensa adicional, no prueba de seguridad semántica de toda la prosa.

La revisión externa opcional mediante [NVIDIA SkillSpector](https://github.com/NVIDIA/skillspector) debe respetar el proveedor y la política de salida de datos. Comprueba las opciones de su versión instalada. No envíes contenido sensible o sin publicar a un modelo externo sin revisión explícita.

## 2. Instalación

- `adapters/_shared/safe-fs.mjs` comprueba que las rutas resueltas permanezcan dentro de la raíz prevista.
- Las comprobaciones de enlaces simbólicos utilizan `lstatSync` y `realpathSync`.
- Los archivos no gestionados no se sobrescriben sin `--force`.
- La aplicación y eliminación se limitan a las raíces del adaptador; las copias de seguridad tienen un destino temporal separado.
- Codex: proyecto `.agents/skills/` y `AGENTS.md` raíz; usuario `~/.agents/skills/` y `~/.codex/AGENTS.md`.
- Se conservan archivos gestionados y secciones editadas salvo force explícito; se informa el conflicto y se retiene el checksum original.
- No hay `postinstall` en `package.json`; la instalación usa APIs de archivos Node, no shell.
- `.ngautopilot-manifest.json` registra propiedad y sumas SHA-256; la desinstalación utiliza ese manifiesto.

La propiedad de un archivo no protege sus personalizaciones frente a una actualización.

## 3. Dependencias

CLI e instalador usan APIs integradas Node. El MCP opcional añade `@modelcontextprotocol/server` y `zod`. Las herramientas de desarrollo incluyen `@modelcontextprotocol/client`, `esbuild` y `yazl` para pruebas y archivos reproducibles.

El paquete no define `postinstall`, `preinstall` ni `prepare`. Esto no elimina la necesidad de revisar dependencias y scripts de otras herramientas.

## 4. Distribución

`package.json#files` define lo que se empaqueta. Las reglas Git y npm tienen propósitos distintos: no deduzcas exclusión del paquete solo por `.gitignore`.

Revisa `npm pack --dry-run --json` antes de publicar. `.gitattributes` define normalización de líneas, pero no demuestra contenido ni ausencia de secretos.

## Respuesta a incidentes

1. Retira de fuentes y distribuciones la skill que oriente a una acción insegura.
2. Valida catálogo y bundles antes de publicar la corrección autorizada.
3. Registra incidente y mitigación en el historial o aviso cuando proceda.

El catálogo activo acepta solo skills `stable`; no hay estado publicable `blocked` o `experimental` en la validación actual.

[Política de avisos](../SECURITY.es.md) · [Lista de publicación](release-checklist.es.md).
