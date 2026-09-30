// Local working-tree artifacts must not become distributable resources.
export function isLocalOnlySourcePath(relative) {
  const parts = relative.replaceAll('\\', '/').split('/');
  const name = parts.at(-1);
  return name === '.env' || (name.startsWith('.env.') && name !== '.env.example') || name === '.npmrc'
    || /\.(?:private\.json|local\.ya?ml|log|pyc)$/.test(name)
    || parts.some(part => ['.git', '.hg', '.svn', '.bzr', '.jj', '.pijul', '_darcs', 'cvs', '.fslckout', '_fossil_', '.fossil', '.atl', '.codegraph', 'dist', 'node_modules', '.venv', '__pycache__', '.cache', 'raw-prompts', 'raw-responses'].includes(part.toLowerCase()))
    || (parts[0] === 'skill-lab' && (name === 'evidence.jsonl' || parts[1] === 'runs'));
}
