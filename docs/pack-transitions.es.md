# Transiciones seguras entre packs

<!-- docs:navigation:start -->
[English](pack-transitions.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

Los conflictos conocidos de origen y destino se verifican antes de eliminar o escribir contenido. Un preflight fallido conserva archivos y manifiesto anteriores; no se promete rollback transaccional ante cualquier fallo del sistema operativo.

El checksum anterior define la propiedad. Figurar en un manifiesto **no autoriza a reemplazar un cambio local**.

| Transición | Comportamiento predeterminado |
| --- | --- |
| Core a full; archivo compartido intacto | Actualiza solo si cambió el contenido canónico |
| Core a full; archivo compartido editado | Conserva bytes y checksum original; advierte y falla |
| Full a core; archivo excluido intacto | Elimina el archivo propio |
| Full a core; archivo excluido editado | Conserva archivo y registro de propiedad; advierte y falla |
| Sección de instrucciones editada | Conserva y advierte; el texto exterior sigue siendo del usuario |
| Simulación | Informa los mismos conflictos sin escribir |
| Destino/manifiesto enlazado | Rechaza antes de cambiar nada, incluidos enlaces contenidos o colgantes |
| `--force` explícito | Permite reemplazar ediciones; rutas inseguras y marcadores malformados siguen fallando |

Los conflictos conservados siguen apareciendo en `verify`. Reintentar no adopta los bytes editados como nueva base canónica. Desinstalar tampoco elimina archivos propios editados sin autorización explícita.

## Recuperación

~~~bash
ngautopilot update --agent codex --pack ngautopilot-full --dry-run --json
ngautopilot backup --agent codex --json
# Revisa advertencias y respaldo antes de decidir reemplazar cambios.
ngautopilot update --agent codex --pack ngautopilot-full --yes --force --json
ngautopilot restore --backup <reported-backup-path> --agent codex --json
ngautopilot verify --agent codex --json
~~~

El respaldo es explícito, no una promesa automática ni autorización para sobrescribir. Guarda la ruta de forma segura: puede contener instrucciones privadas. Restaurar bytes editados restaura también su base de propiedad; un mismatch posterior puede ser esperado.

Restore verifica toda la instantánea y la instalación actual. Elimina archivos propios intactos creados después del respaldo para no dejar skills descubiertas sin propietario. Ediciones posteriores, destinos ajenos, rutas inseguras y archivos ausentes rechazan toda la restauración antes de modificar contenido o manifiesto. Se preserva el texto externo a la sección gestionada; resuelve conflictos antes de reintentar, pues restore no tiene atajo force.

Las exportaciones nativas tienen un contrato independiente más estricto: un conflicto rechaza toda la actualización y conserva el registro anterior; no admiten `--force`. Usa un directorio nuevo tras revisar el conflicto.

Las regresiones están en `tests/installer/installer.test.mjs` y `tests/installer/exporter.test.mjs`: ciclos core/full, reintentos, propiedad excluida, simulaciones, instrucciones acotadas, force explícito y recuperación exacta.

Referencias, scripts y assets de skills seleccionadas comparten las mismas comprobaciones. Los binarios se hashean, respaldan y restauran sin convertirlos a texto. La versión registrada proviene del NgAutoPilot instalado, no del package.json de la aplicación receptora. Las exportaciones nativas empaquetan documentación pública enlazada; las instalaciones canónicas conservan el layout fuente.
