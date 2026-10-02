# Mantenimiento de adaptadores y exportaciones nativas

<!-- docs:navigation:start -->
[English](adapter-maintenance.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

## Contrato autorizado

`adapters/native-layouts.json` define las exportaciones nativas de proyecto para los diez adaptadores. Cada entrada enlaza documentación del proveedor. Las pruebas independientes de `tests/installer/exporter.test.mjs` ejecutan la CLI y comprueban frontmatter portátil, recursos, hashes, repetición y rechazo de conflictos.

| Adaptador | Raíz de skills exportadas | Instrucciones |
| --- | --- | --- |
| Claude Code | `.claude/skills` | `CLAUDE.md` |
| Codex | `.agents/skills` | `AGENTS.md` |
| Copilot | `.github/skills` | `.github/copilot-instructions.md` |
| Cursor | `.cursor/skills` | `AGENTS.md` |
| Gemini | `.gemini/skills` | `GEMINI.md` |
| Genérico | `skills` | `AGENTS.md` |
| Hermes | `.hermes/skills` | `AGENTS.md` |
| OpenClaw | `skills` | `AGENTS.md` |
| OpenCode | `.opencode/skills` | `AGENTS.md` |
| Pi | `.agents/skills` | `AGENTS.md` |

OpenClaw utiliza el workspace configurado del agente, no su directorio de configuración. Hermes exige confianza explícita en el proyecto. El consumidor define el descubrimiento genérico. Exportar no concede confianza, inicia agentes ni demuestra compatibilidad de ejecución.

Ambas entradas usan el mismo motor:

~~~bash
ngautopilot export --agent copilot --pack ngautopilot-angular-testing --output ./copilot-export --json
npm run skills:export -- copilot ngautopilot-angular-testing ./copilot-export
~~~

El destino es una instantánea con forma de proyecto. Revísala antes de copiarla y combina las instrucciones sin reemplazar las existentes. Exportar no instala: `.ngautopilot-export.json` registra checksums, pero `uninstall` no lo consume. No se exportan configuraciones nativas de subagentes: sus roles Markdown no equivalen a los esquemas de cada host.

Las skills se aplanan por ID portátil estable para evitar ambigüedad y colisiones. Los nombres de más de 64 caracteres reciben un prefijo abreviado y un sufijo SHA-256 de 12 caracteres. Los metadatos conservan el ID original. Los recursos mantienen sus bytes; las referencias públicas externas se empaquetan y reescriben como enlaces locales. El árbol fuente no se modifica ni renombra. Los enlaces a código operativo permanecen como enlaces al repositorio de la versión, no como copias ejecutables.

## Instalaciones existentes y migración

Los layouts históricos de `install` y los de exportación nativa son contratos separados. Codex ya separa raíces de proyecto y usuario; otros adaptadores pueden conservar ubicaciones históricas. La matriz histórica no demuestra carga nativa actual. OpenCode y OpenClaw generan `AGENTS.md`, nunca Markdown presentado como configuración JSON.

No reemplaces una instalación con una exportación sin una migración: identifica el manifiesto anterior, respalda bytes originales, mapea rutas, compara checksums, preserva cambios e instrucciones ajenas, rechaza conflictos y prueba verify/uninstall/restore en ambas raíces. Cambiar solamente la ruta del manifiesto puede dejar archivos sin propietario.

## Revisión trimestral

`.github/workflows/adapter-audit.yml` corre a las 09:00 UTC el 1 de enero, abril, julio y octubre y admite ejecución manual. Abre una incidencia de seguimiento si no existe otra abierta. Su responsable debe:

1. Releer todas las fuentes oficiales: confianza, precedencia, alcance, nombres y carga de instrucciones.
2. Registrar versiones y cambios. Actualizar `reviewedOn` solo después de revisar los diez adaptadores.
3. Cambiar registro, tabla y aserciones independientes conjuntamente.
4. Ejecutar `node scripts/audit-adapters.mjs --check-age`, `npm run test:scripts` y `npm test`.
5. Adjuntar descubrimiento e invocación reales cuando cambie una afirmación de soporte; sin evidencia mantener `hostInvocation: not-verified`.
6. Cerrar la incidencia solo cuando se integre el cambio con evidencia.

El script valida cobertura y genera una lista de revisión; no consulta automáticamente las páginas, deduce soporte ni renueva fechas. `--check-age` falla después de 100 días. La programación se activa al integrar el workflow en la rama predeterminada.

Las instrucciones nativas usan `adapters/native-instructions.template.md` y `NGAUTOPILOT-CATALOG.json`, con rutas a las skills emitidas. No copian rutas históricas ni subagentes ausentes. El enlace al catálogo es relativo a las instrucciones, incluida la carpeta anidada de Copilot.
