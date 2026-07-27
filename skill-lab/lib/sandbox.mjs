import path from 'node:path';

export function resolveInsideLab(labRoot, relativePath) {
  return assertInsideLab(labRoot, path.resolve(labRoot, relativePath));
}

export function assertInsideLab(labRoot, targetPath) {
  const root = path.resolve(labRoot);
  const target = path.resolve(targetPath);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${target} is outside skill-lab`);
  }

  return target;
}
