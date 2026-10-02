/**
 * Serves the exported web build (dist/) as a single-page app.
 *
 * It mirrors what a static host (GitHub Pages, Netlify, Cloudflare) does:
 * clean URLs served from the matching .html file, and an app-shell fallback
 * for anything it doesn't recognise.
 *
 *   npm run export:web   # build dist/
 *   npm run serve        # http://localhost:8080
 *
 * Dependency free on purpose, and it binds to 0.0.0.0 so it also works from
 * inside a container or a remote sandbox.
 *
 * It serves dist/ when that exists, and otherwise falls back to the committed
 * copy in web-preview/ (see scripts/snapshot-preview.mjs), so the app can be
 * shown without reinstalling and rebuilding first. Both folders are generated;
 * neither is source.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = [path.join(ROOT, 'dist'), path.join(ROOT, 'web-preview')];
const DIST = CANDIDATES.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ?? CANDIDATES[0];
const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? '0.0.0.0';

/** Mirrors RISKY_DIRECTORIES in scripts/snapshot-preview.mjs. */
const RISKY_DIRECTORIES = new Set([
  'node_modules', 'build', 'dist', 'out', 'target', 'coverage', 'bin', 'obj',
  'tmp', 'temp', 'cache', 'logs', 'vendor',
]);

const safeSegment = (name) =>
  RISKY_DIRECTORIES.has(name.toLowerCase()) ? `_${name}` : name;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
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
  console.error('No web build found. Build one first:\n\n  npm run export:web\n');
  process.exit(1);
}

http
  .createServer((req, res) => {
    let file;
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      file = path.join(DIST, pathname);
      if (!file.startsWith(DIST)) file = path.join(DIST, 'index.html');

      // The snapshot build underscores directory names that tools delete (see
      // scripts/snapshot-preview.mjs). The bundle still asks for the originals.
      if (!fs.existsSync(file)) {
        const renamed = path.join(DIST, ...pathname.split('/').map(safeSegment));
        if (renamed.startsWith(DIST) && fs.existsSync(renamed)) file = renamed;
      }

      // Clean URLs: /today is served by today.html, /reset/room by
      // reset/room.html. Static hosts do this for you; this server is only
      // used locally, so it has to do it itself.
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        const candidates = [
          `${file}.html`,
          path.join(file, 'index.html'),
          path.join(DIST, '404.html'),
          path.join(DIST, 'index.html'),
        ];
        file = candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates.at(-1);
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
    console.log(
      `Nudge preview running on http://${HOST}:${PORT} (serving ${path.basename(DIST)}/)`
    );
  });
