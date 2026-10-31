import '@angular/compiler';
import '@angular/platform-server/init';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { App, CONFIG, providers } from './app.mjs';

export function render(config) {
  return renderApplication((context) => bootstrapApplication(App, {
    providers: [...providers(), provideServerRendering(), { provide: CONFIG, useValue: config }],
  }, context), {
    document: '<!doctype html><html><head><base href="/"></head><body><lab-app></lab-app><script type="module" src="/browser.js"></script></body></html>',
    url: config.origin, allowedHosts: ['127.0.0.1'],
  });
}
