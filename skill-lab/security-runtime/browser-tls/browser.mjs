import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, X509Certificate } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { chromium } from '@playwright/test';

const bypass = /--(?:ignore-certificate-errors|ignore-ssl-errors|allow-insecure-localhost|test-root-certs)/;

export async function withBrowser(directory, ca, run) {
  const profile = fs.mkdtempSync(path.join(directory, 'profile-'));
  const options = { channel: 'chromium', headless: true, ignoreHTTPSErrors: false, args: ['--enable-automation'] };
  async function launch() {
    const context = await chromium.launchPersistentContext(profile, options);
    try {
      const page = context.pages()[0];
      const session = await context.newCDPSession(page);
      const version = await session.send('Browser.getVersion');
      assert.equal(version.product, 'Chrome/156.0.8078.4', 'Review profile certificate storage when upgrading Chromium');
      const { arguments: args } = await session.send('Browser.getBrowserCommandLine');
      assert.deepEqual(args.filter((arg) => bypass.test(arg)), [], 'Certificate error bypass is forbidden');
      assert.ok(args.includes(`--user-data-dir=${profile}`), 'The browser must use its owned private profile');
      return { context, version };
    } catch (error) { await context.close(); throw error; }
  }
  const initial = await launch();
  const database = path.join(profile, 'Default', 'ServerCertificate');
  try {
    await initial.context.pages()[0].goto('chrome://certificate-manager/localcerts/usercerts');
  } finally { await initial.context.close(); }
  // Chromium owns and initializes this schema. Only its stopped, newly created profile is edited.
  const db = new DatabaseSync(database);
  let trustedFingerprint = null;
  try {
    assert.equal(db.prepare('SELECT value FROM meta WHERE key=?').get('version').value, '1');
    assert.deepEqual(db.prepare('PRAGMA table_info(certificates)').all().map((row) => row.name),
      ['sha256hash_hex', 'der_cert', 'trust_settings']);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM certificates').get().count, 0);
    if (ca) {
      const root = new X509Certificate(ca);
      assert.equal(root.ca, true, 'Import a CA anchor, never a leaf certificate');
      assert.equal(root.subjectAltName, undefined);
      trustedFingerprint = createHash('sha256').update(root.raw).digest('hex');
      // CertificateMetadata.trust.trust_type=TRUSTED (3), Chromium's profile protobuf schema.
      const trust = Buffer.from([0x0a, 0x02, 0x08, 0x03]);
      db.prepare('INSERT INTO certificates(sha256hash_hex,der_cert,trust_settings) VALUES(?,?,?)')
        .run(trustedFingerprint, root.raw, trust);
    }
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM certificates').get().count, ca ? 1 : 0);
  } finally { db.close(); }
  const { context, version } = await launch();
  try {
    return await run(context, { browser: version.product, revision: version.revision,
      ignoreHTTPSErrors: false, certificateErrorBypassFlags: [], trustedFingerprint,
      trustStore: 'Fresh Chromium profile ServerCertificate schema 1', systemTrustStoreModified: false });
  } finally { await context.close(); }
}
