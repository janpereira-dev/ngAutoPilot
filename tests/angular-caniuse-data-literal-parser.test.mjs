import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { escapeCsvCell } from '../docs/angular-caniuse/csv-safety.mjs';
import { parseDataLiteral } from '../docs/angular-caniuse/data-literal-parser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function extract(source, startNeedle, endNeedle, prefixLength) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  return source.slice(start + prefixLength, end + 1);
}

test('parses data literals without executing expressions', () => {
  const parsed = parseDataLiteral('[{id:"safe",value:-1.5e2,enabled:true,nested:{text:"line\\nnext"}}]');
  assert.deepEqual(
    JSON.parse(JSON.stringify(parsed)),
    [{ id: 'safe', value: -150, enabled: true, nested: { text: 'line\nnext' } }],
  );
  assert.throws(() => parseDataLiteral('[process.exit()]'), /Only data literals|Expected comma/);
  assert.throws(() => parseDataLiteral('[{value:()=>1}]'), /Only data literals/);
});

test('neutralizes spreadsheet formulas after leading control characters', () => {
  assert.equal(escapeCsvCell('@angular/core'), "'@angular/core");
  assert.equal(escapeCsvCell('\t=HYPERLINK("https://example.test")'), "\"'\t=HYPERLINK(\"\"https://example.test\"\")\"");
  assert.equal(escapeCsvCell('\n+1'), "\"'\n+1\"");
  assert.equal(escapeCsvCell('ordinary text'), 'ordinary text');
});

test('parses the committed Angular Can I Use data sections', () => {
  const source = fs.readFileSync(path.join(root, 'docs/angular-caniuse/chunks/caniuse-data-chunk.js'), 'utf8');
  const features = parseDataLiteral(extract(source, 'let a=[{id:"standalone-api"', '];s.s(["LinkType"', 'let a='.length));
  const rules = parseDataLiteral(extract(source, 'let v=[{name:"contextual-lifecycle"', '];s.s(["getFilteredEslintCaniuseList"', 'let v='.length));
  assert.ok(features.length > 0);
  assert.ok(rules.length > 0);
});
