import {
  afterNextRender, Component, ElementRef, inject, Injectable, InjectionToken,
  makeStateKey, PLATFORM_ID, SecurityContext, signal, TransferState,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { DomSanitizer, provideClientHydration, withNoHttpTransferCache } from '@angular/platform-browser';

export const CONFIG = new InjectionToken('synthetic lab request');
const STATE_KEY = makeStateKey('synthetic-lab-config');

class AuthState { access = ''; }
Injectable({ providedIn: 'root' })(AuthState);

function credentials(request, next) {
  const auth = inject(AuthState);
  const config = inject(CONFIG);
  const origin = inject(DOCUMENT).location.origin;
  if (auth.access && (new URL(request.url, origin).origin === origin || config.fault === 'origin-leak')) {
    return next(request.clone({ setHeaders: { Authorization: `Bearer ${auth.access}` } }));
  }
  return next(request);
}

export function providers() {
  return [provideHttpClient(withInterceptors([credentials])), provideClientHydration(withNoHttpTransferCache())];
}

export class App {
  config = inject(CONFIG);
  sanitizer = inject(DomSanitizer);
  http = inject(HttpClient);
  auth = inject(AuthState);
  state = inject(TransferState);
  host = inject(ElementRef);
  ready = signal(false);
  status = signal('ready');
  html = '';
  link = '';
  resource = null;

  constructor() {
    const { fault, html, link, resource } = this.config;
    this.html = html;
    this.link = fault === 'script-url' ? this.sanitizer.bypassSecurityTrustUrl(link) : link;
    if (fault === 'html-bypass') {
      // Deliberate negative control: sanitize unwraps a trusted value; it does not re-sanitize it.
      this.html = this.sanitizer.bypassSecurityTrustHtml(
        this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(html)),
      );
    }
    if (this.config.context === 'URL') {
      try { this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustHtml(html)); }
      catch {
        if (fault === 'context-fallback') this.html = this.sanitizer.bypassSecurityTrustHtml(html);
        else { this.html = ''; this.status.set('context rejected'); }
      }
    }
    try {
      const url = new URL(resource);
      // Inject one reserved synthetic lookalike as a negative control, never a general prefix rule.
      const injectedLookalike = fault === 'host-prefix'
        && resource === 'https://media.example.test.attacker.test/embed/lesson-1';
      const allowed = injectedLookalike || (url.protocol === 'https:' && url.hostname === 'media.example.test' && !url.port
          && !url.username && !url.password && url.pathname === '/embed/lesson-1'
          && !url.search && !url.hash && url.href === resource);
      if (allowed) this.resource = this.sanitizer.bypassSecurityTrustResourceUrl(resource);
    } catch { /* Invalid resources remain rejected. */ }
    if (!isPlatformBrowser(inject(PLATFORM_ID))) this.state.set(STATE_KEY, this.config);
    afterNextRender(() => {
      if (fault === 'raw-dom') this.host.nativeElement.querySelector('[data-raw]').innerHTML = html;
      this.ready.set(true);
    });
  }

  login() {
    this.http.post('/auth/login', { user: 'alice' }).subscribe((data) => {
      this.auth.access = data.access;
      if (this.config.fault === 'persistent-token') localStorage.setItem('session-secret', data.access);
      this.status.set('logged in');
    });
  }

  mutate() { this.http.post('/api/mutate', {}).subscribe(() => this.status.set('mutated')); }
  request(url) { this.http.get(url).subscribe((data) => this.status.set(JSON.stringify(data))); }
  compile() { this.http.post('/api/template', { variable: this.config.variable }).subscribe((data) => this.status.set(JSON.stringify(data))); }
}

// The template is a source-controlled literal. User input is data in bindings, never template code.
Component({
  selector: 'lab-app', standalone: true,
  template: `<h1>Angular security fixture</h1>
    <p data-ready>{{ ready() }}</p><p data-user>{{ config.user }}</p><p data-origin>{{ config.origin }}</p>
    <div data-text>{{ config.html }}</div><div data-html [innerHTML]="html"></div>
    <div data-raw [innerHTML]="config.fault === 'raw-dom' ? '' : config.html"></div>
    <a data-link [href]="link">Content link</a>
    @if (resource) { <iframe title="Approved lesson" [src]="resource"></iframe> }
    <button (click)="login()">Login</button><button (click)="mutate()">Change state</button>
    <button (click)="request('/api/echo')">Allowed request</button>
    <button (click)="request(config.foreign + '/echo')">Foreign request</button>
    <button (click)="compile()">Compile CMS content</button>
    <p role="status">{{ status() }}</p>`,
})(App);

export function clientConfig() { return inject(TransferState).get(STATE_KEY, null); }
