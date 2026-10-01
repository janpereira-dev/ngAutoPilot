# Niveles de confianza: clasifica la acción 🔐

<!-- docs:navigation:start -->
[English](trust-levels.md) · [Mapa](README.es.md) · [Inicio](../README.es.md)

<!-- docs:navigation:end -->

**No confundas una guía de texto con una operación sin riesgo.** La autorización depende de la acción que realizará el agente y de los controles reales del cliente.

## Clasificación

| Nivel | Acción | Política orientativa |
| --- | --- | --- |
| `documentation` | Leer Markdown como contexto | Permitida |
| `local-readonly` | Leer archivos y configuración | Permitida |
| `local-write` | Escribir o modificar en el proyecto | Plan visible |
| `network-read` | Consultar fuentes externas | Declarar la consulta |
| `network-write` | Enviar información a servicios externos | Confirmación explícita |
| `deployment` | Publicar, desplegar o subir cambios | Bloqueado por defecto |
| `credential-sensitive` | Manejar tokens o credenciales | Bloqueado por defecto |

Esta tabla es orientación de revisión, no un sistema automático de permisos. Las políticas del cliente y las instrucciones del usuario prevalecen.

## Ruta rápida

1. Identifica si la siguiente acción lee, escribe, envía o publica.
2. Obtén el permiso que corresponda; limita datos y destinos.
3. Guarda la evidencia de resultado y de controles no disponibles.

## Riesgo de una skill

El archivo Markdown no ejecuta código por sí mismo. Su recomendación puede implicar escrituras, red o publicación. Clasifica esa operación, no solo el archivo que la describe.

El instalador es `local-write`: la aplicación/eliminación actúa en raíces declaradas del adaptador. Las copias de seguridad utilizan un destino temporal separado y la restauración lee esa copia. No presentes ese respaldo como una operación sin escrituras.

## Comportamiento del paquete

No incluye scripts de instalación automática `postinstall`, telemetría del instalador ni credenciales incrustadas. No debe recomendar pipelines de ejecución remota no confiable.

El instalador lee fuentes empaquetadas localmente; obtener paquetes npm puede necesitar red. `export` crea una copia sin conexión, pero esta rama no tiene opción `--offline`.

El MCP y la factoría HTTPS opcional tienen contratos separados; esta orientación no prueba que un servidor esté registrado, desplegado o autorizado.

## Protecciones de instalación

| Protección | Límite real |
| --- | --- |
| Rutas acotadas | `createRootGuard` comprueba que no escapen de la raíz |
| Enlaces simbólicos | Comprobación de destinos con `lstatSync` y `realpathSync` |
| Archivos no gestionados | Se rechaza sobrescritura sin `--force` |
| Archivos gestionados | Los todavía seleccionados pueden actualizarse aunque estén editados; respaldar antes |
| Idempotencia | Se omiten contenidos idénticos por SHA-256 |
| Eliminación acotada | `uninstall` utiliza la propiedad del manifiesto |
| Respaldo | `backup` toma una copia de archivos gestionados; no de toda la aplicación |
| Restauración | `restore` aplica una copia indicada |

## Lista de revisión

- [ ] No se solicita ejecución remota no confiable.
- [ ] No hay secretos, tokens ni URLs privadas.
- [ ] No se imponen rutas absolutas o una plataforma no detectada.
- [ ] La aplicación de archivos utiliza las comprobaciones de rutas previstas.
- [ ] El manifiesto existe después de instalar y representa los archivos reales.
- [ ] Se distingue validación estructural de seguridad y ejecución real.

[Modelo de seguridad](security-model.es.md) · [Instalación](installation.es.md).
