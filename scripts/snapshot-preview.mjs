/**
 * Copies the exported web build into web-preview/ so the browser preview can
 * be served without rebuilding (and so it survives environments that clear
 * dist/). Drops the icon fonts the app never asks for — Nudge only uses
 * Feather — which takes the copy from ~6 MB down to under 2.5 MB.
 *
 *   npm run export:web
 *   npm run preview:snapshot
 *
 * Asset paths that contain a node_modules segment are rewritten to _vendor,
 * because both .gitignore and the sandbox cleaner drop anything under a folder
 * with that name. serve-web.mjs maps the requests back, so the bundle itself is
 * copied byte for byte.
 *
 * Entirely disposable: delete web-preview/ any time and regenerate it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'dist');
const TARGET = path.join(ROOT, 'web-preview');

/** The only icon family the app imports. */
const KEEP_FONT = /Feather\./;

if (!fs.existsSync(path.join(SOURCE, 'index.html'))) {
  console.error('Nothing to copy. Build it first:\n\n  npm run export:web\n');
  process.exit(1);
}

/** node_modules → _vendor, at any depth. */
export function safePath(relative) {
  return relative
    .split(path.sep)
    .map((segment) => (segment === 'node_modules' ? '_vendor' : segment))
    .join(path.sep);
}

function copy(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name === 'node_modules' ? '_vendor' : entry.name);

    if (entry.isDirectory()) {
      copy(source, target);
      continue;
    }
    if (entry.name.endsWith('.ttf') && !KEEP_FONT.test(entry.name)) continue;
    if (entry.name.endsWith('.map')) continue;

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

fs.rmSync(TARGET, { recursive: true, force: true });
fs.mkdirSync(TARGET, { recursive: true });
copy(SOURCE, TARGET);

fs.writeFileSync(
  path.join(TARGET, 'README.md'),
  [
    '# web-preview',
    '',
    'A generated copy of the exported web build, kept so the browser preview can',
    'be served without reinstalling dependencies and rebuilding first.',
    '',
    'It is not source. Regenerate it with:',
    '',
    '```bash',
    'npm run export:web && npm run preview:snapshot',
    '```',
    '',
    'Unused icon fonts are stripped; the app only uses Feather.',
    '',
  ].join('\n')
);

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(fs.statSync(full).size);
  }
};
walk(TARGET);

const bytes = files.reduce((total, size) => total + size, 0);
console.log(`web-preview: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
