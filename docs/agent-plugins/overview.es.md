# Agent Plugins en vista previa 📦

<!-- docs:navigation:start -->
[English](overview.md) · [Mapa](../README.es.md) · [Inicio](../../README.es.md)

<!-- docs:navigation:end -->

![Las rutas de entrega tienen contratos distintos; verifica por separado descubrimiento, publicación e integración MCP.](../../assets/distribution-routes.es.svg)

**Genera el artefacto y después demuestra que el agente de destino lo descubre.** NgAutoPilot `0.6.0` genera Agent Plugins 1.0 desde `skills/` y la política de packs de `packs/`. Empaquetar no demuestra instalación.

## ¿Qué incluye?

| Artefacto | Finalidad |
| --- | --- |
| `ngautopilot-core` | Fundamentos compartidos |
| `ngautopilot-angular-architecture` | Arquitectura Angular específica |
| `ngautopilot-angular-testing` | Pruebas Angular específicas |
| `ngautopilot-angular-21-to-22` | Guía de actualización acotada |
| `ngautopilot-tools` | Servidor separado de inspección MCP por stdio |

Los plugins específicos incluyen las skills Core transitivas. El plugin de herramientas registra **diez** herramientas en este checkout: `catalog.search`, `pack.list`, `pack.resolve`, `project.inspect`, `stack.detect`, `skill.route`, `compatibility.check`, `upgrade.plan`, `angular.resolve` y `repository.validate`.

Estas herramientas no aplican actualizaciones, modifican dependencias ni editan Git. `angular.resolve` recibe una instantánea aportada por quien llama, en lugar de leer los archivos de su aplicación.

## Ruta de mantenimiento

Ejecuta desde este repositorio:

```bash
npm run agent-plugins:sync
npm run agent-plugins:validate
npm run agent-plugins:smoke
npm run agent-plugins:pack
```

Inspecciona los ZIP y `SHA256SUMS` en `dist/agent-plugins/`. Sync genera salida; validate comprueba estructura; smoke prueba el protocolo local; pack crea archivos. **Nada de esto demuestra detección en todos los clientes.**

Los `plugins/` nativos, marketplaces, adaptadores e instalación CLI siguen siendo rutas separadas. Agent Plugins describe un formato, no un mecanismo universal de instalación o marketplace. Continúa con las [evidencias de compatibilidad](compatibility.es.md).
