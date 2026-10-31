# Laboratorio de seguridad Angular en ejecución

[English](README.md) · [Skill Lab](../README.es.md)

Esta aplicación de integración para el checkout ejercita los 25 escenarios de las cinco guías canónicas de seguridad Angular. Utiliza Angular 22.2.4 renderizado en Node e hidratado en Chromium aislado, sesiones y proxies HTTP/TLS reales y reproducciones de dependencias fijadas. La plantilla es un literal del código fuente; la construcción mínima utiliza el compilador JIT de Angular y esbuild.

## Ejecutar

Necesita Node 24.15 o posterior dentro de la versión principal 24, npm y OpenSSL. En Windows usa OpenSSL de Git for Windows; en Linux, `openssl` disponible en PATH. No instala certificados en el almacén de confianza del sistema.

```sh
cd skill-lab/security-runtime
npm ci --ignore-scripts
npx playwright install chromium
npm test
```

En Linux puede ser necesario `npx playwright install --with-deps chromium`. Tras preparar el entorno, `npm run security:runtime` desde la raíz ejecuta la misma suite.

El proceso genera su certificado temporal, puertos locales, contextos de navegador y cuentas sintéticas. Intercepta los destinos del navegador externos al laboratorio. Incluso los controles de solicitudes vulnerables solo pueden contactar con receptores creados por ese proceso. La reproducción de dependencias se limita a un marcador revisado dentro del proceso; no acepta cargas arbitrarias ni ejecuta órdenes del sistema.

## Escenarios y observaciones

| Guía | Identificadores | Interfaces públicas comprobadas |
| --- | --- | --- |
| Almacenamiento de tokens | C17, C04, C23, C09, C12 | Almacenamiento, formulario entre sitios, CSRF inválido, reutilización de refresh, cookies, destinos, expiración y cierre de sesión |
| Seguridad XSS | C02, C19, C06, C25, C14 | Eventos y enlaces en DOM real, inserción directa, SSR y controles positivos tras hidratar |
| Gobierno de DomSanitizer | C08, C21, C01, C16, C11 | Sanitizador instalado, contexto incorrecto, URLs exactas y evidencia de productores y consumidores |
| Límite de seguridad SSR | C24, C03, C18, C07, C22 | Host/cabeceras de proxy, receptores y redirecciones locales, proxy real, usuarios concurrentes, secuenciales y anónimos |
| Vulnerabilidades de dependencias | C13, C20, C05, C15, C10 | Marcadores de ejecución y build, auditorías completas/de producción, errores del registro y versiones instaladas/construidas |

Los controles vulnerables comprueban que las pruebas detectan el comportamiento inseguro. La variante corregida debe rechazarlo y conservar las entradas válidas. Seis casos retiran deliberadamente una frontera de evidencia: las pruebas comprueban esa ausencia y el agente debe decidir qué implica. Una suite verde significa que se cumplieron las expectativas de los escenarios, incluida la detección de las variantes vulnerables.

`observations/cases/` contiene hechos medidos, sin decisiones de seguridad generadas. `observations/run.json` registra el identificador nuevo de la ejecución, cantidades, fechas y hashes SHA-256 normalizados de aplicación/pruebas y de las cinco guías. `subject` identifica el caso revisado; `correction` aporta evidencia separada y no borra un fallo del caso original.

Los manifiestos de dependencias negativos usan nombres `.fixture.json`, según la convención del laboratorio. `prepare-cases.mjs` los materializa bajo `.cache/projects/`, ignorado por Git, e instala sus locks sin scripts de ciclo de vida. Los proyectos corregidos de ejecución/build usan lodash 4.18.1; los controles negativos usan 4.17.20. Se auditan ambos alcances sin descartar dependencias de desarrollo. La [advertencia original](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) describe la opción probada; la [advertencia actual del mantenedor](https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc) también fundamenta la versión corregida. Skill Lab queda fuera del paquete npm público.

## Validación estricta de certificados en el navegador

La suite de 25 escenarios usa `ignoreHTTPSErrors: true` para su servidor sintético con certificado autofirmado. No demuestra la validación de certificados del navegador. Ejecuta la suite estricta independiente después del build:

```sh
npm run build
npx playwright test --config browser-tls/playwright.config.mjs
```

Esta suite establece `ignoreHTTPSErrors: false` y comprueba que los parámetros reales de Chromium no omitan los errores de certificados. Siete pruebas verifican el rechazo de una CA desconocida; la carga e hidratación de Angular con una cadena válida y confiable; el rechazo de certificados con nombre incorrecto, caducados, con fecha futura o de otra CA; y un nuevo rechazo de la cadena válida en otro perfil vacío. Los rechazos deben producir el error nativo de certificado y cero peticiones HTTP al servidor de la aplicación.

Cada prueba crea su propio perfil de Chromium. Después de que Chromium inicialice su base de certificados y se cierre, el laboratorio añade únicamente la CA generada a ese perfil y vuelve a abrir el navegador. Nunca importa un certificado final ni modifica la confianza del sistema operativo. Usa la [base de certificados del perfil](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/net/server_certificate_database_service_factory.cc) y los [metadatos de confianza](https://raw.githubusercontent.com/chromium/chromium/f842f52ef39fd97b449eb27cff414bf05a98ddce/components/server_certificate_database/server_certificate_database.proto) de Chromium; exige la versión 156.0.8078.4 y el esquema 1 para que una actualización requiera revisión explícita. Necesita Chromium completo (`channel: 'chromium'`).

`observations/browser-tls/` registra fechas y huellas de certificados, errores nativos, detalles TLS, identidad del navegador y hashes del código. Las claves temporales y los perfiles quedan en `.cache/`, ignorado por Git; la evidencia revisada no incluye claves privadas. CI ejecuta esta suite junto con los 25 escenarios originales. Estos certificados locales no prueban revocación de PKI pública, destinos de producción ni otros navegadores.

## Comprobar un agente real

Entrega a un agente independiente nuevo [audit-task.md](audit-task.md), las cinco guías reales, el código y la capacidad de ejecutar la suite. Mantén `oracle.json`, `verify-agent*` y las evaluaciones guardadas fuera de sus lecturas permitidas. Debe ejecutar las pruebas, leer el recibo nuevo y producir `observations/agent-response.json` con decisiones, razones y evidencias para los 25 casos.

```sh
node --test verify-agent.test.mjs
npm run test:agent -- observations/agent-response.json observations/run.json
```

El verificador compara las decisiones independientes con la clave derivada de las guías, rechaza casos incompletos, duplicados o mal clasificados y hashes distintos, y vincula la respuesta con la ejecución identificada. No invoca modelos. El workflow Security Runtime repite los 25 escenarios y evalúa la salida guardada; esa comprobación de JSON no se presenta como una nueva invocación de modelo.

La evidencia de una ejecución real se guarda bajo `evidence/<fecha>/`. El alcance es un agente, una versión de Angular y una topología sintética. Un recibo JSON por sí solo no demuestra procedencia ni fiabilidad general: conserva la invocación real y revisa sus razones. Los proveedores de identidad, DNS/proxies de producción, otras versiones Angular y otros navegadores necesitan evidencia propia.
