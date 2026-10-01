# Desinstala sin borrar tu propio trabajo 🧹

<!-- docs:navigation:start -->
[English](uninstalling.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**Resultado:** eliminar el contenido instalado que gestiona NgAutoPilot y, opcionalmente, el paquete CLI.

## 1. Crea una copia y revisa el plan

Utiliza el mismo agente y ámbito de la instalación:

```bash
ngautopilot backup --agent codex --scope project
ngautopilot uninstall --agent codex --scope project --dry-run
```

Revisa la lista antes de aprobar. Los archivos de la aplicación creados de forma independiente quedan fuera de la selección.

## 2. Aprueba la eliminación

```bash
ngautopilot uninstall --agent codex --scope project --yes
```

Solo se eliminan archivos del manifiesto o la sección gestionada de instrucciones. Los archivos gestionados modificados se rechazan sin `--force`. Las instrucciones ajenas a la sección de NgAutoPilot permanecen. El manifiesto desaparece cuando no quedan archivos gestionados.

Si se rechaza la eliminación, revisa y guarda tus cambios. Solo cuando quieras descartarlos, repite con `--yes --force`; forzar puede eliminar archivos editados. No borres todo el directorio del agente para evitar el manifiesto.

## 3. Comprueba el resultado

Revisa las eliminaciones notificadas y los archivos restantes. Después de eliminar todo, `verify` puede indicar que falta el manifiesto; no significa que la desinstalación fallara. La operación es por proyecto, agente y ámbito: repítela únicamente en otras instalaciones que quieras eliminar.

## 4. Elimina el paquete global, si existe

```bash
npm uninstall --global ngautopilot
```

Elimina la CLI global, no las guías instaladas en proyectos. Para una dependencia npm local, utiliza el procedimiento de gestión de paquetes del proyecto. [Instalación](installation.es.md) · [Actualización y restauración](updating.es.md).
