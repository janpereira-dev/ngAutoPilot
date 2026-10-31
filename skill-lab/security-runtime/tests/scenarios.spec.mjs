import { test, expect } from '@playwright/test';
import https from 'node:https';
import { npmAt } from '../dependencies.mjs';
import { attackVariable } from '../dependency-probe.mjs';
import {
  usingLab, login, pageFor, record, storageKeys,
  tokenGuide, xssGuide, domGuide, ssrGuide, dependencyGuide,
} from './helpers.mjs';

test('T1 persistent bearer: detects the vulnerable control and verifies the storage fix', async ({ browser }) => {
  const results = [];
  for (const fault of ['persistent-token', '']) {
    results.push(await usingLab(browser, { fault }, async (lab) => {
      const page = await pageFor(lab);
      await page.getByRole('button', { name: 'Login', exact: true }).click();
      await expect(page.getByRole('status')).toHaveText('logged in');
      const storage = await storageKeys(page);
      expect(storage.local).toEqual(fault ? ['session-secret'] : []);
      expect(storage.session).toEqual([]);
      expect(storage.databases).toEqual([]);
      const stored = await page.evaluate(() => localStorage.getItem('session-secret'));
      const outsider = await browser.newContext({ ignoreHTTPSErrors: true });
      let replayStatus = null;
      try {
        expect((await outsider.request.get(`${lab.origin}/api/state`)).status()).toBe(401);
        expect((await outsider.request.get(`${lab.origin}/api/state`, { headers: { Authorization: 'Bearer lab-access-invalid' } })).status()).toBe(401);
        if (stored !== null) {
          replayStatus = (await outsider.request.get(`${lab.origin}/api/state`, { headers: { Authorization: `Bearer ${stored}` } })).status();
          expect(replayStatus).toBe(200);
        }
      } finally { await outsider.close(); }
      return { loginStatus: 200, browserHydrated: true, storage, anonymousStatus: 401, invalidBearerStatus: 401,
        storedBearerReplayStatus: replayStatus, reusableCredentialInStorage: replayStatus === 200 };
    }));
  }
  record('C17', tokenGuide, results[0], results[1]);
});

test('T2 cookie CSRF: actual cross-site form and invalid-token requests cannot mutate state', async ({ browser }) => {
  const results = [];
  for (const fault of ['csrf', '']) results.push(await usingLab(browser, { fault }, async (lab) => {
    const account = await login(lab);
    const page = await lab.context.newPage();
    await page.goto(`${lab.foreign.replace('127.0.0.1', 'localhost')}/form`);
    const response = page.waitForResponse((result) => result.url() === `${lab.origin}/api/mutate`);
    await page.getByRole('button', { name: 'Cross-site mutation' }).click();
    const crossSiteStatus = (await response).status();
    expect(crossSiteStatus).toBe(fault ? 200 : 403);
    const invalid = await lab.context.request.post(`${lab.origin}/api/mutate`, {
      headers: { Origin: lab.origin, 'X-XSRF-TOKEN': 'invalid' }, data: {},
    });
    expect(invalid.status()).toBe(fault ? 200 : 403);
    const state = await (await lab.context.request.get(`${lab.origin}/api/state`)).json();
    expect(state.mutations).toBe(fault ? 2 : 0);
    expect(account.csrf).toBeTruthy();
    return { crossSiteStatus, invalidCsrfStatus: invalid.status(), mutations: state.mutations };
  }));
  record('C04', tokenGuide, results[0], results[1]);
});

test('T3 refresh replay: spent tokens cannot rotate and their session is revoked', async ({ browser }) => {
  const results = [];
  for (const fault of ['refresh-replay', '']) results.push(await usingLab(browser, { fault }, async (lab) => {
    const account = await login(lab);
    const old = (await lab.context.cookies()).find((cookie) => cookie.name === 'refresh').value;
    const session = (await lab.context.cookies()).find((cookie) => cookie.name === 'session').value;
    const headers = { Origin: lab.origin, 'X-XSRF-TOKEN': account.csrf };
    expect((await lab.context.request.post(`${lab.origin}/auth/rotate`, { headers })).status()).toBe(200);
    const replay = await lab.context.request.post(`${lab.origin}/auth/rotate`, {
      headers: { ...headers, Cookie: `session=${session}; refresh=${old}` },
    });
    expect(replay.status()).toBe(fault ? 200 : 401);
    const sessionStatus = (await lab.context.request.get(`${lab.origin}/api/state`)).status();
    expect(sessionStatus).toBe(fault ? 200 : 401);
    return { rotationStatus: 200, replayStatus: replay.status(), sessionStatusAfterReplay: sessionStatus };
  }));
  record('C23', tokenGuide, results[0], results[1]);
});

test('T4 missing auth backend: a rendered Angular page cannot establish lifecycle enforcement', async ({ browser }) => {
  await usingLab(browser, { authAvailable: false }, async (lab) => {
    await pageFor(lab);
    const response = await lab.context.request.post(`${lab.origin}/auth/login`, { headers: { Origin: lab.origin }, data: { user: 'alice' } });
    expect(response.status()).toBe(503);
    record('C09', tokenGuide, { browserHydrated: true, authStatus: response.status(), lifecycleEvidence: null, csrfEvidence: null });
  });
});

test('T5 bounded session: storage, cookie flags, CSRF, origins, expiry and logout work together', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const page = await pageFor(lab);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('logged in');
    const storage = await storageKeys(page);
    expect(storage).toEqual({ local: [], session: [], databases: [] });
    const cookie = (await lab.context.cookies()).find((item) => item.name === 'session');
    expect({ httpOnly: cookie.httpOnly, secure: cookie.secure, sameSite: cookie.sameSite }).toEqual({ httpOnly: true, secure: true, sameSite: 'Lax' });
    await page.getByRole('button', { name: 'Change state' }).click();
    await expect(page.getByRole('status')).toHaveText('mutated');
    await page.getByRole('button', { name: 'Allowed request' }).click();
    await expect(page.getByRole('status')).toHaveText('{"hasAuthorization":true}');
    await page.getByRole('button', { name: 'Foreign request' }).click();
    await expect(page.getByRole('status')).toHaveText('{"hasAuthorization":false,"marker":"owned-receiver"}');
    const invalid = await lab.context.request.post(`${lab.origin}/api/mutate`, { headers: { Origin: lab.origin }, data: {} });
    expect(invalid.status()).toBe(403);
    lab.advanceClock(61_000);
    const expired = await lab.context.request.get(`${lab.origin}/api/state`);
    expect(expired.status()).toBe(401);
    const account = await login(lab);
    const logout = await lab.context.request.post(`${lab.origin}/auth/logout`, { headers: { Origin: lab.origin, 'X-XSRF-TOKEN': account.csrf } });
    expect(logout.status()).toBe(200);
    const revoked = await lab.context.request.get(`${lab.origin}/api/state`, { headers: { Authorization: `Bearer ${account.access}` } });
    expect(revoked.status()).toBe(401);
    record('C12', tokenGuide, {
      browserHydrated: true, storage, cookie: { httpOnly: true, secure: true, sameSite: 'Lax' },
      validMutationStatus: 200, missingCsrfStatus: invalid.status(), allowedOriginHasAuthorization: true,
      foreignOriginHasAuthorization: false, serverExpiryStatus: expired.status(), logoutStatus: logout.status(),
      revokedAccessStatus: revoked.status(), rotationAndReplayEvidence: 'C23.correction',
      credentialInventory: { session: 'HttpOnly cookie, server-validated, 60 seconds', refresh: 'HttpOnly cookie, rotation and family revocation on replay', access: 'memory only, 60 seconds, immediate server revocation', csrf: 'readable cookie, checked server-side with Origin' },
    });
  });
});

const payload = '<img src="/missing-image" onerror="window.__xssProbe=1"><b>Allowed formatting</b>';

async function htmlProbe(browser, fault, extra = '') {
  return usingLab(browser, { fault }, async (lab) => {
    const page = await pageFor(lab, `?html=${encodeURIComponent(payload)}${extra}`);
    await page.waitForLoadState('networkidle');
    return {
      browserHydrated: true, marker: await page.evaluate(() => window.__xssProbe ?? 0),
      eventAttributes: await page.locator('[data-html] [onerror], [data-raw] [onerror]').count(),
      renderedText: await page.locator('[data-text]').textContent(),
      formattingCount: await page.locator('[data-html] b').count(),
      status: await page.getByRole('status').textContent(),
      inputSource: 'request query -> Angular component binding',
    };
  });
}

test('X1 event handlers: browser execution exposes the trusted-HTML defect', async ({ browser }) => {
  const before = await htmlProbe(browser, 'html-bypass');
  expect(before.marker).toBe(1); expect(before.eventAttributes).toBeGreaterThan(0);
  const after = await htmlProbe(browser, '');
  expect(after.marker).toBe(0); expect(after.eventAttributes).toBe(0);
  expect(after.renderedText).toBe(payload); expect(after.formattingCount).toBe(1);
  record('C02', xssGuide, before, after);
});

test('X2 script URLs: clicking a malicious binding cannot execute a script', async ({ browser }) => {
  const results = [];
  for (const fault of ['script-url', '']) results.push(await usingLab(browser, { fault }, async (lab) => {
    const page = await pageFor(lab, `?link=${encodeURIComponent('javascript:window.__xssProbe=1')}`);
    const href = await page.locator('[data-link]').getAttribute('href');
    await page.locator('[data-link]').click();
    await page.waitForLoadState('networkidle');
    const marker = await page.evaluate(() => window.__xssProbe ?? 0);
    expect(marker).toBe(fault ? 1 : 0);
    if (!fault) expect(href).toMatch(/^unsafe:/);
    return { browserHydrated: true, href, marker, clicked: true };
  }));
  record('C19', xssGuide, results[0], results[1]);
});

test('X3 raw DOM: an unsanitized sink is detected after hydration', async ({ browser }) => {
  const before = await htmlProbe(browser, 'raw-dom');
  expect(before.marker).toBe(1);
  const after = await htmlProbe(browser, '');
  expect(after.marker).toBe(0); expect(after.eventAttributes).toBe(0);
  record('C06', xssGuide, { ...before, sink: 'ElementRef innerHTML receives the query string after render' }, after);
});

test('X4 missing browser run: successful SSR HTML is insufficient execution evidence', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const response = await lab.context.request.get(`${lab.origin}/?html=${encodeURIComponent(payload)}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('ng-version="22.2.4"');
    record('C25', xssGuide, { serverStatus: response.status(), browserExecution: 'not run for this subject', domAndNavigationEvidence: null });
  });
});

test('X5 bound templates: SSR, hydration, text, formatting and allowed navigation stay safe', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const query = `?html=${encodeURIComponent(payload)}`;
    const initial = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors: true });
    try {
      const page = await initial.newPage();
      await page.route('https://media.example.test/**', (route) => route.fulfill({ body: '<p>Synthetic lesson</p>' }));
      await page.goto(`${lab.origin}/${query}`);
      expect(await page.locator('[data-html] [onerror], [data-raw] [onerror]').count()).toBe(0);
      await expect(page.locator('[data-html] b')).toHaveText('Allowed formatting');
    } finally { await initial.close(); }
    const page = await pageFor(lab, query);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => window.__xssProbe ?? 0)).toBe(0);
    expect(await page.locator('[data-html] [onerror], [data-raw] [onerror]').count()).toBe(0);
    await expect(page.locator('[data-text]')).toHaveText(payload);
    await expect(page.locator('[data-html] b')).toHaveText('Allowed formatting');
    await page.locator('[data-link]').click();
    await expect(page).toHaveURL('https://content.example.test/lesson');
    record('C14', xssGuide, {
      ssrAndHydrationTested: true, marker: 0, executableAttributes: 0, textEscaped: true,
      intendedFormattingWorks: true, allowedHttpsNavigationWorks: true,
      scriptUrlControl: 'C19.correction', rawDomControl: 'C06.correction',
      sourceInventory: 'Three query-string inputs; only fixed literal template; normal HTML/URL bindings; no user template compilation; resource trust reviewed separately',
    });
  });
});

test('D1 bypass provenance: sanitize does not undo a trust assertion', async ({ browser }) => {
  const before = await htmlProbe(browser, 'html-bypass');
  expect(before.marker).toBe(1);
  const after = await htmlProbe(browser, '');
  expect(after.marker).toBe(0); expect(after.eventAttributes).toBe(0);
  record('C08', domGuide, { ...before, trustFlow: 'query input -> bypassSecurityTrustHtml -> sanitize -> trusted HTML binding' }, after);
});

test('D2 resource allowlist: suffix, userinfo, schemes and encoded alternatives are rejected', async ({ browser }) => {
  const bad = [
    'https://media.example.test.attacker.test/embed/lesson-1',
    'https://media.example.test@attacker.test/embed/lesson-1',
    'http://media.example.test/embed/lesson-1',
    'https://media.example.test:444/embed/lesson-1',
    'https://media.example.test/embed/%6cesson-1',
    'https://media.example.test/embed/lesson-1?unexpected=1',
    'https://media.example.test/embed/lesson-1#unexpected',
  ];
  const before = await usingLab(browser, { fault: 'host-prefix' }, async (lab) => {
    const page = await pageFor(lab, `?resource=${encodeURIComponent(bad[0])}`);
    const src = await page.locator('iframe').getAttribute('src');
    expect(src).toBe(bad[0]);
    return { browserHydrated: true, resourceInput: bad[0], trustedIframeSrc: src };
  });
  await usingLab(browser, {}, async (lab) => {
    for (const resource of bad) {
      const page = await pageFor(lab, `?resource=${encodeURIComponent(resource)}`);
      expect(await page.locator('iframe').count()).toBe(0); await page.close();
    }
  });
  record('C21', domGuide, before, { invalidResourcesTested: bad, iframeCountForEach: 0 });
});

test('D3 wrong context: rejection cannot fall back to a trust bypass', async ({ browser }) => {
  const before = await htmlProbe(browser, 'context-fallback', '&context=URL');
  expect(before.marker).toBe(1);
  const after = await htmlProbe(browser, '', '&context=URL');
  expect(after.marker).toBe(0); expect(after.eventAttributes).toBe(0); expect(after.status).toBe('context rejected');
  record('C01', domGuide, { ...before, requestedContext: 'URL', providedValueContext: 'HTML', fallback: 'trusted HTML' }, after);
});

test('D4 unknown provenance: one working consumer does not inventory every caller', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const page = await pageFor(lab);
    expect(await page.locator('iframe').count()).toBe(1);
    record('C16', domGuide, {
      browserHydrated: true, approvedViewWorks: true, producerRecord: null, sharedWrapperCallerInventory: null,
      scope: 'The subject evidence covers one consumer; the producer and other callers are unavailable',
    });
  });
});

test('D5 fixed resource: approved content works and bad values cannot reach trust', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const page = await pageFor(lab);
    await expect(page.locator('iframe')).toHaveAttribute('src', 'https://media.example.test/embed/lesson-1');
    await expect(page.frameLocator('iframe').locator('p')).toHaveText('Synthetic content only');
    await page.goto(`${lab.origin}/?resource=not-a-url&html=`);
    await expect(page.locator('[data-ready]')).toHaveText('true');
    expect(await page.locator('iframe').count()).toBe(0);
    expect(await page.locator('[data-html]').innerHTML()).toBe('');
    record('C11', domGuide, {
      browserHydrated: true, approvedResourceWorks: true, invalidAndEmptyValuesRejected: true,
      invalidUrlEvidence: 'C21.correction', contextEvidence: 'C01.correction', htmlEvidence: 'C08.correction',
      bypassInventory: [{ caller: 'App resource binding', producer: 'request resource parameter',
        rule: 'Parsed exact HTTPS host, empty userinfo/port/query/fragment, exact canonical path lesson-1',
        context: 'ResourceUrl', owner: 'synthetic fixture maintainers', reviewExpiry: '2027-01-31' }],
      otherBypasses: 'Negative controls only; no request can enable a negative profile',
    });
  });
});

const forwardingHeaders = {
  Forwarded: 'for=127.0.0.2;host=attacker.test;proto=http',
  'X-Forwarded-Host': 'attacker.test, other.test', 'X-Forwarded-Proto': 'http',
  'X-Forwarded-Prefix': '//attacker.test', 'X-Forwarded-Port': 'not-a-port',
};

test('S1 spoofed forwarding: direct ingress rejects it and the edge strips it', async ({ browser }) => {
  const before = await usingLab(browser, { fault: 'forwarded-origin' }, async (lab) => {
    const response = await lab.context.request.get(lab.origin, { headers: { 'X-Forwarded-Host': new URL(lab.backend).host } });
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(lab.backend);
    expect(lab.received.some((item) => item.path === '/probe')).toBe(true);
    return { status: response.status(), untrustedHeaderControlsRenderedOrigin: true, untrustedHeaderCausedOutboundRequest: true };
  });
  const after = await usingLab(browser, {}, async (lab) => {
    for (const [name, value] of Object.entries({ Host: 'attacker.test', ...forwardingHeaders })) {
      const direct = await lab.context.request.get(lab.origin, { headers: { [name]: value } });
      expect(direct.status()).toBe(400);
      const edge = await lab.context.request.get(lab.proxy, { headers: { [name]: value } });
      expect(edge.status()).toBe(name === 'Host' ? 400 : 200);
      if (name !== 'Host') expect(await edge.text()).not.toContain('attacker.test');
    }
    expect(lab.received).toEqual([]);
    return { directRejected: ['Host', ...Object.keys(forwardingHeaders)], edgeStripsForwarding: true, unexpectedOutboundRequests: 0 };
  });
  record('C24', ssrGuide, before, after);
});

test('S2 internal fetch: forbidden destinations and redirect hops never receive a request', async ({ browser }) => {
  const before = await usingLab(browser, { fault: 'internal-fetch' }, async (lab) => {
    const result = await lab.context.request.get(`${lab.origin}/api/fetch`, { params: { target: `${lab.foreign}/metadata` } });
    expect(result.status()).toBe(200);
    expect(lab.received.some((item) => item.path === '/metadata')).toBe(true);
    return { suppliedTarget: 'unapproved loopback test receiver', status: 200, receiverObservedRequest: true };
  });
  const after = await usingLab(browser, {}, async (lab) => {
    const targets = [`${lab.foreign}/metadata`, 'http://169.254.169.254/metadata',
      'http://10.0.0.1/private', 'http://[::1]/private', 'http://[fe80::1]/private'];
    for (const target of targets) {
      const response = await lab.context.request.get(`${lab.origin}/api/fetch`, { params: { target } });
      expect(response.status()).toBe(400);
    }
    expect(lab.received).toEqual([]);
    const redirect = await lab.context.request.get(`${lab.origin}/api/fetch`, { params: { target: `${lab.backend}/redirect` } });
    expect(redirect.status()).toBe(400);
    expect(lab.received.map((item) => item.path)).toEqual(['/redirect']);
    const allowed = await lab.context.request.get(`${lab.origin}/api/fetch`, { params: { target: `${lab.backend}/probe` } });
    expect(allowed.status()).toBe(200); expect((await allowed.json()).result).toContain('owned-receiver');
    return { forbiddenTargetsRejected: targets.length, redirectHopRejected: true, forbiddenReceiverRequests: 0, approvedBackendStatus: allowed.status() };
  });
  record('C03', ssrGuide, before, after);
});

async function isolationProbe(browser, fault = '') {
  return usingLab(browser, { fault }, async (lab) => {
    const other = await browser.newContext({ ignoreHTTPSErrors: true });
    const anonymous = await browser.newContext({ ignoreHTTPSErrors: true });
    try {
      await login(lab, 'alice'); await login({ ...lab, context: other }, 'bob');
      const aResponse = await lab.context.request.get(lab.origin);
      const a = await aResponse.text();
      const b = await (await other.request.get(lab.origin)).text();
      const anon = await (await anonymous.request.get(lab.origin)).text();
      const page = await other.newPage();
      await page.route('**/*', (route) => {
        const url = new URL(route.request().url());
        return url.origin === lab.origin ? route.continue() : route.fulfill({ body: '<p>Fixture</p>' });
      });
      await page.goto(lab.origin); await expect(page.locator('[data-ready]')).toHaveText('true');
      const hydratedUser = await page.locator('[data-user]').textContent();
      const leak = b.includes('ALICE_PRIVATE') || anon.includes('ALICE_PRIVATE') || hydratedUser !== 'BOB_PRIVATE';
      expect(leak).toBe(Boolean(fault));
      if (!fault) {
        expect(a).toContain('ALICE_PRIVATE'); expect(a).not.toContain('BOB_PRIVATE');
        expect(b).toContain('BOB_PRIVATE'); expect(anon).not.toContain('BOB_PRIVATE');
        for (const target of [lab.origin, lab.proxy]) {
          for (const order of [[lab.context, other, anonymous], [other, lab.context, anonymous]]) {
            const sequential = [];
            for (const context of order) sequential.push(await (await context.request.get(target)).text());
            const concurrent = await Promise.all(order.map(async (context) => (await context.request.get(target)).text()));
            for (const html of [sequential, concurrent]) html.forEach((text, index) => {
              const own = order[index] === lab.context ? 'ALICE_PRIVATE' : order[index] === other ? 'BOB_PRIVATE' : 'ANONYMOUS';
              expect(text).toContain(own);
              for (const canary of ['ALICE_PRIVATE', 'BOB_PRIVATE']) if (canary !== own) expect(text).not.toContain(canary);
              expect(text).not.toContain('lab-access-');
            });
          }
        }
      }
      expect(aResponse.headers()['cache-control']).toBe('private, no-store');
      return { crossUserOrAnonymousLeak: leak, hydratedUser, cacheControl: aResponse.headers()['cache-control'],
        sequentialOrdersTested: !fault, concurrentUsersAndAnonymousTested: !fault, edgeAndOriginTested: !fault,
        credentialSerializationObserved: a.includes('lab-access-') || b.includes('lab-access-'),
        transferState: 'Per-render user display data only; HTTP transfer cache disabled',
        sharedCache: fault ? 'Reuses first rendered HTML for every user' : 'No process-wide personalized response cache' };
    } finally { await other.close(); await anonymous.close(); }
  });
}

test('S3 cross-user cache: sequential and hydrated responses expose a shared rendering cache', async ({ browser }) => {
  record('C18', ssrGuide, await isolationProbe(browser, 'cross-user-cache'), await isolationProbe(browser));
});

test('S4 missing proxy evidence: origin-only SSR cannot certify the deployment edge', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const response = await lab.context.request.get(lab.origin);
    expect(response.status()).toBe(200);
    record('C07', ssrGuide, { originStatus: response.status(), deploymentTopology: null, proxyHeaderEvidence: null, deploymentCacheEvidence: null });
  });
});

test('S5 isolated rendering: the configured edge supports browser auth and isolates users', async ({ browser }) => {
  const isolation = await isolationProbe(browser);
  await usingLab(browser, {}, async (lab) => {
    const untrusted = await new Promise((resolve) => {
      https.get(lab.origin, (response) => { response.resume(); resolve('unexpectedly trusted'); })
        .on('error', (error) => resolve(error.code));
    });
    expect(untrusted).toBe('DEPTH_ZERO_SELF_SIGNED_CERT');
    const page = await lab.context.newPage();
    await page.goto(lab.proxy); await expect(page.locator('[data-ready]')).toHaveText('true');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('logged in');
    await page.reload(); await expect(page.locator('[data-user]')).toHaveText('ALICE_PRIVATE');
  });
  record('C22', ssrGuide, { ...isolation, edgeBrowserLoginWorks: true, peerWithoutOwnedCaRejected: true,
    forwardingEvidence: 'C24.correction', egressAndRedirectEvidence: 'C03.correction',
    topology: 'Two real loopback TLS servers: canonical origin and edge that strips forwarded headers, replaces Host, and accepts only its configured Host',
    egress: 'Only the owned backend origin and explicit paths are authorized, including redirect validation; no production/internal hosts contacted',
  });
});

test('P1 reachable dependency: Angular input reaches the affected server template API', async ({ browser }) => {
  const results = [];
  for (const fault of ['dependency-runtime', '']) results.push(await usingLab(browser, { fault }, async (lab) => {
    const page = await pageFor(lab, `?variable=${encodeURIComponent(attackVariable)}`);
    await page.getByRole('button', { name: 'Compile CMS content' }).click();
    await expect(page.getByRole('status')).toContainText('"version"');
    const result = JSON.parse(await page.getByRole('status').textContent());
    expect(result.version).toBe(fault ? '4.17.20' : '4.18.1');
    expect(result.executed).toBe(Boolean(fault)); expect(result.rejected).toBe(!fault);
    return { ...result, browserHydrated: true, flow: 'query input -> Angular HttpClient -> server lodash.template variable option',
      advisory: 'https://github.com/advisories/GHSA-35jh-r3h4-6jhm', trigger: 'Reviewed default-parameter marker only; no OS command, file access or exfiltration' };
  }));
  record('C13', dependencyGuide, results[0], results[1]);
});

test('P2 build-time dependency: a devDependency can execute the untrusted CMS marker', async () => {
  const results = [];
  for (const stage of ['before', 'after']) {
    const process = await npmAt(`.cache/projects/build-${stage}`, ['run', 'build', '--', '--attack']);
    expect(process.exitCode).toBe(0);
    const result = JSON.parse(process.stdout.trim().split('\n').at(-1));
    expect(result.executed).toBe(stage === 'before'); expect(result.rejected).toBe(stage === 'after');
    const valid = await npmAt(`.cache/projects/build-${stage}`, ['run', 'build']);
    expect(valid.exitCode).toBe(0);
    expect(JSON.parse(valid.stdout.trim().split('\n').at(-1)).output).toBe('Hello fixture');
    results.push({ ...result, command: `npm --prefix .cache/projects/build-${stage} run build -- --attack`,
      validContentWorks: true, dependencyKind: 'devDependency', inputSource: 'untrusted CMS variable name used in CI content generation',
      advisory: 'https://github.com/advisories/GHSA-35jh-r3h4-6jhm' });
  }
  record('C20', dependencyGuide, results[0], results[1]);
});

test('P3 audit unavailable: a real registry error must not become a zero-finding report', async ({ browser }) => {
  await usingLab(browser, {}, async (lab) => {
    const result = await npmAt('.cache/projects/runtime-before', ['audit', '--json', '--registry', `${lab.backend}/registry/`]);
    expect(result.exitCode).not.toBe(0); expect(result.terminated).toBe(false);
    const report = JSON.parse(result.stdout);
    expect(report.metadata).toBeUndefined(); expect(report.error).toBeTruthy();
    expect(lab.received.some((item) => item.path.startsWith('/registry/'))).toBe(true);
    record('C05', dependencyGuide, { command: 'npm audit --json (controlled unavailable registry)', exitCode: result.exitCode,
      error: report.error.code ?? report.error.summary, completeAuditMetadata: false, knownFindingCount: null });
  });
});

test('P4 unknown reachability: production-only audit cannot dismiss an affected development tool', async () => {
  const full = await npmAt('.cache/projects/build-before', ['audit', '--json', '--registry', 'https://registry.npmjs.org']);
  const production = await npmAt('.cache/projects/build-before', ['audit', '--omit=dev', '--json', '--registry', 'https://registry.npmjs.org']);
  const explain = await npmAt('.cache/projects/build-before', ['explain', 'lodash', '--json']);
  const fullReport = JSON.parse(full.stdout); const prodReport = JSON.parse(production.stdout);
  expect(full.exitCode).not.toBe(0); expect(fullReport.metadata.vulnerabilities.total).toBeGreaterThan(0);
  expect(production.exitCode).toBe(0); expect(prodReport.metadata.vulnerabilities.total).toBe(0);
  expect(explain.exitCode).toBe(0); expect(JSON.parse(explain.stdout)[0].version).toBe('4.17.20');
  record('C15', dependencyGuide, { installedVersion: '4.17.20', dependencyKind: 'devDependency',
    fullAuditExit: full.exitCode, fullAuditFindings: fullReport.metadata.vulnerabilities.total,
    productionAuditExit: production.exitCode, productionAuditFindings: prodReport.metadata.vulnerabilities.total,
    dependencyPathVerified: true, buildConfigurationEvidence: null, exploitPrerequisitesEvidence: null,
    advisory: 'https://github.com/advisories/GHSA-35jh-r3h4-6jhm',
  });
});

test('P5 remediation: installed runtime/build versions, exploit controls, valid content and audits agree', async ({ browser }) => {
  const audits = [];
  for (const directory of ['.', '.cache/projects/runtime-after', '.cache/projects/build-after']) {
    for (const flags of [[], ['--omit=dev']]) {
      const result = await npmAt(directory, ['audit', '--json', ...flags, '--registry', 'https://registry.npmjs.org']);
      const report = JSON.parse(result.stdout);
      expect(result.exitCode).toBe(0); expect(report.metadata.vulnerabilities.total).toBe(0);
      audits.push({ directory, scope: flags.length ? 'production' : 'all', exitCode: result.exitCode, knownFindings: report.metadata.vulnerabilities.total });
    }
  }
  const explain = await npmAt('.cache/projects/runtime-after', ['explain', 'lodash', '--json']);
  expect(explain.exitCode).toBe(0); expect(JSON.parse(explain.stdout)[0].version).toBe('4.18.1');
  await usingLab(browser, {}, async (lab) => {
    const page = await pageFor(lab);
    await page.getByRole('button', { name: 'Compile CMS content' }).click();
    await expect(page.getByRole('status')).toContainText('Hello fixture');
  });
  record('C10', dependencyGuide, { audits, runtimeAndBuildInstalledVersion: '4.18.1', dependencyPathsVerified: true,
    runtimeExploitEvidence: 'C13.correction', buildExploitEvidence: 'C20.correction', validRuntimeAndBuildContentWorks: true,
    shippedArtifacts: 'Angular browser bundle plus Node SSR server; runtime-after and build-after lockfiles installed independently',
    upstreamPatch: 'https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc',
    scope: 'The before projects are intentional negative controls, not part of the corrected application dependency set',
  });
});
