# Instalación: inspeccionar → aprobar → verificar 🎒

<!-- docs:navigation:start -->
[English](installation.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Cuatro controles: elegir IDs, previsualizar sin escribir, autorizar y verificar archivos; después comprobar el descubrimiento en el host.](../assets/first-run.es.svg)

**Resultado:** colocar una selección específica de guías en las ubicaciones adecuadas para tu agente, sin confundir instalación con ejecución automática.

## Antes de empezar

- Este checkout requiere Node.js >= 24.0.0 y < 25.
- Trabaja desde la raíz del proyecto receptor.
- Consulta los identificadores con `ngautopilot adapters` y `ngautopilot packs`.
- Crea una copia de seguridad antes de actualizar o cambiar de pack. Esta rama puede actualizar archivos editados que sigan dentro de la selección gestionada.
- Los ejemplos usan un paquete publicado en npm. Fija una versión exacta en automatizaciones; consulta funciones locales con `node bin/ngautopilot.mjs help` dentro de este repositorio.

## 1. Elige un pack y revisa el plan

```bash
npm exec --package=ngautopilot -- ngautopilot adapters
npm exec --package=ngautopilot -- ngautopilot packs
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-foundations --scope project --dry-run
```

Resultado esperado: un plan de instalación, sin escritura de archivos. Revisa destinos y avisos. Para un único salto de versión utiliza el pack `ngautopilot-angular-<from>-to-<to>` correspondiente.

## 2. Aplica y comprueba

```bash
npm exec --package=ngautopilot -- ngautopilot install --agent codex --pack ngautopilot-angular-foundations --scope project --yes
npm exec --package=ngautopilot -- ngautopilot verify --agent codex --scope project
```

`--yes` aprueba la escritura. `--force` no es aprobación: permite sobrescribir archivos no gestionados y eliminar archivos gestionados obsoletos que hayan sido modificados. No lo uses para ocultar conflictos.

Con Codex, las skills están en `.agents/skills/`, las instrucciones gestionadas en el archivo raíz `AGENTS.md` y el manifiesto en la raíz del proyecto. El adaptador puede incorporar su sección delimitada a un archivo existente; el texto ajeno a esa sección permanece separado.

## 3. Confirma el descubrimiento en el cliente

Abre el agente en el proyecto. Pídele que identifique la skill instalada que utilizaría. Una comprobación correcta de sumas de comprobación no demuestra descubrimiento, registro de herramientas ni ejecución.

## Selección alternativa: perfil según Angular

Utilízala solo si la ayuda de tu versión instalada incluye estas opciones:

```bash
ngautopilot install --agent codex --angular 22 --profile essentials --scope project --dry-run
ngautopilot install --agent codex --angular 22 --profile essentials --scope project --yes
```

`--pack` y `--angular` son excluyentes. `--profile` y `--capabilities` requieren `--angular`. Perfiles: `essentials`, `architecture`, `performance`, `testing`, `migration`, `core`. Detecta la versión y las herramientas reales; no elijas 22 solo porque aparezca aquí. [Referencia CLI](cli-reference.es.md).

## Ámbitos y cambio de pack

| Ámbito | Significado |
| --- | --- |
| `project` | Instalar para este proyecto; predeterminado |
| `user` | Instalar para el usuario, si el adaptador lo permite |

Por ejemplo, inspecciona la instalación para el usuario OpenCode con `ngautopilot install --agent opencode --pack ngautopilot-angular-state --scope user --dry-run` y repite con `--yes` después de revisarla.

Existe una selección gestionada por agente y ámbito. Cambiar de pack puede eliminar archivos sin cambios que ya no estén seleccionados. Los archivos obsoletos modificados se conservan y se notifican salvo que se fuerce su eliminación. **Los archivos que siguen seleccionados pueden actualizarse aunque estén editados** en esta rama; conserva tus personalizaciones fuera de archivos o secciones gestionadas y crea primero una copia de seguridad.

## Cómo se seleccionan los archivos

1. Resolver `packs/<id>.json` y sus dependencias transitivas.
2. Aplicar prefijos de identificadores del catálogo y exclusiones.
3. Calcular destinos según adaptador y ámbito.
4. Copiar archivos seleccionados e integrar la sección gestionada de instrucciones.
5. Registrar propiedad y sumas SHA-256 en `.ngautopilot-manifest.json`.

Una instalación idéntica omite contenidos coincidentes. La idempotencia no protege los archivos gestionados editados frente a actualizaciones.

## Actualizar, eliminar y respaldar

```bash
ngautopilot backup --agent codex --scope project
ngautopilot update --agent codex --scope project --dry-run
ngautopilot update --agent codex --scope project --yes
ngautopilot verify --agent codex --scope project
ngautopilot uninstall --agent codex --scope project --dry-run
ngautopilot uninstall --agent codex --scope project --yes
ngautopilot restore --backup <backup-path>
```

Sustituye `<backup-path>` por la ruta devuelta al crear la copia; no pegues literalmente los marcadores. [Actualización](updating.es.md) · [Desinstalación](uninstalling.es.md).

## Uso portable o sin conexión

```bash
ngautopilot export --agent generic --pack ngautopilot-core --output ./ngautopilot-export
```

Revisa y copia la exportación autocontenida manualmente. Obtener el paquete mediante npm puede requerir red; el instalador lee fuentes empaquetadas localmente. Esta rama **no tiene una opción `--offline`**.

## La migración es otra operación

`migrate setup`/`migrador` crea un plan aprobado. `migrate run` comprueba como máximo un salto y se detiene en `awaiting-executor` cuando falta un transformador autorizado. `resume` revisa la evidencia y no omite controles bloqueados. `work plan` prepara una tarea acotada de solo lectura, no ejecución arbitraria. [Comandos y ejemplos](cli-reference.es.md).
