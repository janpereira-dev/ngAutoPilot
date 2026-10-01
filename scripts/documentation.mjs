import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reader documentation only. Runtime skills, prompts, templates and generated
// instruction copies are deliberately not rewritten by localization tooling.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const command = process.argv[2] ?? 'validate';
const allowIncomplete = process.argv.includes('--allow-incomplete');
const rootDocs = ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'ROADMAP.md', 'CHANGELOG.md'];
const extraDocs = ['agents/ngautopilot/README.md', 'skill-lab/README.md', 'skill-lab/POLICY.md', 'skill-lab/CHANGELOG.md', 'skills/angular/upgrades/21-to-22/README.md'];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Documentation must not follow symlinks: ${file}`);
    return entry.isDirectory() ? walk(file) : [path.relative(root, file).split(path.sep).join('/')];
  });
}

const inventoryPath = path.join(root, 'docs', 'documentation-map.json');
function documentationFiles() {
  const recorded = fs.existsSync(inventoryPath) ? JSON.parse(fs.readFileSync(inventoryPath, 'utf8')).sources : [];
  if (!Array.isArray(recorded)) throw new Error('Documentation inventory sources must be an array');
  for (const file of recorded) {
    const validPath = typeof file === 'string' && !file.includes('\\') && !file.includes(':') && !path.posix.isAbsolute(file)
      && file.split('/').every(segment => segment && segment !== '.' && segment !== '..');
    const inScope = validPath && (rootDocs.includes(file) || extraDocs.includes(file) || file.startsWith('docs/') || file.startsWith('openai/submission/'));
    if (!inScope || !file.endsWith('.md') || file.endsWith('.es.md') || file.endsWith('/SKILL.md')) throw new Error(`Invalid recorded documentation source: ${String(file)}`);
    let current = root;
    for (const segment of file.split('/')) {
      current = path.join(current, segment);
      if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Recorded documentation must not follow symlinks: ${file}`);
    }
  }
  return [...new Set([...recorded, ...rootDocs, ...extraDocs, ...walk(path.join(root, 'docs')), ...walk(path.join(root, 'openai', 'submission'))])]
    .filter(file => file.endsWith('.md') && !file.endsWith('.es.md') && !file.endsWith('/SKILL.md') && !file.endsWith('.template.md'))
    .sort();
}

function read(file) { return fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, ''); }
function writeIfChanged(file, content) {
  const target = path.join(root, file);
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) fs.writeFileSync(target, content);
}
function spanish(file) { return file.replace(/\.md$/, '.es.md'); }
function historical(file) { return /^(?:CHANGELOG|skill-lab\/CHANGELOG)|^docs\/(?:specs|superpowers)\/|^openai\/submission\/|^docs\/angular-caniuse\/|^docs\/new-skills-audit\.md$/.test(file); }
function prose(content) {
  return content.replace(/^(?:```|~~~)[\s\S]*?^(?:```|~~~)\s*$/gm, '');
}
function title(file) { return read(file).match(/^#\s+(.+)$/m)?.[1] ?? file; }
function relative(from, to) { return path.relative(path.dirname(path.join(root, from)), path.join(root, to)).split(path.sep).join('/'); }
function anchors(content) {
  const seen = new Map();
  return new Set([...prose(content).matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => {
    const base = match[1].toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, '').replace(/\s/g, '-');
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  }));
}

function generateIndex() {
  const sources = documentationFiles();
  for (const source of sources) if (!fs.existsSync(path.join(root, source))) throw new Error(`Missing recorded English source: ${source}`);
  fs.writeFileSync(inventoryPath, JSON.stringify({ version: 1, scope: 'reader-documentation', sources }, null, 2) + '\n');
  for (const language of ['en', 'es']) {
    const file = language === 'en' ? 'docs/README.md' : 'docs/README.es.md';
    const heading = language === 'en' ? '# Documentation map 🗺️' : '# Mapa de documentación 🗺️';
    const intro = language === 'en'
      ? '**Choose a route, not a reading marathon.** Start with Getting Started, then read only the guide matching your next task. English files are the default; Spanish companions use `.es.md`.'
      : '**Elige una ruta, no una maratón de lectura.** Empieza por Primeros pasos y continúa con la guía de tu próxima tarea. Los archivos predeterminados están en inglés; las versiones españolas utilizan `.es.md`.';
    const route = language === 'en'
      ? '1. [Install and try one task](getting-started.md).\n2. [Choose a focused pack](packs.md).\n3. [Verify and troubleshoot](troubleshooting.md).'
      : '1. [Instala y prueba una tarea](getting-started.es.md).\n2. [Elige un pack específico](packs.es.md).\n3. [Verifica y resuelve problemas](troubleshooting.es.md).';
    const graphic = fs.existsSync(path.join(root, 'assets', 'reading-routes.svg'))
      ? `\n\n![${language === 'en' ? 'Reading routes for first use, daily work, and maintenance.' : 'Rutas de lectura para primer uso, trabajo diario y mantenimiento.'}](../assets/reading-routes${language === 'es' ? '.es' : ''}.svg)`
      : '';
    const scope = language === 'en'
      ? 'This index covers reader-facing documentation, including root policies, all Markdown under `docs/`, role-registry guidance, Skill Lab guides, versioned submission records, and the Angular hop README. Runtime `SKILL.md`, agent prompts/roles, adapter templates, benchmark inputs, and generated copies remain operational source artifacts, not independently translated instructions. Their purpose and use are explained by the bilingual guides. Historical records retain their original dates and decisions; they are not current feature guarantees. This complete map is for a repository checkout: Skill Lab and versioned OpenAI submission records are intentionally absent from the npm tarball, so their links require the checkout.'
      : 'Este índice cubre documentación para lectores: políticas raíz, todo Markdown de `docs/`, guía del registro de roles, guías de Skill Lab, expedientes de envío y README del salto Angular. Los archivos operativos `SKILL.md`, prompts y roles de agentes, plantillas de adaptadores, entradas de benchmarks y copias generadas conservan sus instrucciones canónicas; no se convierten en instrucciones independientes traducidas. Las guías bilingües explican su uso. Los registros históricos conservan fechas y decisiones y no garantizan capacidades actuales. Este mapa completo corresponde al checkout del repositorio: Skill Lab y los expedientes de envío OpenAI no se incluyen en npm; sus enlaces requieren ese checkout.';
    const rows = documentationFiles().filter(item => item !== 'docs/README.md').map(item => {
      const counterpart = spanish(item);
      const exists = fs.existsSync(path.join(root, counterpart));
      const kind = historical(item) ? (language === 'en' ? 'Historical record' : 'Registro histórico') : (language === 'en' ? 'Guide / policy' : 'Guía / política');
      const primary = language === 'es' && exists ? counterpart : item;
      const alternate = language === 'es'
        ? `[English](${relative(file, item)})${exists ? '' : ' — Español pendiente'}`
        : (exists ? `[Español](${relative(file, counterpart)})` : 'Pending — not yet translated');
      return `| [${title(primary).replaceAll('|', '\\|')}](${relative(file, primary)}) | ${kind} | ${alternate} |`;
    });
    const header = language === 'en' ? '| English source | Type | Spanish edition |' : '| Documento en español | Tipo | Fuente inglesa |';
    const footer = language === 'en'
      ? 'A link means an edition exists, not that its technical claims are automatically verified. `node scripts/documentation.mjs validate` checks pair coverage, local Markdown links/anchors, UTF-8 replacement and invisible/bidirectional controls, unresolved translation tokens, stale fallbacks, and balanced fenced blocks. It does not certify prose quality, external URLs, HTML rendering, or actual agent execution. Use `--allow-incomplete` only during ongoing work; it reports missing editions without treating coverage as complete.'
      : 'Un enlace indica que existe una edición, no que sus afirmaciones se hayan verificado automáticamente. `node scripts/documentation.mjs validate` comprueba pares, enlaces y anclas Markdown locales, sustitución UTF-8, controles invisibles/bidireccionales, marcadores de traducción sin resolver, referencias provisionales obsoletas y bloques delimitados equilibrados. No certifica calidad de redacción, enlaces externos, renderizado HTML ni ejecución del agente. Utiliza `--allow-incomplete` solo durante el trabajo: informa de ediciones ausentes sin considerar la cobertura completa.';
    fs.writeFileSync(path.join(root, file), `${heading}\n\n[English](README.md) · [Español](README.es.md) · [${language === 'en' ? 'Project' : 'Proyecto'}](../${language === 'en' ? 'README.md' : 'README.es.md'})\n\n${intro}${graphic}\n\n## ${language === 'en' ? 'Quick route' : 'Ruta rápida'}\n\n${route}\n\n## ${language === 'en' ? 'Scope and historical context' : 'Alcance y contexto histórico'}\n\n${scope}\n\n## ${language === 'en' ? 'Every document' : 'Todos los documentos'}\n\n${header}\n| --- | --- | --- |\n${rows.join('\n')}\n\n## ${language === 'en' ? 'Validation boundary' : 'Límites de validación'}\n\n${footer}\n`);
  }
}

function validate() {
  const errors = [];
  const files = documentationFiles();
  let missing = 0;
  let links = 0;
  for (const file of files) {
    if (!fs.existsSync(path.join(root, file))) { errors.push(`Missing recorded English source: ${file}`); continue; }
    const counterpart = spanish(file);
    if (!fs.existsSync(path.join(root, counterpart))) {
      missing++;
      if (!allowIncomplete) errors.push(`Missing Spanish edition: ${counterpart}`);
    }
    for (const edition of [file, counterpart].filter(item => fs.existsSync(path.join(root, item)))) {
      const content = read(edition);
      if (content.includes('\uFFFD')) errors.push(`UTF-8 replacement character: ${edition}`);
      if (/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/u.test(content)) errors.push(`Invisible or bidirectional Unicode control: ${edition}`);
      if (/\{\{CODE:\d+\}\}/.test(content)) errors.push(`Unresolved translation placeholder: ${edition}`);
      if (content.includes('EN; traducción pendiente')) errors.push(`Stale translation fallback: ${edition}`);
      let fence = null;
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (!match) continue;
        if (!fence) fence = match[1];
        else if (match[1][0] === fence[0] && match[1].length >= fence.length) fence = null;
      }
      if (fence) errors.push(`Unclosed code fence: ${edition}`);
      for (const match of prose(content).matchAll(/!?\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"\n]*")?\)/g)) {
        const target = match[1];
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
        links++;
        const [rawFile, rawAnchor] = target.split('#');
        const resolved = path.resolve(path.dirname(path.join(root, edition)), decodeURIComponent(rawFile || path.basename(edition)));
        if (!fs.existsSync(resolved)) { errors.push(`Missing link: ${edition} -> ${target}`); continue; }
        if (rawAnchor && resolved.endsWith('.md') && !anchors(fs.readFileSync(resolved, 'utf8')).has(decodeURIComponent(rawAnchor))) errors.push(`Missing anchor: ${edition} -> ${target}`);
      }
    }
  }
  console.log(`Documentation: ${files.length} English sources, ${files.length - missing} Spanish editions, ${missing} pending; ${links} local links inspected.`);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else if (missing) console.log('INCOMPLETE: pair coverage is not complete; this is a progress check only.');
  else console.log('Documentation structure and pair coverage passed. Editorial/technical review remains a separate responsibility.');
}

function navigation() {
  for (const file of documentationFiles().filter(item => item !== 'README.md' && item !== 'docs/README.md')) {
    for (const edition of [file, spanish(file)].filter(item => fs.existsSync(path.join(root, item)))) {
      const isSpanish = edition.endsWith('.es.md');
      const counterpart = isSpanish ? file : spanish(file);
      const toggle = fs.existsSync(path.join(root, counterpart))
        ? `[${isSpanish ? 'English' : 'Español'}](${relative(edition, counterpart)})`
        : 'Español: pending translation';
      const note = historical(file)
        ? (isSpanish ? '> Registro histórico: conserva las decisiones y fechas originales; no demuestra el estado actual de publicación o implementación.\n\n' : '> Historical record: original decisions and dates are retained; this is not proof of current release or implementation state.\n\n')
        : '';
      const block = `<!-- docs:navigation:start -->\n${toggle} · [${isSpanish ? 'Mapa' : 'Map'}](${relative(edition, isSpanish ? 'docs/README.es.md' : 'docs/README.md')}) · [${isSpanish ? 'Inicio' : 'Home'}](${relative(edition, isSpanish ? 'README.es.md' : 'README.md')})\n\n${note}<!-- docs:navigation:end -->\n`;
      let content = read(edition).replace(/<!-- docs:navigation:start -->[\s\S]*?<!-- docs:navigation:end -->\n?/g, '');
      content = content.replace(/^(# .+)\r?\n(?:[ \t]*\r?\n)*/m, `$1\n\n${block}\n`);
      writeIfChanged(edition, content.replace(/\r\n/g, '\n').trimEnd() + '\n');
    }
  }
}

if (command === 'index') generateIndex();
else if (command === 'navigation') navigation();
else if (command === 'validate') validate();
else throw new Error('Usage: node scripts/documentation.mjs index|navigation|validate [--allow-incomplete]');
