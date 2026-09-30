// Local working-tree artifacts must not become distributable resources.
export function isLocalOnlySourcePath(relative) {
  const parts = relative.replaceAll('\\', '/').split('/');
  const name = parts.at(-1);
  return name === '.env' || (name.startsWith('.env.') && name !== '.env.example') || name === '.npmrc'
    || /\.(?:private\.json|local\.ya?ml|log|pyc)$/.test(name)
    || parts.some(part => ['node_modules', '.venv', '__pycache__', '.cache', 'raw-prompts', 'raw-responses'].includes(part))
    || (parts[0] === 'skill-lab' && (name === 'evidence.jsonl' || parts[1] === 'runs'));
}
