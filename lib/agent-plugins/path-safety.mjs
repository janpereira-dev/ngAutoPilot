import fs from 'node:fs';
import path from 'node:path';

export function assertContained(rootPath, targetPath) {
  const root = fs.realpathSync(rootPath);
  const target = fs.realpathSync(targetPath);
  const relative = path.relative(root, target);

  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return target;
  }

  throw new Error(`path escapes root: ${targetPath}`);
}

export function copyContainedDirectory(sourceDir, targetDir) {
  assertContained(sourceDir, sourceDir);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);
    const stat = fs.lstatSync(source);

    if (stat.isSymbolicLink()) {
      throw new Error(`symbolic links are not supported: ${source}`);
    }
    if (stat.isDirectory()) {
      copyContainedDirectory(source, target);
      continue;
    }
    if (!stat.isFile()) {
      throw new Error(`unsupported skill resource: ${source}`);
    }

    assertContained(sourceDir, source);
    fs.copyFileSync(source, target);
  }
}

export function assertRelativeReference(targetDir, reference) {
  const resource = reference.split('#', 1)[0].split('?', 1)[0];
  if (!resource || resource.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(resource)) {
    return;
  }

  const target = path.resolve(targetDir, resource);
  const relative = path.relative(path.resolve(targetDir), target);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(target)) {
    throw new Error(`invalid relative skill reference: ${reference}`);
  }
}
