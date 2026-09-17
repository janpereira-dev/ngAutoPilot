import fs from 'node:fs';
import path from 'node:path';

export function resolveProjectRoot(cwd) {
  const initial = path.resolve(cwd);
  let current = initial;

  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return initial;
    }
    current = parent;
  }
}
