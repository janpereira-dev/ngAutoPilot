import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import yazl from 'yazl';

const zipDate = new Date('1980-01-01T00:00:00.000Z');

export async function createPluginArchives({ sourceRoot, outputRoot, version }) {
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });
  const archives = [];

  for (const name of fs.readdirSync(sourceRoot).sort()) {
    const pluginRoot = path.join(sourceRoot, name);
    if (!fs.statSync(pluginRoot).isDirectory()) continue;
    const archiveName = `${name}-${version}.zip`;
    const archivePath = path.join(outputRoot, archiveName);
    await createZip(pluginRoot, archivePath);
    archives.push({ name: archiveName, sha256: hashFile(archivePath), size: fs.statSync(archivePath).size });
  }

  fs.writeFileSync(path.join(outputRoot, 'SHA256SUMS'), `${archives.map(({ sha256, name }) => `${sha256}  ${name}`).join('\n')}\n`, 'utf8');
  return { archives };
}

function createZip(root, output) {
  return new Promise((resolve, reject) => {
    const zip = new yazl.ZipFile();
    const stream = fs.createWriteStream(output);
    stream.on('close', resolve);
    stream.on('error', reject);
    zip.outputStream.on('error', reject).pipe(stream);
    for (const file of listFiles(root)) {
      zip.addFile(file.absolute, file.relative, { mtime: zipDate, mode: 0o100644, compress: true });
    }
    zip.end();
  });
}

function listFiles(root, directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(root, absolute);
    if (!entry.isFile()) throw new Error(`unsupported archive entry: ${absolute}`);
    return [{ absolute, relative: path.relative(root, absolute).split(path.sep).join('/') }];
  }).sort((left, right) => left.relative.localeCompare(right.relative));
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}
