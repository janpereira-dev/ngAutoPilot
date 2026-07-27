export function parseSimpleYaml(source) {
  const root = {};
  const stack = [{ indent: -1, value: root }];
  const lines = source.split(/\r?\n/);

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) {
      continue;
    }

    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack.at(-1).indent) {
      stack.pop();
    }

    const parent = stack.at(-1).value;

    if (line.startsWith('- ')) {
      if (!Array.isArray(parent)) {
        throw new Error(`YAML list item has no list parent: ${line}`);
      }
      parent.push(parseScalar(line.slice(2).trim()));
      continue;
    }

    const match = line.match(/^([^:]+):(.*)$/);
    if (!match) {
      throw new Error(`Unsupported YAML line: ${line}`);
    }

    const key = match[1].trim();
    const rawValue = match[2].trim();

    if (rawValue) {
      parent[key] = parseScalar(rawValue);
      continue;
    }

    const nextNonEmpty = lines.slice(lines.indexOf(rawLine) + 1).find((candidate) => candidate.trim());
    const nextIsList = nextNonEmpty?.trimStart().startsWith('- ') ?? false;
    parent[key] = nextIsList ? [] : {};
    stack.push({ indent, value: parent[key] });
  }

  return root;
}

function parseScalar(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^['"]|['"]$/g, '');
}
