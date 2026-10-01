import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { diagrams, renderGraphics } from '../scripts/documentation-graphics.mjs';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ngautopilot-docs-test-'));
  t.after(() => {
    const relative = path.relative(os.tmpdir(), root);
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
    assert.ok(path.basename(root).startsWith('ngautopilot-docs-test-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const write = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  };
  write('scripts/documentation.mjs', fs.readFileSync(path.join(sourceRoot, 'scripts/documentation.mjs'), 'utf8'));
  for (const file of ['README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'ROADMAP.md', 'CHANGELOG.md', 'agents/ngautopilot/README.md', 'skill-lab/README.md', 'skill-lab/POLICY.md', 'skill-lab/CHANGELOG.md', 'skills/angular/upgrades/21-to-22/README.md']) write(file, '# Guide\n\n## Details\n\nReader guidance.\n');
  write('docs/example.md', '# Example\n');
  for (const guide of ['getting-started', 'packs', 'troubleshooting']) write(`docs/${guide}.md`, `# ${guide}\n`);
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts/documentation.mjs'), ...args], { cwd: root, encoding: 'utf8' });
  return { root, write, run };
}

test('documentation index inventories nested guides but not runtime skills', t => {
  const f = fixture(t);
  f.write('docs/nested/guide.md', '# Nested guide\n');
  f.write('skills/runtime/SKILL.md', '# Operational skill\n');
  assert.equal(f.run('index').status, 0);
  const map = JSON.parse(fs.readFileSync(path.join(f.root, 'docs/documentation-map.json'), 'utf8'));
  assert.ok(map.sources.includes('docs/nested/guide.md'));
  assert.ok(!map.sources.includes('skills/runtime/SKILL.md'));
  assert.match(fs.readFileSync(path.join(f.root, 'docs/README.es.md'), 'utf8'), /pendiente/);
});

test('strict validation fails for missing Spanish editions', t => {
  const f = fixture(t);
  const result = f.run('validate');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing Spanish edition/);
});

test('anchor comparison allowlists output from normal and malformed HTML tag spans', t => {
  const f = fixture(t);
  f.write('docs/example.md', '# Example\n\n[Normal](#ready) [Malformed](#tone)\n\n## <em>Ready</em>\n\n## <scrip<script>t>One</script>\n');
  const result = f.run('validate', '--allow-incomplete');
  assert.equal(result.status, 0, result.stderr);
});

test('Spanish index prioritizes translated headings and links', t => {
  const f = fixture(t);
  f.write('docs/example.es.md', '# Ejemplo traducido\n');
  assert.equal(f.run('index').status, 0);
  const index = fs.readFileSync(path.join(f.root, 'docs/README.es.md'), 'utf8');
  assert.match(index, /\[Ejemplo traducido\]\(example\.es\.md\)/);
  assert.match(index, /\[English\]\(example\.md\)/);
});

test('incomplete progress check explicitly reports pending coverage', t => {
  const f = fixture(t);
  const result = f.run('validate', '--allow-incomplete');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /INCOMPLETE/);
});

test('progress mode still fails for broken links and anchors', t => {
  const f = fixture(t);
  f.write('docs/example.md', '# Example\n\n[Missing](absent.md)\n[Anchor](../README.md#absent)\n');
  const result = f.run('validate', '--allow-incomplete');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing link/);
  assert.match(result.stderr, /Missing anchor/);
});

test('recorded English sources cannot silently disappear', t => {
  const f = fixture(t);
  assert.equal(f.run('index').status, 0);
  fs.unlinkSync(path.join(f.root, 'docs/example.md'));
  assert.equal(f.run('index').status, 1);
  assert.match(f.run('validate', '--allow-incomplete').stderr, /Missing recorded English source/);
});

test('recorded inventory cannot escape the repository or documentation scope', t => {
  const f = fixture(t);
  for (const source of ['../outside.md', 'C:/outside.md', 'docs/../README.md', 'private/internal.md', 'docs/README.es.md']) {
    f.write('docs/documentation-map.json', JSON.stringify({ sources: [source] }));
    const result = f.run('navigation');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid recorded documentation source/);
  }
});

test('navigation is idempotent and keeps dated records explicitly historical', t => {
  const f = fixture(t);
  f.write('CHANGELOG.es.md', '# Historial\n\n## Versión\n');
  assert.equal(f.run('navigation').status, 0);
  const before = fs.readFileSync(path.join(f.root, 'CHANGELOG.md'), 'utf8');
  assert.equal(f.run('navigation').status, 0);
  assert.equal(fs.readFileSync(path.join(f.root, 'CHANGELOG.md'), 'utf8'), before);
  assert.match(before, /Historical record/);
  assert.match(before, /CHANGELOG.es.md/);
});

test('fenced examples are not treated as live links and invalid text fails', t => {
  const f = fixture(t);
  f.write('docs/example.md', '# Example\n\n```md\n[Example](not-a-real-file.md)\n```\n');
  assert.equal(f.run('validate', '--allow-incomplete').status, 0);
  f.write('docs/example.md', '# Example\n\n\uFFFD\n```text\nnot closed\n');
  const result = f.run('validate', '--allow-incomplete');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /UTF-8 replacement/);
  assert.match(result.stderr, /Unclosed code fence/);
});

test('unresolved translation tokens and invisible controls fail validation', t => {
  const f = fixture(t);
  f.write('docs/example.md', '# Example\n\n{{CODE:3}}\nEN; traducción pendiente\n\u200D\n');
  const result = f.run('validate', '--allow-incomplete');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unresolved translation placeholder/);
  assert.match(result.stderr, /Stale translation fallback/);
  assert.match(result.stderr, /Invisible or bidirectional Unicode control/);
});

test('indented fences suppress example links while matching marker lengths and types', t => {
  const f = fixture(t);
  for (const indentation of ['', ' ', '  ', '   ']) {
    f.write('docs/example.md', '# Example\n\n' + indentation + '````md\n[Example](not-a-file.md)\n```\n~~~\n[Example](also-not-a-file.md)\n' + indentation + '````\n');
    const result = f.run('validate', '--allow-incomplete');
    assert.equal(result.status, 0, result.stderr);
  }
  f.write('docs/example.md', '# Example\n\n   ~~~md\n[Example](not-a-file.md)\n   ~~~\n[Live](missing.md)\n');
  assert.match(f.run('validate', '--allow-incomplete').stderr, /Missing link/);
});

test('strict validation rejects stale discovery inventories and generated navigation tables without rewriting', t => {
  const f = fixture(t);
  assert.equal(f.run('index').status, 0);
  let map = JSON.parse(fs.readFileSync(path.join(f.root, 'docs/documentation-map.json'), 'utf8'));
  for (const source of map.sources) f.write(source.replace(/\.md$/, '.es.md'), '# Guía\n');
  assert.equal(f.run('index').status, 0);
  assert.equal(f.run('validate').status, 0);
  const before = fs.readFileSync(path.join(f.root, 'docs/documentation-map.json'), 'utf8');
  f.write('docs/new.md', '# New guide\n');
  f.write('docs/new.es.md', '# Nueva guía\n');
  assert.match(f.run('validate').stderr, /Stale documentation index/);
  assert.equal(fs.readFileSync(path.join(f.root, 'docs/documentation-map.json'), 'utf8'), before);
  assert.equal(f.run('index').status, 0);
  assert.equal(f.run('validate').status, 0);
  fs.appendFileSync(path.join(f.root, 'docs/README.md'), '\nStale generated content.\n');
  assert.match(f.run('validate').stderr, /Stale documentation index: docs\/README.md/);
});

test('all generated diagrams have complete localized pairs and accessible static content', () => {
  const graphics = renderGraphics();
  assert.equal(graphics.size, 20);
  for (const [name] of diagrams) {
    assert.ok(graphics.has(`${name}.svg`));
    assert.ok(graphics.has(`${name}.es.svg`));
    assert.notEqual(graphics.get(`${name}.svg`), graphics.get(`${name}.es.svg`));
  }
  for (const [filename, expected] of graphics) {
    const svg = fs.readFileSync(path.join(sourceRoot, 'assets', filename), 'utf8');
    assert.equal(svg, expected, `${filename} must match its editable source`);
    assert.match(svg, /aria-labelledby="title desc"/);
    assert.match(svg, /<title id="title">.+<\/title>/);
    assert.match(svg, /<desc id="desc">.+<\/desc>/);
    assert.match(svg, new RegExp(`xml:lang="${filename.includes('.es.') ? 'es' : 'en'}"`));
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|<a\s|\bon\w+=|\b(?:href|src)=|infinite|\uFFFD/);
    assert.match(svg, /viewBox="0 0 1200 \d+"/);
    assert.match(svg, /<text /);
    if (!filename.startsWith('learning-route')) assert.doesNotMatch(svg, /animation:|@keyframes/);
  }
});

test('only the decorative route marker moves once, with opt-in motion', () => {
  for (const suffix of ['', '.es']) {
    const svg = fs.readFileSync(path.join(sourceRoot, 'assets', `learning-route${suffix}.svg`), 'utf8');
    assert.match(svg, /\.traveler\{opacity:0\}/);
    assert.match(svg, /@media \(prefers-reduced-motion: no-preference\)\{\.traveler\{animation:travel 3\.6s ease-in-out 1\}\}/);
    assert.match(svg, /class="traveler"[^>]+aria-hidden="true"/);
    assert.equal((svg.match(/>0[1-5]<\/tspan>/g) ?? []).length, 5);
  }
});

test('both README editions use every diagram in the correct language', () => {
  for (const suffix of ['', '.es']) {
    const readme = fs.readFileSync(path.join(sourceRoot, `README${suffix}.md`), 'utf8');
    for (const [name] of diagrams) assert.ok(readme.includes(`assets/${name}${suffix}.svg`), `${name} is missing from README${suffix}.md`);
    const images = [...readme.matchAll(/!\[([^\]]+)\]\(assets\/([^\)]+\.svg)\)/g)];
    assert.equal(images.length, 10);
    for (const [, alt, filename] of images) {
      assert.ok(alt.length > 30, 'Diagrams need descriptive alternative text');
      assert.equal(filename.includes('.es.svg'), suffix === '.es');
    }
  }
});
