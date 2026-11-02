# Laboratorio de seguridad Angular en ejecuciÃ³n

[English](README.md) Â· [Skill Lab](../README.es.md)

Esta aplicaciÃ³n de integraciÃ³n para el checkout ejercita los 25 escenarios de las cinco guÃ­as canÃ³nicas de seguridad Angular. Utiliza Angular 22.2.4 renderizado en Node e hidratado en Chromium aislado, sesiones y proxies HTTP/TLS reales y reproducciones de dependencias fijadas. La plantilla es un literal del cÃ³digo fuente; la construcciÃ³n mÃ­nima utiliza el compilador JIT de Angular y esbuild.

## Ejecutar

Necesita Node 24.15 o posterior dentro de la versiÃ³n principal 24, npm y OpenSSL. En Windows usa OpenSSL de Git for Windows; en Linux, `openssl` disponible en PATH. No instala certificados en el almacÃ©n de confianza del sistema.

```sh
cd skill-lab/security-runtime
npm ci --ignore-scripts
npx playwright install chromium
npm test
```

En Linux puede ser necesario `npx playwright install --with-deps chromium`. Tras preparar el entorno, `npm run security:runtime` desde la raÃ­z ejecuta la misma suite.

El proceso genera su certificado temporal, puertos locales, contextos de navegador y cuentas sintÃ©ticas. Intercepta los destinos del navegador externos al laboratorio. Incluso los controles de solicitudes vulnerables solo pueden contactar con receptores creados por ese proceso. La reproducciÃ³n de dependencias se limita a un marcador revisado dentro del proceso; no acepta cargas arbitrarias ni ejecuta Ã³rdenes del sistema.

## Escenarios y observaciones

| GuÃ­a | Identificadores | Interfaces pÃºblicas comprobadas |
| --- | --- | --- |
| Almacenamiento de tokens | C17, C04, C23, C09, C12 | Almacenamiento, formulario entre sitios, CSRF invÃ¡lido, reutilizaciÃ³n de refresh, cookies, destinos, expiraciÃ³n y cierre de sesiÃ³n |
| Seguridad XSS | C02, C19, C06, C25, C14 | Eventos y enlaces en DOM real, inserciÃ³n directa, SSR y controles positivos tras hidratar |
| Gobierno de DomSanitizer | C08, C21, C01, C16, C11 | Sanitizador instalado, contexto incorrecto, URLs exactas y evidencia de productores y consumidores |
| LÃ­mite de seguridad SSR | C24, C03, C18, C07, C22 | Host/cabeceras de proxy, receptores y redirecciones locales, proxy real, usuarios concurrentes, secuenciales y anÃ³nimos |
| Vulnerabilidades de dependencias | C13, C20, C05, C15, C10 | Marcadores de ejecuciÃ³n y build, auditorÃ­as completas/de producciÃ³n, errores del registro y versiones instaladas/construidas |

Los controles vulnerables comprueban que las pruebas detectan el comportamiento inseguro. La variante corregida debe rechazarlo y conservar las entradas vÃ¡lidas. Seis casos retiran deliberadamente una frontera de evidencia: las pruebas comprueban esa ausencia y el agente debe decidir quÃ© implica. Una suite verde significa que se cumplieron las expectativas de los escenarios, incluida la detecciÃ³n de las variantes vulnerables.

`observations/cases/` contiene hechos medidos, sin decisiones de seguridad generadas. `observations/run.json` registra el identificador nuevo de la ejecuciÃ³n, cantidades, fechas y hashes SHA-256 normalizados de aplicaciÃ³n/pruebas y de las cinco guÃ­as. `subject` identifica el caso revisado; `correction` aporta evidencia separada y no borra un fallo del caso original.

Los manifiestos de dependencias negativos usan nombres `.fixture.json`, segÃºn la convenciÃ³n del laboratorio. `prepare-cases.mjs` los materializa bajo `.cache/projects/`, ignorado por Git, e instala sus locks sin scripts de ciclo de vida. Los proyectos corregidos de ejecuciÃ³n/build usan lodash 4.18.1; los controles negativos usan 4.17.20. Se auditan ambos alcances sin descartar dependencias de desarrollo. La [advertencia original](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) describe la opciÃ³n probada; la [advertencia actual del mantenedor](https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc) tambiÃ©n fundamenta la versiÃ³n corregida. Skill Lab queda fuera del paquete npm pÃºblico.

## ValidaciÃ³n estricta de certificados en el navegador

La suite de 25 escenarios usa `ignoreHTTPSErrors: true` para su servidor sintÃ©tico con certificado autofirmado. No demuestra la validaciÃ³n de certificados del navegador. Ejecuta la suite estricta independiente despuÃ©s del build:

```sh
npm run build
npx playwright test --config browser-tls/playwright.config.mjs
```

Esta suite establece `ignoreHTTPSErrors: false` y comprueba que los parÃ¡metros reales de Chromium no omitan los errores de certificados. Siete pruebas verifican el rechazo de una CA desconocida; la carga e hidrataciÃ³n de Angular con una cadena vÃ¡lida y confiable; el rechazo de certificados con nombre incorrecto, caducados, con fecha futura o de otra CA; y un nuevo rechazo de la cadena vÃ¡lida en otro perfil vacÃ­o. Los rechazos deben producir el error nativo de certificado y cero peticiones HTTP al servidor de la aplicaciÃ³n.

Cada prueba crea su propio perfil de Chromium. DespuÃ©s de que Chromium inicialice su base de certificados y se cierre, el laboratorio aÃ±ade Ãºnicamente la CA generada a ese perfil y vuelve a abrir el navegador. Nunca importa un certificado final ni modifica la confianza del sistema operativo. Usa la [base de certificados del perfil](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/net/server_certificate_database_service_factory.cc) y los [metadatos de confianza](https://raw.githubusercontent.com/chromium/chromium/f842f52ef39fd97b449eb27cff414bf05a98ddce/components/server_certificate_database/server_certificate_database.proto) de Chromium; exige la versiÃ³n 156.0.8078.4 y el esquema 1 para que una actualizaciÃ³n requiera revisiÃ³n explÃ­cita. Necesita Chromium completo (`channel: 'chromium'`).

`observations/browser-tls/` registra fechas y huellas de certificados, errores nativos, detalles TLS, identidad del navegador y hashes del cÃ³digo. Las claves temporales y los perfiles quedan en `.cache/`, ignorado por Git; la evidencia revisada no incluye claves privadas. CI ejecuta esta suite junto con los 25 escenarios originales. Estos certificados locales no prueban revocaciÃ³n de PKI pÃºblica, destinos de producciÃ³n ni otros navegadores.

### Firefox y WebKit

El workflow Security Runtime tambiÃ©n ejecuta los mismos siete casos de certificados en Firefox 157.0 y WebKit 27.2 mediante `npx playwright test --config browser-tls/native.config.mjs`. Todos los contextos usan `ignoreHTTPSErrors: false`; el laboratorio inspecciona los parÃ¡metros reales de los procesos Linux para detectar omisiones y prohÃ­be excepciones de certificados finales en Firefox. Las versiones del navegador se comprueban al actualizar.

Estas pruebas de confianza nativa exigen un runner Ubuntu desechable alojado por GitHub. Firefox usa una [base de certificados NSS](https://nss-crypto.org/reference/security/nss/legacy/tools/nss_tools_certutil/index.html) nueva por prueba, aÃ±ade solo la CA del laboratorio y desactiva la importaciÃ³n de raÃ­ces empresariales. WebKitGTK usa la confianza del sistema del runner: el laboratorio aÃ±ade su CA con nombre Ãºnico, cierra el navegador, elimina Ãºnicamente esa CA y reconstruye el almacÃ©n desechable en `finally`. Nunca cambia la confianza de un equipo personal o autoalojado. El Ãºltimo caso sin CA abre otro navegador y debe volver a rechazar la cadena. La frontera de aislamiento de WebKit es el runner desechable, no un perfil de navegador.

Firefox comunica errores NSS especÃ­ficos de autoridad, nombre y fechas. WebKit comunica un rechazo nativo genÃ©rico de certificado TLS; los metadatos del certificado y las cero peticiones HTTP a la aplicaciÃ³n identifican cada caso negativo construido por separado. Los resultados, hashes y errores nativos se conservan bajo `observations/native-browser-tls/<motor>/` en el artefacto de CI. Se prueban los motores fijados de Playwright en Ubuntu; esto no certifica Safari ni Firefox/WebKit en todos los sistemas operativos.

## Comprobar un agente real

Entrega a un agente independiente nuevo [audit-task.md](audit-task.md), las cinco guÃ­as reales, el cÃ³digo y la capacidad de ejecutar la suite. MantÃ©n `oracle.json`, `verify-agent*` y las evaluaciones guardadas fuera de sus lecturas permitidas. Debe ejecutar las pruebas, leer el recibo nuevo y producir `observations/agent-response.json` con decisiones, razones y evidencias para los 25 casos.

```sh
node --test verify-agent.test.mjs
npm run test:agent -- observations/agent-response.json observations/run.json
```

El verificador compara las decisiones independientes con la clave derivada de las guÃ­as, rechaza casos incompletos, duplicados o mal clasificados y hashes distintos, y vincula la respuesta con la ejecuciÃ³n identificada. No invoca modelos. El workflow Security Runtime repite los 25 escenarios y evalÃºa la salida guardada; esa comprobaciÃ³n de JSON no se presenta como una nueva invocaciÃ³n de modelo.

La evidencia de una ejecuciÃ³n real se guarda bajo `evidence/<fecha>/`. El alcance es un agente, una versiÃ³n de Angular y una topologÃ­a sintÃ©tica. Un recibo JSON por sÃ­ solo no demuestra procedencia ni fiabilidad general: conserva la invocaciÃ³n real y revisa sus razones. Los proveedores de identidad, DNS/proxies de producciÃ³n, otras versiones Angular y otros navegadores necesitan evidencia propia.
