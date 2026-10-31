import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { App, CONFIG, clientConfig, providers } from './app.mjs';

await bootstrapApplication(App, { providers: [...providers(), { provide: CONFIG, useFactory: clientConfig }] });
