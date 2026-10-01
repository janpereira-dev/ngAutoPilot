# Actualiza con seguridad: crea una copia antes 🔄

<!-- docs:navigation:start -->
[English](updating.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**Importante:** esta rama actualiza archivos seleccionados registrados en el manifiesto aunque hayan sido editados. Conserva archivos obsoletos modificados al cambiar de pack salvo que se fuerce su eliminación, pero es otra operación. No confíes en la actualización para proteger personalizaciones.

## 1. Conserva la selección actual

Ejecuta en el proyecto receptor y guarda la ruta devuelta por la copia:

```bash
ngautopilot backup --agent codex --scope project
ngautopilot update --agent codex --scope project --dry-run
```

Revisa las rutas afectadas. Guarda cambios importantes fuera de archivos gestionados y de la sección de instrucciones de NgAutoPilot.

## 2. Aprueba y verifica

```bash
ngautopilot update --agent codex --scope project --yes
ngautopilot verify --agent codex --scope project
```

Sin `--yes`, una actualización que requiere aprobación no escribe. Se omiten contenidos idénticos a la fuente. `--force` permite sobrescrituras no gestionadas y eliminar archivos obsoletos modificados; no es un atajo para resolver avisos.

## 3. Actualiza la CLI por separado

`update` utiliza las fuentes del paquete CLI que ejecutas; no descarga automáticamente una versión nueva de npm.

Para instalación global usa `npm install --global ngautopilot@<version>`; para ejecución puntual usa `npm exec --package=ngautopilot@<version> -- ngautopilot help`. Sustituye `<version>` por una versión verificada. No confundas una dependencia npm local con un comando disponible globalmente.

Cambiar `--pack` modifica la selección, no solo su versión. Consulta [packs](packs.es.md).

## 4. Recupera si hace falta

```bash
ngautopilot restore --backup <backup-path>
ngautopilot verify --agent codex --scope project
```

Sustituye el marcador por la ruta guardada y revisa los archivos restaurados. La copia restaura archivos gestionados; no respalda toda la aplicación. [Referencia CLI](cli-reference.es.md) · [Solución de problemas](troubleshooting.es.md).
