# Uso multiplataforma 🖥️

<!-- docs:navigation:start -->
[English](cross-platform.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

El instalador utiliza APIs de Node para Windows, macOS y Linux. La portabilidad del código no sustituye la evidencia de pruebas en cada sistema.

## Ruta rápida

1. Comprueba Node y el ámbito admitido por el adaptador.
2. Utiliza comandos de una línea de la [instalación](installation.es.md).
3. Verifica archivos; revisa los requisitos adicionales de hooks y validadores.

## Reglas técnicas

- Rutas mediante `node:path`: `join`, `resolve` y `relative`.
- Instalación mediante APIs de `node:fs`, sin depender de comandos shell.
- Resolución de usuario mediante el entorno del sistema; consulta el adaptador.
- No asumir Bash, PowerShell, `/tmp`, `chmod` ni enlaces simbólicos.
- `.gitattributes` define normalización de finales de línea.

## Operaciones previstas

| Acción | Windows | macOS | Linux |
| --- | --- | --- | --- |
| Instalación de proyecto | Diseño compatible | Diseño compatible | Diseño compatible |
| Instalación de usuario | Si el adaptador admite el ámbito | Si lo admite | Si lo admite |
| Desinstalación, exportación y doctor | APIs Node | APIs Node | APIs Node |
| Sincronización de bundles | APIs Node | APIs Node | APIs Node |

Esta tabla describe la intención de portabilidad, no una ejecución reciente en cada plataforma.

## Hooks Git

El hook `.githooks/pre-commit` es Bash; Windows requiere Git Bash. `npm run hooks:install` configura `core.hooksPath`, no convierte el hook en Node.

Si no puedes ejecutar el hook, realiza las comprobaciones disponibles manualmente:

```bash
npm run skills:validate:frontmatter
npm run skills:catalog
npm run skills:validate
npm run consistency:validate
```

## Límites conocidos

- Los enlaces simbólicos no son obligatorios; el código de seguridad comprueba sus destinos.
- El validador `scripts/validate-skill-frontmatter.py` requiere Python; comprueba la disponibilidad de las herramientas antes de afirmar que validaste todo.
- La normalización Git no prueba cómo se guardó cada archivo local. Revisa diferencias antes de publicar.

[Solución de problemas](troubleshooting.es.md).
