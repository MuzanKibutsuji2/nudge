/**
 * Serves the exported web build (dist/) as a single-page app.
 *
 * Nudge is a phone app — this is just a quick way to click through it in a
 * browser without a device or a simulator. On web the app renders inside a
 * phone frame (components/DeviceFrame.tsx).
 *
 *   npm run export:web   # build dist/
 *   npm run serve        # http://localhost:8080
 *
 * Dependency free on purpose, and it binds to 0.0.0.0 so it also works from
 * inside a container or a remote sandbox.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('No dist/index.html yet. Build it first:\n\n  npm run export:web\n');
  process.exit(1);
}

http
  .createServer((req, res) => {
    let file;
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      file = path.join(DIST, pathname);
      if (!file.startsWith(DIST)) file = path.join(DIST, 'index.html');
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        const indexed = path.join(file, 'index.html');
        // Client-side routing: unknown paths fall back to the app shell.
        file = fs.existsSync(indexed) ? indexed : path.join(DIST, 'index.html');
      }
    } catch {
      file = path.join(DIST, 'index.html');
    }

    try {
      const body = fs.readFileSync(file);
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Could not read ${path.relative(ROOT, file)}: ${error.message}`);
    }
  })
  .listen(PORT, HOST, () => {
    console.log(`Nudge preview running on http://${HOST}:${PORT}`);
  });
