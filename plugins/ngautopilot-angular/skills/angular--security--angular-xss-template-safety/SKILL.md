---
id: angular.security.angular-xss-template-safety
name: Angular XSS Template Safety
description: Prevent XSS by keeping templates, bindings, and trusted HTML usage safe and explicit.
stack:
  - Angular
category: security
status: stable
version: 0.11.0
owner: NgAutoPilot
triggers:
  - xss safety
  - template safety
  - sanitization
---

# Angular XSS Template Safety

## Purpose

Trace untrusted data to its rendered context and prove it cannot become executable markup, a script URL, or a compiled Angular template. Test the actual rendering path, not just the input validator.

## When to Use

Use when rendering API/user/CMS content, rich text, links, third-party widgets, or SSR/hydrated markup. Record the installed Angular version and the affected components and rendering libraries before selecting version-specific controls.

## Do

### Checks and evidence

1. Search templates, TypeScript, pipes, and widgets for innerHTML, outerHTML, insertAdjacentHTML, document.write, URL/resource bindings, and bypassSecurityTrust calls. Trace each sink to its input source. Search results are an inventory, not proof that an indirect library sink is safe.
2. Prefer interpolation for text and normal Angular bindings for supported HTML/URL contexts. Angular sanitization depends on the context; resource URLs that load code need an explicit trusted source. Do not assume createElement or Renderer2 sanitizes arbitrary DOM writes. Remove raw DOM insertion where a binding suffices.
3. Never construct or compile a template from user-controlled strings, even when the string passed an HTML sanitizer. Inspect runtime compiler use and third-party template engines separately. Route justified DomSanitizer exceptions through the governance skill; a SafeHtml type is not provenance evidence.
4. Exercise the real component with an event-handler payload such as `<img src="invalid-image" onerror="window.__xssProbe=1">` and a `javascript:` link in an isolated test page. Assert the marker stays unset, event attributes are removed or rendered as text, and clicking the link does not execute code or navigate to an unsafe destination. Include ordinary text, intended formatting, and an allowed HTTPS link as positive controls so a blank page cannot pass.
5. Run the same inputs through saved content and relevant widget paths; for SSR inspect the response HTML and repeat after hydration. Assert dangerous nodes/attributes are absent, not merely that CSP blocked execution. Review CSP and Trusted Types as defense in depth, verify headers at deployment, and do not weaken policy to silence test failures.

### Regression cases

Use the project's browser/component suite with harmless markers, no real exfiltration, and no production data. Record the command, expected DOM/navigation, actual DOM/navigation, and browser evidence. A DOM-only mock does not prove browser execution safety.

| Case | Reproduction and required assertion | Decision on observation |
| --- | --- | --- |
| Event-handler payload | The marker executes or an executable event attribute remains in rendered content. | FAIL |
| Script URL | Clicking an attacker-controlled javascript: link executes code. | FAIL |
| Raw DOM sink | An untrusted value reaches unsanitized HTML insertion or dynamic template compilation. | FAIL |
| Missing browser run | Only lint/build or a sanitizer stub ran; the affected rendering path was not exercised. | BLOCKED |
| Bound template | Malicious inputs are neutralized before and after applicable hydration; positive text/formatting/link controls still work. | PASS |

FAIL takes precedence over BLOCKED when an unsafe behavior is demonstrated. Report PASS only when all affected sources and sinks have evidence and the applicable negative and positive cases pass. Explain why SSR or a context is not applicable instead of silently skipping it.

## Do Not

- Do not use regular-expression HTML stripping, CSP alone, or bypassSecurityTrustHtml as an XSS fix.
- Do not execute payloads against real users or send their data to an external receiver.
- Do not replace the rendering architecture when removing one unsafe sink solves the defect.

## Review Checklist

- [ ] Source-to-sink inventory includes indirect DOM writes and template compilation.
- [ ] Context-specific defenses and any trust exceptions have been reviewed.
- [ ] Actual browser results include malicious and positive controls, plus SSR/hydration if used.
- [ ] Missing execution evidence is BLOCKED; executable attacker data is FAIL.

## Expected Output

Return the scoped decision, affected data flows and files, minimal patch, and before/after assertions. Include commands, redacted DOM evidence, supported Angular-version references, remaining gaps, and rollback steps.

Source: [Angular security model, DOM APIs, sanitization, CSP, and Trusted Types](https://angular.dev/best-practices/security). Verify behavior against the installed release rather than assuming current documentation applies unchanged to older majors.
