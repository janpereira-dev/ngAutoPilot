import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Native, localizable diagrams: no fonts, network assets or rendering dependencies.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const colors = { ink: '#172b42', muted: '#46576a', paper: '#f7f4ed', teal: '#056f65', coral: '#b8402d', violet: '#6445a2', blue: '#2855a0' };
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const choose = (language, en, es) => language === 'es' ? es : en;
function words(value, limit) {
  const result = [];
  for (const word of value.split(' ')) {
    const last = result.length - 1;
    if (last < 0 || result[last].length + word.length + 1 > limit) result.push(word);
    else result[last] += ` ${word}`;
  }
  return result;
}
function text(x, y, value, size = 22, weight = 400, color = colors.ink, width = 0, extra = '') {
  const lines = Array.isArray(value) ? value : width ? words(value, width) : [value];
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" ${extra}>${lines.map((line, index) => `<tspan x="${x}" dy="${index ? Math.ceil(size * 1.35) : 0}">${escape(line)}</tspan>`).join('')}</text>`;
}
const rect = (x, y, w, h, fill = '#ffffff', stroke = 'none', radius = 20) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const line = (x1, y1, x2, y2, color = colors.ink, arrow = false) => `<path d="M${x1} ${y1}H${x2}${y2 !== y1 ? `V${y2}` : ''}" fill="none" stroke="${color}" stroke-width="2.5" ${arrow ? 'marker-end="url(#arrow)"' : ''}/>`;
function icon(name, x, y, color = colors.teal, scale = 1) {
  const paths = {
    compass: '<circle cx="24" cy="24" r="20"/><path d="m31 17-4 14-10-10 14-4Z"/><path d="M24 0v4m0 40v4M0 24h4m40 0h4"/>',
    stack: '<path d="m3 14 21-10 21 10-21 10L3 14Zm0 10 21 10 21-10M3 34l21 10 21-10"/>',
    inspect: '<circle cx="20" cy="20" r="14"/><path d="m31 31 13 13M13 20h14m-7-7v14"/>',
    approve: '<path d="m6 26 11 11L43 11"/><path d="M23 4H5v40h36V28"/>',
    terminal: '<rect x="2" y="6" width="44" height="36" rx="7"/><path d="m10 17 9 7-9 7m17 0h10"/>',
    branch: '<circle cx="9" cy="7" r="5"/><circle cx="39" cy="7" r="5"/><circle cx="9" cy="41" r="5"/><path d="M9 12v24m30-24v6c0 10-30 8-30 17"/>',
    shield: '<path d="M24 3 43 11v13c0 11-19 21-19 21S5 35 5 24V11L24 3Z"/><path d="m14 23 7 7 13-14"/>',
    code: '<path d="m15 12-12 12 12 12m18-24 12 12-12 12M28 5l-8 38"/>',
    book: '<path d="M24 11C15 3 6 5 2 7v33c8-4 15-3 22 3 7-6 14-7 22-3V7c-4-2-13-4-22 4Zm0 0v32M8 16h10M8 24h10m12-8h10m-10 8h10"/>',
    state: '<circle cx="8" cy="24" r="6"/><circle cx="38" cy="8" r="6"/><circle cx="38" cy="40" r="6"/><path d="m14 21 18-10M14 27l18 10"/>',
    ui: '<rect x="2" y="5" width="44" height="38" rx="5"/><path d="M2 15h44M18 15v28m8-19h12m-12 9h8"/>',
    test: '<path d="M16 3h16m-13 0v14L5 39c-2 3 1 6 4 6h30c3 0 6-3 4-6L29 17V3M13 30h23"/><path d="m19 36 4 4 8-8"/>',
  };
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.compass}</g>`;
}
function frame(language, height, section, title, subtitle, body, footer, motion = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title desc" xml:lang="${language}">
<title id="title">${escape(title)}</title>
<desc id="desc">${escape(subtitle)} ${escape(footer)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="${colors.ink}"/></marker>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#172b42" opacity=".08"/></pattern>
<style>text{font-family:"Segoe UI",Arial,sans-serif} ${motion ? '.traveler{opacity:0}@media (prefers-reduced-motion: no-preference){.traveler{animation:travel 3.6s ease-in-out 1}}@keyframes travel{0%{transform:translateX(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(880px);opacity:0}}' : ''}</style></defs>
${rect(0, 0, 1200, height, colors.paper, 'none', 28)}
<rect x="0" y="0" width="1200" height="${height - 65}" fill="url(#dots)" rx="28"/>
${rect(36, 28, 74, 30, colors.ink, 'none', 15)}${text(73, 49, section, 15, 700, '#ffffff', 0, 'text-anchor="middle"')}
${text(125, 49, choose(language, 'NgAutoPilot / FIELD GUIDE', 'NgAutoPilot / GUÍA DE CAMPO'), 15, 700, colors.muted)}
${text(36, 104, title, 36, 750)}${text(36, 141, subtitle, 20, 400, colors.muted)}
${body}
${rect(20, height - 65, 1160, 45, colors.ink, 'none', 15)}${text(42, height - 35, footer, 19, 600, '#ffffff')}
</svg>\n`;
}
function hero(language) {
  const t = (en, es) => choose(language, en, es);
  let body = text(40, 220, ['NgAutoPilot', t('Less noise.', 'Menos ruido.'), t('More direction.', 'Más dirección.')], 53, 750);
  body += text(42, 421, t('Small guides. Clear choices.', 'Guías breves. Decisiones claras.'), 24, 500, colors.muted);
  body += rect(40, 465, 414, 55, '#d7ebe6') + icon('compass', 54, 478, colors.teal, .6)
    + text(95, 499, t('You lead. Your agent follows.', 'Tú diriges. Tu agente te acompaña.'), 21, 650, colors.teal);
  // Catalog sheets feed a selected task card, then a receiving-project window.
  body += rect(586, 180, 187, 191, '#e4dcef', colors.violet, 16) + rect(571, 190, 187, 191, '#eee8f5', colors.violet, 16)
    + rect(556, 200, 187, 191, '#ffffff', colors.violet, 16) + icon('stack', 620, 222, colors.violet)
    + text(579, 297, t('The catalog', 'El catálogo'), 25, 700) + text(579, 331, t('Reusable guides', 'Guías reutilizables'), 18, 400, colors.muted)
    + text(579, 365, 'skills/', 19, 600, colors.violet);
  body += line(760, 291, 817, 291, colors.ink, true) + rect(831, 210, 324, 153, '#ffffff', colors.coral, 22)
    + icon('compass', 850, 231, colors.coral, .75) + text(905, 254, t('One useful pack', 'Un pack útil'), 25, 700)
    + text(852, 306, t('Select for your task,', 'Elige según la tarea,'), 21, 400, colors.muted)
    + text(852, 334, t('not for every possibility.', 'no por todas las posibilidades.'), 21, 400, colors.muted);
  body += line(993, 365, 993, 404, colors.ink, true) + rect(554, 415, 601, 132, colors.ink)
    + icon('terminal', 575, 433, '#91ddd0', .85) + text(637, 459, t('Your project + your agent', 'Tu proyecto + tu agente'), 27, 700, '#ffffff')
    + text(577, 500, t('A bounded change → checks → evidence', 'Cambio acotado → pruebas → evidencia'), 23, 500, '#e8e5f3')
    + text(577, 529, t('Guidance is not automatic execution.', 'Las guías no se ejecutan solas.'), 18, 400, '#e8e5f3');
  return frame(language, 640, t('HELLO', 'HOLA'), t('A flight plan for your next engineering task', 'Un plan de vuelo para tu próxima tarea'), t('From a reusable catalog to the guidance your project actually needs.', 'Del catálogo reutilizable a las guías que realmente necesita tu proyecto.'), body, t('Not a runtime library. Not an automatic migrator. The human remains in control.', 'No es una librería de ejecución ni un migrador automático. La persona mantiene el control.'));
}
function firstRun(language) {
  const t = (en, es) => choose(language, en, es);
  const steps = [
    [t('Find the IDs', 'Busca los IDs'), 'adapters · packs', t('Choose agent + pack', 'Elige agente + pack'), 'compass'],
    [t('Preview', 'Previsualiza'), '--dry-run', t('Read paths and conflicts', 'Revisa rutas y conflictos'), 'inspect'],
    [t('Approve', 'Autoriza'), '--yes', t('Only after review', 'Solo después de revisar'), 'approve'],
    [t('Verify files', 'Verifica archivos'), 'verify', t('Manifest + checksums', 'Manifiesto + checksums'), 'shield'],
  ];
  let body = '';
  for (let i = 0; i < steps.length; i++) {
    const x = 40 + i * 290;
    if (i < steps.length - 1) body += line(x + 26, 212, x + 316, 212, '#748291');
    body += `<circle cx="${x + 26}" cy="212" r="25" fill="${i === 2 ? colors.coral : colors.teal}"/>` + text(x + 26, 220, String(i + 1), 23, 700, '#ffffff', 0, 'text-anchor="middle"');
    body += icon(steps[i][3], x + 6, 259, i === 2 ? colors.coral : colors.teal, .85)
      + text(x, 342, steps[i][0], 26, 700) + text(x, 380, steps[i][1], 22, 650, colors.blue)
      + text(x, 417, steps[i][2], 20, 400, colors.muted, 24);
  }
  body += rect(40, 475, 1120, 109, '#d7ebe6', colors.teal) + icon('terminal', 60, 494, colors.teal)
    + text(126, 510, t('Last checkpoint: ask your agent to name the installed skill.', 'Último control: pide al agente que identifique la skill instalada.'), 24, 700)
    + text(126, 546, t('A file check is not proof that the host discovers or invokes it.', 'Verificar archivos no demuestra que el host la encuentre o la invoque.'), 21, 400, colors.muted);
  return frame(language, 675, '01', t('Your first run: four stops, then a real task', 'Primera ejecución: cuatro paradas y una tarea real'), t('Run from the receiving project. Review the plan before approving any writes.', 'Trabaja desde el proyecto de destino. Revisa el plan antes de autorizar escrituras.'), body, t('Codex project example: .agents/skills/ + AGENTS.md. Installation does not change your app.', 'Ejemplo Codex, proyecto: .agents/skills/ + AGENTS.md. Instalar no modifica tu aplicación.'));
}
function packMap(language) {
  const t = (en, es) => choose(language, en, es);
  const jobs = [
    [t('Any project', 'Cualquier proyecto'), t('Intake, versions, routing', 'Contexto, versiones, selección'), 'core', 'compass', colors.teal],
    [t('Structure', 'Estructura'), t('Components, services, boundaries', 'Componentes, servicios, límites'), 'angular-foundations', 'stack', colors.violet],
    [t('State', 'Estado'), 'Signals · RxJS', 'angular-state', 'state', colors.blue],
    [t('User interface', 'Interfaz'), t('Forms, routes, templates, Material', 'Formularios, rutas, Material'), 'angular-ui', 'ui', colors.coral],
    [t('Runtime', 'Ejecución'), t('SSR · build · performance', 'SSR · build · rendimiento'), 'angular-runtime', 'terminal', colors.blue],
    [t('Tests', 'Pruebas'), t('TestBed · components', 'TestBed · componentes'), 'angular-testing', 'test', colors.teal],
    [t('Frontend / UX', 'Frontend / UX'), t('Framework-neutral accessibility', 'Accesibilidad sin framework'), 'frontend', 'inspect', colors.violet],
    [t('One major hop', 'Un salto de versión'), t('Upgrade ≠ modernization', 'Actualizar ≠ modernizar'), 'angular-<from>-to-<to>', 'branch', colors.coral],
  ];
  let body = '';
  jobs.forEach(([title, detail, slug, glyph, color], index) => {
    const x = 40 + index % 2 * 570;
    const y = 177 + Math.floor(index / 2) * 139;
    body += rect(x, y, 550, 121, '#ffffff', '#d3d9df', 14) + rect(x, y, 7, 121, color, 'none', 3)
      + icon(glyph, x + 22, y + 25, color, .85) + text(x + 85, y + 34, title, 26, 700)
      + text(x + 85, y + 65, detail, 20, 400, colors.muted) + text(x + 85, y + 98, slug, 21, 650, color);
  });
  body += text(42, 770, t('Full ID = ngautopilot- + the label above. Focused packs include Core.', 'ID completo = ngautopilot- + la etiqueta. Los packs específicos incluyen Core.'), 22, 600);
  return frame(language, 860, '02', t('Choose by the job, not by the size of the pack', 'Elige por la tarea, no por el tamaño del pack'), t('Eight starting points. Use the table below for the exact install IDs.', 'Ocho puntos de partida. La tabla incluye los IDs exactos para instalar.'), body, t('One selection per agent + scope. Switching replaces that selection; inspect and back up first.', 'Una selección por agente + ámbito. Cambiar pack la sustituye: revisa y crea una copia antes.'));
}
function concepts(language) {
  const t = (en, es) => choose(language, en, es);
  let body = rect(40, 187, 525, 256, '#eee8f5', colors.violet) + icon('stack', 60, 205, colors.violet, .7)
    + text(108, 233, '2 / Pack', 29, 700) + text(60, 271, t('A selection for a job', 'Una selección para una tarea'), 22, 400, colors.muted)
    + rect(61, 298, 232, 123, '#ffffff', colors.violet, 13) + text(80, 331, '1 / Skill', 26, 700)
    + text(80, 365, t('One problem,', 'Un problema,'), 21) + text(80, 393, t('one procedure', 'un procedimiento'), 21)
    + rect(308, 298, 235, 123, '#ffffff', colors.violet, 13) + text(325, 329, t('4 / Role', '4 / Rol'), 26, 700)
    + text(325, 364, t('Optional specialist', 'Especialista opcional'), 20) + text(325, 393, t('Markdown ≠ process', 'Markdown ≠ proceso'), 20);
  body += line(569, 305, 615, 305, colors.ink, true) + rect(631, 223, 242, 190, '#d7ebe6', colors.teal)
    + icon('branch', 655, 242, colors.teal, .7) + text(653, 312, t('3 / Adapter', '3 / Adaptador'), 28, 700)
    + text(653, 348, t('Maps files to', 'Coloca archivos en'), 21) + text(653, 376, t('the host layout', 'el formato del host'), 21)
    + line(880, 305, 921, 305, colors.ink, true) + icon('terminal', 991, 249, colors.blue, 1.3)
    + text(942, 353, t('Your agent', 'Tu agente'), 28, 700) + text(942, 387, t('Find + invoke', 'Buscar + invocar'), 21, 400, colors.muted);
  body += rect(40, 474, 1120, 109, '#fae3d9', colors.coral) + icon('shield', 58, 493, colors.coral)
    + text(124, 512, '5 / Guardrail', 28, 700) + text(375, 512, t('A rule for reviewing the work', 'Una regla para revisar el trabajo'), 25, 650)
    + text(124, 549, t('Requires evidence or mitigation. Not a permission system or runtime enforcement.', 'Exige evidencia o mitigación. No es un sistema de permisos ni control en ejecución.'), 21, 400, colors.muted);
  return frame(language, 675, '03', t('Five concepts, one connected system', 'Cinco conceptos, un sistema conectado'), t('The pack selects; the adapter places; the host still has to discover the guidance.', 'El pack selecciona; el adaptador coloca; el host todavía debe encontrar las guías.'), body, t('Installing Markdown does not deploy, register MCP, grant permissions or start subagents.', 'Instalar Markdown no despliega, registra MCP, concede permisos ni inicia subagentes.'));
}
function learningRoute(language) {
  const t = (en, es) => choose(language, en, es);
  const steps = [
    [t('Inspect', 'Inspecciona'), t('Project + versions', 'Proyecto + versiones'), 'inspect'],
    [t('Choose', 'Selecciona'), t('Relevant guidance', 'Guías pertinentes'), 'compass'],
    [t('Approve', 'Autoriza'), t('A bounded change', 'Un cambio acotado'), 'approve'],
    [t('Validate', 'Valida'), t('Existing checks', 'Pruebas existentes'), 'test'],
    [t('Report', 'Informa'), t('Evidence + limits', 'Evidencia + límites'), 'book'],
  ];
  let body = line(134, 223, 1065, 223, '#748291');
  steps.forEach(([title, detail, glyph], index) => {
    const x = 40 + index * 230;
    body += `<circle cx="${x + 60}" cy="223" r="32" fill="${index === 2 ? colors.coral : colors.teal}"/>`
      + text(x + 60, 232, `0${index + 1}`, 25, 700, '#ffffff', 0, 'text-anchor="middle"')
      + icon(glyph, x + 36, 284, index === 2 ? colors.coral : colors.teal)
      + text(x, 375, title, 27, 700) + text(x, 412, detail, 21, 400, colors.muted, 19);
  });
  body += `<circle class="traveler" cx="135" cy="223" r="7" fill="#ffd574" aria-hidden="true"/>`;
  return frame(language, 555, 'ROUTE', t('One task. A visible route. Real evidence.', 'Una tarea. Una ruta visible. Evidencia real.'), t('A repeatable working rhythm, not an autonomous execution pipeline.', 'Un ritmo de trabajo repetible, no una secuencia de ejecución autónoma.'), body, t('The decorative marker runs once for 3.6 s; reduced motion keeps every step static.', 'El indicador decorativo recorre la ruta una vez en 3,6 s; el movimiento reducido lo desactiva.'), true);
}
function prompt(language) {
  const t = (en, es) => choose(language, en, es);
  let body = rect(40, 185, 537, 340, '#ffffff', '#d3d9df') + rect(623, 185, 537, 340, colors.ink)
    + icon('code', 62, 207, colors.blue, .75) + text(117, 233, t('Brief your agent', 'Da contexto al agente'), 30, 700)
    + icon('book', 646, 207, '#91ddd0', .75) + text(700, 233, t('Ask for evidence', 'Pide evidencia'), 30, 700, '#ffffff');
  const left = [t('Task + intended outcome', 'Tarea + resultado esperado'), t('Project + actual versions', 'Proyecto + versiones reales'), t('Applicable installed skill', 'Skill instalada y pertinente'), t('Small plan before editing', 'Plan breve antes de editar')];
  const right = [t('Detected versions', 'Versiones detectadas'), t('Named guidance + bounded diff', 'Guía concreta + cambio acotado'), t('Checks + real outputs', 'Pruebas + resultados reales'), t('Unrun checks + remaining limits', 'Pruebas no ejecutadas + límites')];
  left.forEach((label, i) => {
    body += text(64, 300 + i * 56, `0${i + 1}`, 19, 700, colors.blue) + text(113, 300 + i * 56, label, 22, 500);
    body += `<path d="m648 ${293 + i * 56} 7 7 13-15" fill="none" stroke="#91ddd0" stroke-width="3"/>` + text(683, 300 + i * 56, right[i], 22, 500, '#ffffff');
  });
  body += line(580, 350, 614, 350, colors.ink, true);
  return frame(language, 615, '04', t('A useful prompt is a brief, not a magic spell', 'Un prompt útil es una guía, no un hechizo'), t('Specify the task and constraints. Define what a trustworthy result looks like.', 'Define la tarea y sus límites. Aclara cómo debe ser un resultado verificable.'), body, t('“Done” is not evidence. Keep upgrades separate from modernization.', '«Terminado» no es evidencia. Separa la actualización de la modernización.'));
}
function catalog(language) {
  const t = (en, es) => choose(language, en, es);
  let body = rect(40, 205, 352, 275, '#eee8f5', colors.violet) + icon('stack', 62, 227, colors.violet)
    + text(124, 256, t('Canonical sources', 'Fuentes canónicas'), 26, 700)
    + text(64, 315, ['skills/', 'packs/', 'adapters/', 'agents/ngautopilot/'], 23, 650, colors.violet)
    + text(64, 453, t('Edit here, then regenerate.', 'Edita aquí y regenera.'), 21, 500);
  body += `<path d="M397 340H456M456 243V437M456 243H510M456 340H510M456 437H510" fill="none" stroke="${colors.ink}" stroke-width="2.5"/>`;
  const branches = [
    ['catalog.json', t('Index of the skill catalog', 'Índice del catálogo de skills'), colors.blue],
    ['plugins/', t('Native bundles and manifests', 'Bundles nativos y manifiestos'), colors.teal],
    ['agent-plugins/', t('Portable distribution packages', 'Paquetes de distribución portables'), colors.coral],
  ];
  branches.forEach(([label, detail, color], i) => {
    const y = 199 + i * 97;
    body += rect(510, y, 650, 84, '#ffffff', color, 13) + text(532, y + 31, label, 26, 700, color) + text(532, y + 66, detail, 21, 400, colors.muted);
  });
  body += text(42, 541, t('Validate the sources → regenerate copies → check consistency.', 'Valida las fuentes → regenera las copias → comprueba coherencia.'), 25, 650);
  return frame(language, 630, '05', t('One source catalog, several distribution routes', 'Un catálogo fuente, varias rutas de distribución'), t('This is a dependency map, not a claim that every host has run the package.', 'Este mapa muestra dependencias; no afirma que cada host haya ejecutado el paquete.'), body, t('Do not hand-edit generated copies. Counts and capabilities belong to a specific version.', 'No edites a mano las copias generadas. Cantidades y capacidades dependen de la versión.'));
}
function distributions(language) {
  const t = (en, es) => choose(language, en, es);
  const routes = [
    ['CLI + adapters', t('A focused pack for a receiving project', 'Un pack específico para el proyecto de destino'), t('Then check host discovery', 'Después verifica el descubrimiento'), 'terminal', colors.teal],
    [t('Native marketplace', 'Marketplace nativo'), t('Host-specific plugin bundles', 'Bundles de plugins específicos del host'), t('Publication is a separate step', 'La publicación es otro paso'), 'stack', colors.violet],
    ['Agent Plugins Preview', t('Portable skills; MCP is separate', 'Skills portables; MCP es independiente'), t('Verify each host, not just metadata', 'Verifica cada host, no solo metadatos'), 'branch', colors.blue],
    ['skills.sh / Pi', t('Individual skills or package discovery', 'Skills individuales o descubrimiento'), t('Not the CLI pack-selection contract', 'No es la selección de packs de la CLI'), 'compass', colors.coral],
  ];
  let body = '';
  routes.forEach(([label, detail, check, glyph, color], index) => {
    const y = 185 + index * 122;
    body += rect(40, y, 1120, 102, '#ffffff', '#d3d9df', 16) + icon(glyph, 60, y + 29, color, .8)
      + text(118, y + 43, label, 25, 700, color) + text(118, y + 78, detail, 21, 400, colors.muted)
      + line(681, y + 51, 723, y + 51, colors.ink, true) + text(750, y + 44, check, 22, 600, colors.ink, 31);
  });
  return frame(language, 765, '06', t('Same catalog. Different delivery contracts.', 'Mismo catálogo. Distintos contratos de entrega.'), t('Choose the integration you need; confirm support and behavior in that host.', 'Elige la integración necesaria; confirma soporte y comportamiento en ese host.'), body, t('Local stdio MCP ≠ a ChatGPT web connector. The OpenAI packet is not submitted or verified.', 'MCP stdio local ≠ conector web ChatGPT. El expediente OpenAI no está enviado ni verificado.'));
}
function chapters(language) {
  const t = (en, es) => choose(language, en, es);
  const routes = [
    [t('New here?', '¿Primera visita?'), [t('Getting started', 'Primeros pasos'), t('First Angular task', 'Primera tarea Angular'), t('Troubleshooting', 'Solución de problemas')], colors.teal, 'compass'],
    [t('Daily work', 'Trabajo diario'), [t('Pick a pack', 'Elegir un pack'), t('CLI + version guides', 'CLI + guías de versiones'), t('Update / uninstall', 'Actualizar / desinstalar')], colors.blue, 'code'],
    [t('Maintain / contribute', 'Mantener / contribuir'), [t('Contributing', 'Contribuir'), t('Maintainer guide', 'Guía de mantenimiento'), t('Release checklist', 'Lista de publicación')], colors.violet, 'branch'],
  ];
  let body = '';
  routes.forEach(([title, stops, color, glyph], index) => {
    const y = 209 + index * 130;
    body += icon(glyph, 40, y - 24, color, .8) + text(99, y + 5, title, 25, 700, color)
      + line(402, y, 1086, y, color);
    stops.forEach((stop, i) => {
      const x = 415 + i * 264;
      body += `<circle cx="${x}" cy="${y}" r="10" fill="${colors.paper}" stroke="${color}" stroke-width="4"/>`
        + text(x - 6, y + 43, stop, 22, 600, colors.ink, 21);
    });
  });
  return frame(language, 660, '07', t('Choose a reading route, not a reading marathon', 'Elige una ruta de lectura, no una maratón'), t('Follow one lane. The links below take you to the complete guide.', 'Sigue una ruta. Los enlaces inferiores llevan a las guías completas.'), body, t('Specialist detours: roles + guardrails, Angular compatibility, and the separate MCP server.', 'Desvíos especializados: roles y reglas de revisión, compatibilidad Angular y servidor MCP.'));
}
function maintainer(language) {
  const t = (en, es) => choose(language, en, es);
  const stages = [
    [t('Validate', 'Valida'), 'skills:validate', 'shield'],
    [t('Index', 'Indexa'), 'skills:catalog', 'book'],
    [t('Sync bundles', 'Sincroniza bundles'), ['plugins:sync', 'agent-plugins:sync'], 'branch'],
    [t('Compare', 'Compara'), 'consistency:validate', 'inspect'],
  ];
  let body = '';
  stages.forEach(([title, command, glyph], i) => {
    const x = 40 + i * 290;
    body += icon(glyph, x + 73, 203, i === 2 ? colors.coral : colors.teal, 1.3)
      + text(x, 311, title, 25, 700) + text(x, 351, command, 21, 600, colors.blue);
    if (i < 3) body += line(x + 185, 235, x + 264, 235, colors.ink, true);
  });
  body += rect(40, 415, 1120, 121, '#fae3d9', colors.coral) + icon('inspect', 59, 441, colors.coral)
    + text(130, 456, t('Before publishing: review the generated diff + full release checklist.', 'Antes de publicar: revisa el diff generado y la lista completa de publicación.'), 24, 700)
    + text(130, 496, t('These steps can write generated files. Passing them is not external approval.', 'Estos pasos pueden escribir archivos. Superarlos no equivale a aprobación externa.'), 21, 400, colors.muted);
  return frame(language, 625, '08', t('Maintain the sources, regenerate the deliveries', 'Mantén las fuentes, regenera las entregas'), t('Run each command with npm run. This is the catalog-maintenance route, not app usage.', 'Ejecuta cada comando con npm run. Esta es la ruta del catálogo, no de tu aplicación.'), body, t('Local validation → reviewed changes → separate release process. Never imply automatic publication.', 'Validación local → cambios revisados → publicación independiente. Nunca implica publicación automática.'));
}

export const diagrams = [
  ['ngautopilot-hero', hero], ['first-run', firstRun], ['pack-map', packMap],
  ['five-concepts', concepts], ['learning-route', learningRoute], ['prompt-guide', prompt],
  ['catalog-map', catalog], ['distribution-routes', distributions], ['reading-routes', chapters],
  ['ngautopilot-flow', maintainer],
];
export function renderGraphics() {
  return new Map(diagrams.flatMap(([name, render]) => ['en', 'es'].map(language => [
    `${name}${language === 'es' ? '.es' : ''}.svg`, render(language),
  ])));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const [filename, content] of renderGraphics()) {
    const target = path.join(root, 'assets', filename);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
        console.error(`Stale documentation graphic: assets/${filename}`);
        stale++;
      }
    } else fs.writeFileSync(target, content);
  }
  if (stale) process.exitCode = 1;
  else console.log(`${check ? 'Checked' : 'Generated'} 20 SVG graphics (10 English/Spanish pairs).`);
}
