import { execFileSync } from 'node:child_process';

const paths = process.argv.slice(2);
if (!paths.length) throw new Error('Pass the generated paths to check.');

// Regeneration can restore omitted files as untracked, which git diff ignores.
const changes = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all', '--', ...paths], {
  encoding: 'utf8',
});
if (changes) {
  console.error(`Generated output differs from the committed files:\n${changes}`);
  process.exitCode = 1;
}
