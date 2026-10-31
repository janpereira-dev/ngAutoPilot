import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { X509Certificate } from 'node:crypto';

export function certificates(directory) {
  const executable = process.platform === 'win32' ? 'C:/Program Files/Git/usr/bin/openssl.exe' : 'openssl';
  function openssl(args) {
    const result = spawnSync(executable, args, { cwd: directory, encoding: 'utf8',
      env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
    if (result.status !== 0) throw new Error(`Certificate fixture failed: ${result.stderr}`);
  }
  const read = (name) => fs.readFileSync(path.join(directory, name));
  for (const name of ['lab', 'foreign']) {
    openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '3',
      '-subj', `/CN=NgAutoPilot ${name} browser root`, '-keyout', `${name}-ca-key.pem`, '-out', `${name}-ca.pem`,
      '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign']);
    fs.writeFileSync(path.join(directory, `${name}-index`), '');
    fs.writeFileSync(path.join(directory, `${name}-serial`), '1000\n');
    fs.mkdirSync(path.join(directory, `${name}-issued`));
    fs.writeFileSync(path.join(directory, `${name}.cnf`), `[ca]\ndefault_ca=issuer\n[issuer]\n` +
      `database=${name}-index\nserial=${name}-serial\nnew_certs_dir=${name}-issued\n` +
      `certificate=${name}-ca.pem\nprivate_key=${name}-ca-key.pem\ndefault_md=sha256\n` +
      'policy=subject\nunique_subject=no\n[subject]\ncommonName=supplied\n');
  }
  const now = Date.now();
  const day = 86_400_000;
  const date = (time) => new Date(time).toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '') + 'Z';
  const leaves = {};
  for (const [name, issuer, san, from, to] of [
    ['valid', 'lab', 'DNS:localhost,IP:127.0.0.1', now - 3_600_000, now + day],
    ['wrong-host', 'lab', 'DNS:wrong.example.test', now - 3_600_000, now + day],
    ['expired', 'lab', 'DNS:localhost,IP:127.0.0.1', now - 2 * day, now - day],
    ['future', 'lab', 'DNS:localhost,IP:127.0.0.1', now + day, now + 2 * day],
    ['foreign', 'foreign', 'DNS:localhost,IP:127.0.0.1', now - 3_600_000, now + day],
  ]) {
    openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=localhost',
      '-keyout', `${name}-key.pem`, '-out', `${name}.csr`]);
    fs.writeFileSync(path.join(directory, `${name}.ext`), '[leaf]\nbasicConstraints=critical,CA:FALSE\n' +
      'keyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n' +
      `subjectAltName=${san}\n`);
    openssl(['ca', '-batch', '-notext', '-config', `${issuer}.cnf`, '-in', `${name}.csr`,
      '-out', `${name}.pem`, '-extensions', 'leaf', '-extfile', `${name}.ext`,
      '-startdate', date(from), '-enddate', date(to)]);
    const cert = read(`${name}.pem`);
    const parsed = new X509Certificate(cert);
    leaves[name] = { cert, key: read(`${name}-key.pem`), details: {
      fingerprint256: parsed.fingerprint256, issuer: parsed.issuer,
      subjectAltName: parsed.subjectAltName, validFrom: parsed.validFrom, validTo: parsed.validTo,
    } };
  }
  return { ca: read('lab-ca.pem'), leaves };
}
