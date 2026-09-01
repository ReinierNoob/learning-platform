import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

const listenPort = Number(process.env.UX_HTTPS_PROXY_PORT ?? '3443');
const targetPort = Number(process.env.UX_HTTPS_PROXY_TARGET_PORT ?? '3200');
const keyPath = process.env.UX_HTTPS_PROXY_KEY ?? '/tmp/ux-key.pem';
const certPath = process.env.UX_HTTPS_PROXY_CERT ?? '/tmp/ux-cert.pem';

if (!Number.isInteger(listenPort) || !Number.isInteger(targetPort)) {
  throw new Error('invalid_https_proxy_port');
}

const server = https.createServer(
  {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  },
  (request, response) => {
    const headers = {
      ...request.headers,
      host: `localhost:${listenPort}`,
      'x-forwarded-proto': 'https',
      'x-forwarded-host': `localhost:${listenPort}`,
    };

    const upstream = http.request(
      {
        hostname: '127.0.0.1',
        port: targetPort,
        path: request.url,
        method: request.method,
        headers,
      },
      (upstreamResponse) => {
        const responseHeaders = { ...upstreamResponse.headers };
        const location = responseHeaders.location;
        if (typeof location === 'string') {
          responseHeaders.location = location
            .replace(`http://localhost:${targetPort}`, `https://localhost:${listenPort}`)
            .replace(`http://localhost:${listenPort}`, `https://localhost:${listenPort}`);
        }
        response.writeHead(upstreamResponse.statusCode ?? 502, responseHeaders);
        upstreamResponse.pipe(response);
      },
    );

    upstream.on('error', (error) => {
      console.error('https_proxy_upstream_error', error.message);
      if (!response.headersSent) response.writeHead(502, { 'content-type': 'text/plain' });
      response.end('Bad gateway');
    });

    request.pipe(upstream);
  },
);

server.listen(listenPort, '127.0.0.1', () => {
  console.log(`HTTPS UX proxy listening on https://localhost:${listenPort} -> http://127.0.0.1:${targetPort}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
