# Primeros pasos: tu primera tarea segura 🧭

<!-- docs:navigation:start -->
[English](getting-started.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

![Cuatro controles: elegir IDs, previsualizar sin escribir, autorizar y verificar archivos; después comprobar el descubrimiento en el host.](../assets/first-run.es.svg)

**Resultado:** instalar un pack relevante y comprobar que el agente encuentra sus guías. Empieza en un proyecto existente; NgAutoPilot no crea una aplicación Angular.

## 1. Instala de la forma más sencilla

Desde el proyecto receptor (Node.js 22.20+):

```bash
npx skills add janpereira-dev/ngAutoPilot
```

Elige el paquete correspondiente a tu era Angular o tarea. Consulta las opciones con `npx skills add janpereira-dev/ngAutoPilot --list`. Para instalar uno concreto:

```bash
npx skills add janpereira-dev/ngAutoPilot --skill ngautopilot-angular -a codex
npx skills list -a codex
```

El paquete incluye **procedimientos locales completos** en `references/skills/`, no una invitación a instalar otra herramienta. El agente debe abrir únicamente la guía compatible con el proyecto.

## 2. Comprueba la instalación y ejecuta una tarea

Verifica que `npx skills list` muestra el paquete elegido. Pide al agente que abra `references/index.md` y lea la `procedure.md` pertinente. Encontrar los archivos no demuestra por sí solo que el agente los active; pídele que indique qué procedimiento ha seleccionado.

## 3. Pide una tarea acotada

Abre tu agente en el proyecto y solicita:

> Inspecciona el stack y sus versiones. Encuentra la guía instalada de NgAutoPilot para revisar límites de componentes. Explica un plan pequeño antes de editar e indica qué comprobaciones existentes puedes ejecutar.

La ruta esperada es recepción → detección → selección de skill → compatibilidad y riesgo → cambio acotado → validación. No necesitas cargar todas las skills ni todos los revisores.

## 4. Encuentra el siguiente paso

| Necesidad | Guía |
| --- | --- |
| Ejercicio Angular completo | [Primer proyecto Angular](first-angular-project.es.md) |
| Otro agente, ámbito o uso sin conexión | [Instalación](installation.es.md) |
| Elegir un pack para una tarea concreta | [Packs](packs.es.md) |
| Comandos o controles de migración | [Referencia CLI](cli-reference.es.md) |
| Algo no funcionó | [Solución de problemas](troubleshooting.es.md) |

El `init` de la CLI nativa está obsoleto; para instalar skills se recomienda `npx skills add`. Utiliza `install` o `export` explícitos. La preparación de migraciones crea un plan, no transforma código; una ejecución puede detenerse en `awaiting-executor` y no permite omitir un bloqueo.
