/** Parses data-only JavaScript literals without evaluating downloaded text. */
export function parseDataLiteral(source) {
  const parser = new DataLiteralParser(source);
  const value = parser.parseValue();
  parser.skipWhitespace();
  if (!parser.atEnd()) parser.fail('Unexpected trailing input');
  return value;
}

class DataLiteralParser {
  constructor(source) { this.source = source; this.index = 0; }
  atEnd() { return this.index >= this.source.length; }
  fail(message) { throw new Error(`${message} at offset ${this.index}`); }
  skipWhitespace() { while (!this.atEnd() && /\s/.test(this.source[this.index])) this.index += 1; }
  parseValue() {
    this.skipWhitespace();
    const character = this.source[this.index];
    if (character === '[') return this.parseArray();
    if (character === '{') return this.parseObject();
    if (character === '"' || character === "'") return this.parseString();
    if (character === '-' || /\d/.test(character ?? '')) return this.parseNumber();
    return this.parseKeyword();
  }
  parseArray() {
    this.index += 1;
    const values = [];
    this.skipWhitespace();
    if (this.source[this.index] === ']') { this.index += 1; return values; }
    while (true) {
      values.push(this.parseValue());
      this.skipWhitespace();
      const separator = this.source[this.index];
      if (separator === ']') { this.index += 1; return values; }
      if (separator !== ',') this.fail('Expected comma or closing bracket');
      this.index += 1; this.skipWhitespace();
      if (this.source[this.index] === ']') this.fail('Trailing commas are not allowed');
    }
  }
  parseObject() {
    this.index += 1;
    const object = Object.create(null);
    this.skipWhitespace();
    if (this.source[this.index] === '}') { this.index += 1; return object; }
    while (true) {
      const key = this.parseObjectKey();
      this.skipWhitespace();
      if (this.source[this.index] !== ':') this.fail('Expected colon after object key');
      this.index += 1;
      object[key] = this.parseValue();
      this.skipWhitespace();
      const separator = this.source[this.index];
      if (separator === '}') { this.index += 1; return object; }
      if (separator !== ',') this.fail('Expected comma or closing brace');
      this.index += 1; this.skipWhitespace();
      if (this.source[this.index] === '}') this.fail('Trailing commas are not allowed');
    }
  }
  parseObjectKey() {
    const character = this.source[this.index];
    if (character === '"' || character === "'") return this.parseString();
    const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(this.source.slice(this.index));
    if (!match) this.fail('Expected a data property name');
    this.index += match[0].length;
    return match[0];
  }
  parseString() {
    const quote = this.source[this.index];
    this.index += 1;
    let value = '';
    while (!this.atEnd()) {
      const character = this.source[this.index];
      this.index += 1;
      if (character === quote) return value;
      if (character === '\\') value += this.parseEscape();
      else { if (character === '\n' || character === '\r') this.fail('Unescaped line break in string'); value += character; }
    }
    this.fail('Unterminated string');
  }
  parseEscape() {
    if (this.atEnd()) this.fail('Unterminated escape');
    const character = this.source[this.index]; this.index += 1;
    const simple = { b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v', '0': '\0' };
    if (character in simple) return simple[character];
    if (character === '\n') return '';
    if (character === '\r') { if (this.source[this.index] === '\n') this.index += 1; return ''; }
    if (character === 'x') return String.fromCharCode(this.parseHex(2));
    if (character === 'u') {
      if (this.source[this.index] === '{') {
        this.index += 1; const closing = this.source.indexOf('}', this.index);
        if (closing < 0) this.fail('Unterminated Unicode code point');
        const raw = this.source.slice(this.index, closing);
        if (!/^[0-9A-Fa-f]{1,6}$/.test(raw)) this.fail('Invalid Unicode code point');
        this.index = closing + 1; return String.fromCodePoint(Number.parseInt(raw, 16));
      }
      return String.fromCharCode(this.parseHex(4));
    }
    return character;
  }
  parseHex(length) {
    const raw = this.source.slice(this.index, this.index + length);
    if (!new RegExp(`^[0-9A-Fa-f]{${length}}$`).test(raw)) this.fail('Invalid hexadecimal escape');
    this.index += length; return Number.parseInt(raw, 16);
  }
  parseNumber() {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(this.source.slice(this.index));
    if (!match) this.fail('Invalid number');
    this.index += match[0].length; return Number(match[0]);
  }
  parseKeyword() {
    for (const [keyword, value] of [['true', true], ['false', false], ['null', null]]) {
      if (this.source.startsWith(keyword, this.index)) { this.index += keyword.length; return value; }
    }
    this.fail('Only data literals are allowed');
  }
}
