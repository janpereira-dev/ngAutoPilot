import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const attackVariable = 'x=globalThis.__dependencyProbe=1';

export function compileTemplate(directory, variable) {
  // Even the vulnerable fixture only accepts this reviewed, side-effect-free canary or valid input.
  if (!['data', attackVariable].includes(variable)) throw new Error('Outside the synthetic probe inputs');
  const require = createRequire(path.resolve(directory, 'package.json'));
  const lodash = require('lodash');
  globalThis.__dependencyProbe = 0;
  try {
    const output = lodash.template('Hello fixture', { variable })();
    return { version: lodash.VERSION, executed: globalThis.__dependencyProbe === 1, rejected: false, output };
  } catch {
    return { version: lodash.VERSION, executed: globalThis.__dependencyProbe === 1, rejected: true };
  } finally { delete globalThis.__dependencyProbe; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(compileTemplate(process.argv[2], process.argv.includes('--attack') ? attackVariable : 'data')));
}
