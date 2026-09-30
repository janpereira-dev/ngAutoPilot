// Local working-tree artifacts must not become distributable resources.
const LOCAL_ONLY_NAMES = new Set([
  '.git', '.hg', '.svn', '.bzr', '.jj', '.sl', '.pijul', '_darcs', 'cvs', 'sccs', 'rcs', 'bitkeeper',
  '.fslckout', '_fossil_', '.fossil', '.atl', '.codegraph', 'dist', 'node_modules',
  '.venv', '__pycache__', '.cache', 'raw-prompts', 'raw-responses',
]);
export function isLocalOnlySourcePath(relative) {
  const parts = relative.replaceAll('\\', '/').split('/');
  const name = parts.at(-1);
  return name === '.env' || (name.startsWith('.env.') && name !== '.env.example') || name === '.npmrc'
    || /\.(?:private\.json|local\.ya?ml|log|pyc)$/.test(name)
    || parts.some(part => LOCAL_ONLY_NAMES.has(part.toLowerCase()))
    || (parts[0] === 'skill-lab' && (name === 'evidence.jsonl' || parts[1] === 'runs'));
}
