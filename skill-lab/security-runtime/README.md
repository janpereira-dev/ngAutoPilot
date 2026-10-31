# Angular security runtime lab

[Español](README.es.md) · [Skill Lab](../README.md)

This checkout-only integration fixture exercises the 25 review scenarios in the five canonical Angular security guides. It uses Angular 22.2.4 rendering on Node and hydrating in isolated Chromium, real HTTP/TLS session and proxy boundaries, and locked dependency reproductions. The template is a fixed source literal; the small build uses Angular's JIT compiler and esbuild rather than an Angular CLI workspace.

## Run

Use Node 24.15 or newer within major 24, npm, and OpenSSL. On Windows the harness uses OpenSSL from Git for Windows; on Linux it uses `openssl` on PATH. No certificates are installed in the operating system trust store.

```sh
cd skill-lab/security-runtime
npm ci --ignore-scripts
npx playwright install chromium
npm test
```

Linux browser setup may also need `npx playwright install --with-deps chromium`. After setup, `npm run security:runtime` from the repository root runs the same suite.

The test process generates its own short-lived certificate, loopback ports, browser contexts, and synthetic accounts. It intercepts non-lab browser destinations. Even deliberately unsafe server fetch controls can contact only receivers created by that test process. The dependency exploit only sets a reviewed in-process marker; it cannot run an arbitrary input payload or OS command.

## Scenarios and observations

| Guide | Subject IDs | Public interfaces exercised |
| --- | --- | --- |
| Token storage policy | C17, C04, C23, C09, C12 | Browser storage, cross-site form, invalid CSRF, refresh replay, cookies, origin allowlist, expiry/logout |
| XSS template safety | C02, C19, C06, C25, C14 | Actual DOM events and link clicks, raw DOM insertion, SSR and hydrated positive controls |
| DomSanitizer governance | C08, C21, C01, C16, C11 | Installed sanitizer, wrong contexts, exact resource URLs, producer/caller evidence |
| SSR security risk gate | C24, C03, C18, C07, C22 | Host/forwarding headers, real local receivers and redirects, edge proxy, concurrent/sequential/anonymous rendering |
| Dependency vulnerability triage | C13, C20, C05, C15, C10 | Runtime and build canaries, full/production-only npm audits, registry errors, installed and built versions |

The vulnerable controls establish that the sensor can detect the unsafe behavior, then the corrected variant must reject it while valid input still works. Six cases deliberately withhold a necessary evidence boundary; the tests establish the omission, and the agent must decide what that means. A green test suite means the scenario expectations were met, including detection of the vulnerable variants.

`observations/cases/` holds measured facts, not generated security decisions. `observations/run.json` records the fresh run ID, counts, timestamps, and normalized SHA-256 hashes of the application/tests and all five guides. `subject` is the snapshot under review; `correction` is separate regression evidence and cannot erase an unsafe subject observation.

Negative dependency manifests use `.fixture.json` names, following the lab's fixture convention. `prepare-cases.mjs` materializes them under ignored `.cache/projects/` and installs their locks without lifecycle scripts. Corrected runtime/build projects use lodash 4.18.1; deliberate negative controls use 4.17.20. Audits scan both scopes and never dismiss development dependencies. The [upstream template advisory](https://github.com/advisories/GHSA-35jh-r3h4-6jhm) describes the exercised option; [the current maintainer advisory](https://github.com/lodash/lodash/security/advisories/GHSA-r5fr-rjxr-66jc) also informs the corrected release choice. Skill Lab is excluded from the public npm artifact.

## Live agent check

Give a fresh independent agent [audit-task.md](audit-task.md), the five actual guide files, the source, and the ability to run the suite. Keep `oracle.json`, `verify-agent*`, and saved evaluation output outside its allowed reads. The agent must execute the tests itself, read their fresh receipt, and produce `observations/agent-response.json` with decisions, reasons, and evidence for all 25 subjects.

```sh
node --test verify-agent.test.mjs
npm run test:agent -- observations/agent-response.json observations/run.json
```

The grader compares the independent decisions to the guide-derived oracle, rejects incomplete/duplicate/misclassified subjects and mismatched guide/source hashes, and binds the response to the identified run. It does not invoke a model. The Security Runtime workflow reruns the 25 tests and regrades the saved live-audit output; it does not silently treat replayed JSON as a fresh model invocation.

Saved live-run evidence belongs under `evidence/<date>/`. This is a bounded audit of one agent on one synthetic Angular version and topology. A JSON receipt alone cannot establish model provenance or general reliability; retain the actual agent invocation and review its cited reasoning. Production identity providers, DNS/proxies, other Angular versions and other browsers require their own evidence.
