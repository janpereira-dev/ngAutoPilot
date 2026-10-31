import fs from 'node:fs';
import https from 'node:https';
import { render } from '../src/render.mjs';

export async function serveAngular(tls) {
  const requests = [];
  let origin;
  const server = https.createServer({ key: tls.key, cert: tls.cert }, async (request, response) => {
    requests.push(request.url);
    try {
      if (request.url === '/browser.js') {
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        response.end(fs.readFileSync('dist/browser.js'));
      } else if (request.url === '/') {
        const html = await render({ origin, foreign: origin, fault: '', user: 'ANONYMOUS',
          html: '<b>Strict browser TLS</b>', link: origin, resource: '', variable: 'data', context: null });
        response.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
        response.end(html);
      } else { response.writeHead(404); response.end(); }
    } catch { response.writeHead(500); response.end('Rendering failed'); }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `https://127.0.0.1:${server.address().port}`;
  return { origin, requests, close: () => new Promise((resolve) => {
    server.close(resolve); server.closeAllConnections();
  }) };
}
