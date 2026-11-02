import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { X509Certificate } from 'node:crypto';
import { firefox, webkit } from '@playwright/test';

function command(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, `${executable} failed: ${result.stderr}`);
}

export async function withNativeBrowser(engine, directory, ca, run) {
  assert.equal(process.platform, 'linux', 'Run native trust tests on the disposable Ubuntu CI runner');
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted', 'Never alter trust on a personal or self-hosted machine');
  assert.ok(['firefox', 'webkit'].includes(engine));
  const profile = fs.mkdtempSync(path.join(directory, `${engine}-`));
  const caFile = path.join(profile, 'lab-ca.pem');
  const systemCA = `/usr/local/share/ca-certificates/ngautopilot-${path.basename(profile)}.crt`;
  assert.equal(fs.existsSync(systemCA), false);
  let installed = false;
  let context;
  try {
    if (ca) {
      const root = new X509Certificate(ca);
      assert.equal(root.ca, true, 'Trust a CA anchor, never a leaf exception');
      assert.equal(root.subjectAltName, undefined);
      fs.writeFileSync(caFile, ca);
    }
    if (engine === 'firefox') {
      command('certutil', ['-N', '-d', `sql:${profile}`, '--empty-password']);
      if (ca) command('certutil', ['-A', '-d', `sql:${profile}`, '-n', 'NgAutoPilot lab root', '-t', 'C,,', '-i', caFile]);
    } else if (ca) {
      // WebKitGTK uses system trust; this store belongs only to the disposable hosted runner.
      command('sudo', ['install', '-m', '644', caFile, systemCA]);
      installed = true;
      command('sudo', ['update-ca-certificates']);
    }
    const type = engine === 'firefox' ? firefox : webkit;
    context = await type.launchPersistentContext(profile, { headless: true, ignoreHTTPSErrors: false,
      ...(engine === 'firefox' ? { firefoxUserPrefs: { 'security.enterprise_roots.enabled': false } } : {}) });
    const version = context.browser().version();
    assert.equal(version, engine === 'firefox' ? '157.0' : '27.2', 'Review trust behavior on browser upgrade');
    const processes = fs.readdirSync('/proc').filter((id) => /^\d+$/.test(id)).flatMap((id) => {
      try { return [fs.readFileSync(`/proc/${id}/cmdline`, 'utf8').split('\0')]; } catch { return []; }
    });
    const args = processes.find((args) => args.some((arg) => arg === profile || arg === `--user-data-dir=${profile}`)
      && (args.includes('-juggler-pipe') || args.includes('--inspector-pipe')));
    assert.ok(args, 'Inspect the actual process using the owned profile');
    const bypass = args.filter((arg) => /ignore-certificate|ignore-ssl|allow-insecure|test-root-certs/.test(arg));
    assert.deepEqual(bypass, []);
    assert.equal(fs.existsSync(path.join(profile, 'cert_override.txt')), false, 'Leaf exceptions are forbidden');
    return await run(context, { browser: `${engine}/${version}`, ignoreHTTPSErrors: false,
      certificateErrorBypassFlags: bypass, trustedFingerprint: ca ? new X509Certificate(ca).fingerprint256 : null,
      trustStore: engine === 'firefox' ? 'Fresh profile NSS database' : 'Disposable GitHub-hosted Ubuntu trust store',
      personalSystemTrustStoreModified: false });
  } finally {
    try { await context?.close(); } finally {
      if (installed) {
        command('sudo', ['unlink', systemCA]);
        command('sudo', ['update-ca-certificates', '--fresh']);
        assert.equal(fs.existsSync(systemCA), false);
      }
    }
  }
}
