# Referencia de la CLI de NgAutoPilot 🛠️

<!-- docs:navigation:start -->
[English](cli-reference.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**Busca una acción y revisa sus opciones antes de escribir archivos.** Esta referencia describe el checkout actual. Ejecuta `ngautopilot help` para tu paquete instalado o `node bin/ngautopilot.mjs help` dentro del repositorio para esta rama.

## Ruta rápida

1. Lista adaptadores y packs.
2. Inspecciona con `--dry-run`.
3. Aprueba escrituras con `--yes` y verifica el resultado.

Los ejemplos con `<id>`, `<path>` o `<run-id>` contienen marcadores que debes sustituir. Los corchetes `[...]` de la sintaxis indican opciones, no texto que debas copiar.

## Consultar sin instalar

| Comando | Resultado |
| --- | --- |
| `ngautopilot help` | Comandos y opciones disponibles |
| `ngautopilot list [--json]` | Skills del catálogo |
| `ngautopilot packs [--json]` | Packs, estado y destinatarios |
| `ngautopilot adapters [--json]` | Adaptadores, estado y ámbitos |
| `ngautopilot doctor` | Integridad del catálogo y recuentos de packs y adaptadores |

`doctor` no comprueba que el agente haya ejecutado las skills.

## Instalar una selección

```bash
ngautopilot install --agent codex --pack ngautopilot-angular-foundations --scope project --dry-run
ngautopilot install --agent codex --pack ngautopilot-angular-foundations --scope project --yes
```

Alternativa según la versión Angular, si aparece en la ayuda de tu versión:

```bash
ngautopilot install --agent codex --angular 22 --profile essentials --dry-run
ngautopilot install --agent codex --angular 22 --profile essentials --yes
```

Primero revisa el plan y después aplica la misma selección. Para pruebas/UI puedes elegir `--profile testing --capabilities ui,testing`, con un dry-run de esa selección antes de aprobar.

| Opción | Significado |
| --- | --- |
| `--agent <id>` | Obligatoria para instalar. `claude`, `codex`, `copilot`, `cursor`, `gemini`, `generic`, `hermes`, `openclaw`, `opencode` o `pi`. Consulta ámbitos y estados con `adapters`. |
| `--pack <id>` | Selección nominal; excluye `--angular`, `--profile` y `--capabilities`. Adecuada para un pack o salto exacto. |
| `--angular <major[.minor]>` | Resolver evidencia Angular y de herramientas del proyecto y componer una instalación compatible. Excluye `--pack`. |
| `--profile <name>` | `essentials`, `architecture`, `performance`, `testing`, `migration` o `core`. Requiere `--angular`. |
| `--capabilities a,b` | Capacidades Angular adicionales separadas por comas. Requiere `--angular`. |
| `--scope project\|user` | Ámbito; predeterminado `project`. El adaptador debe admitirlo. |
| `--dry-run` | Mostrar lo que ocurriría sin escribir. |
| `--yes` | Aprobar escrituras; no omite controles de compatibilidad. |
| `--force` | Permitir sobrescrituras no gestionadas y eliminación de archivos gestionados obsoletos modificados. No sustituye la aprobación. |
| `--json` | Mostrar JSON. |

Las dependencias se resuelven automáticamente. Al cambiar de pack se eliminan archivos obsoletos sin cambios; los modificados se notifican y se conservan salvo que se fuerce. Los archivos gestionados todavía seleccionados se conservan si están editados salvo autorización explícita con `--force`. Crea una copia antes.

Sin `--yes`, una instalación que necesita aprobación no escribe. `--dry-run` nunca escribe.

## Actualizar, eliminar y verificar

```text
ngautopilot update --agent codex --scope project [--pack <id>] [--dry-run] [--yes] [--force] [--json]
ngautopilot uninstall --agent codex --scope project [--dry-run] [--yes] [--force] [--json]
ngautopilot verify --agent codex --scope project [--json]
```

- `update` lee fuentes del paquete CLI utilizado; no descarga una versión nueva automáticamente.
- `uninstall` elimina contenido gestionado; rechaza archivos modificados sin `--force`.
- `verify` compara existencia y sumas del manifiesto, no pruebas de la aplicación.

[Actualización](updating.es.md) · [Desinstalación](uninstalling.es.md).

## Exportar, respaldar y restaurar

```text
ngautopilot export --agent generic --pack ngautopilot-core --output ./export-dir [--json]
ngautopilot backup --agent codex --scope project [--json]
ngautopilot restore --backup <path> [--agent <id>] [--scope project|user] [--json]
```

La exportación es una copia portable para instalación manual. La copia de seguridad respalda contenido gestionado, no el proyecto entero. La restauración utiliza la ruta devuelta al crear la copia. No existe una opción CLI `--offline`; consulta [instalación](installation.es.md) para el flujo sin conexión.

## Controles de migración Angular

### Preparar: `migrate setup`

Prepara un plan aprobado de saltos mayores sin modificar fuentes Angular, paquetes ni Git. El alias `migrador` tiene el mismo contrato.

```bash
ngautopilot migrate setup --from 12 --to 22 --agent codex --yes --dry-run
ngautopilot migrador --from 12 --to 22 --agent codex --yes
```

El primer ejemplo inspecciona sin escribir; el segundo aprueba la creación del plan. No son una migración de código. Sin `--yes` se informa del requisito de aprobación. El plan se guarda en `.ngautopilot/migration-plan.json` cuando corresponde.

### Comprobar: `migrate run` y `resume`

```bash
ngautopilot migrate run --plan .ngautopilot/migration-plan.json --agent codex --yes
ngautopilot migrate resume --run <run-id> --agent codex --plan .ngautopilot/migration-plan.json --yes
```

`run` valida como máximo un salto aprobado y persiste un punto de control. No afirma transformar el código. Si falta un transformador ejecutable autorizado, se detiene en `awaiting-executor` y registra el bloqueo.

`resume` vuelve a comprobar la evidencia; no omite controles fallidos o bloqueados ni avanza mientras el salto actual siga bloqueado.

## Planificar trabajo acotado

```bash
ngautopilot work plan --goal "Review Angular tests and quality" --agent codex --yes --dry-run
ngautopilot work plan --goal "Review Angular tests and quality" --agent codex --yes
```

Prepara una tarea aprobada de inventario, inspección, validación o informe. No ejecuta el objetivo ni permite comandos arbitrarios, cambios Git, paquetes o fuentes. Sin `--yes` devuelve `approval-required`; `--dry-run` no escribe `.ngautopilot/work-plan.json`.

## Comandos antiguos

| Comando obsoleto | Sustitución |
| --- | --- |
| `ngautopilot init` | `ngautopilot install --agent generic --pack ngautopilot-core` |
| `ngautopilot add <skill-id>` | `ngautopilot install --pack <pack-id>` |
| `ngautopilot adapter <name>` | `ngautopilot install --agent <name> --pack <pack-id>` |

Añade `--dry-run` para revisar y `--yes` para aprobar cuando corresponda. Completa los identificadores obligatorios.

## Códigos de salida

| Código | Significado |
| --- | --- |
| 0 | Éxito |
| 1 | Error: skill ausente, verificación fallida, eliminación rechazada o comando desconocido |

Conserva el resultado completo y cualquier aviso: no deduzcas que hubo ejecución del agente solo a partir de un código correcto.
