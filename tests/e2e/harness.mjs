/**
 * A tiny end-to-end harness.
 *
 * There is no headless browser available in this environment, so instead of
 * Playwright we boot the exported web build inside jsdom and drive it the way
 * a person would: read the visible text, press the thing with that label, wait
 * for React to settle.
 *
 * Usage:
 *   npx expo export --platform web --output-dir dist
 *   node tests/e2e/smoke.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(ROOT, 'dist');

/** jsdom shouts about CSS it cannot parse; none of it matters here. */
const IGNORED_ERRORS = /Not implemented|Could not parse CSS|getContext|scrollTo/i;

export function distExists() {
  return fs.existsSync(path.join(DIST, 'index.html'));
}

/** Read an exported page straight off disk, for checks on the HTML itself. */
export function readPage(file) {
  return fs.readFileSync(path.join(DIST, file), 'utf8');
}

export function distHas(file) {
  return fs.existsSync(path.join(DIST, file));
}

/**
 * The site can be built for a subpath ("/nudge" on GitHub Pages project
 * sites), which prefixes every URL in the HTML. Read it back off the build so
 * the tests work against either kind.
 */
export function basePath() {
  const match = readPage('index.html').match(/src="([^"]*)_expo\/static\//);
  return match ? match[1].replace(/\/$/, '') : '';
}

function hidden(node) {
  const style = node.ownerDocument.defaultView.getComputedStyle(node);
  if (style.display === 'none' || style.visibility === 'hidden') return true;
  if (node.getAttribute?.('aria-hidden') === 'true') return true;
  return false;
}

/** Collect inline styles, pruning hidden subtrees the same way. */
function visibleStyles(node) {
  if (!node || node.nodeType !== 1 || hidden(node)) return '';
  let out = node.getAttribute('style') ? `${node.getAttribute('style')} ` : '';
  for (const child of node.childNodes) out += visibleStyles(child);
  return out;
}

/**
 * react-navigation keeps inactive tab screens mounted, so textContent lies.
 * Walk the tree and skip anything a person could not see.
 */
function visibleText(node) {
  if (!node) return '';
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return '';
  if (hidden(node)) return '';
  let out = '';
  for (const child of node.childNodes) out += visibleText(child) + ' ';
  return out;
}

/**
 * @param page     which exported HTML file to open, for deep-link tests
 * @param viewport browser size, so the phone and desktop layouts can both be
 *                 driven (jsdom defaults to 1024x768)
 */
export async function launch({
  storage = {},
  url = 'http://localhost/',
  page = 'index.html',
  viewport = null,
} = {}) {
  if (!distExists()) {
    throw new Error('dist/ not found — run: npx expo export --platform web --output-dir dist');
  }

  const html = fs.readFileSync(path.join(DIST, page), 'utf8');
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => {
    if (!IGNORED_ERRORS.test(String(error?.message))) errors.push(String(error?.message));
  });
  virtualConsole.on('error', (...args) => {
    const message = args.map(String).join(' ');
    if (!IGNORED_ERRORS.test(message)) errors.push(message);
  });

  const dom = new JSDOM(html, {
    url,
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    virtualConsole,
  });

  const { window } = dom;
  for (const [key, value] of Object.entries(storage)) window.localStorage.setItem(key, value);

  if (viewport) {
    const { width, height = 820 } = viewport;
    for (const [target, props] of [
      [window, { innerWidth: width, innerHeight: height }],
      [window.document.documentElement, { clientWidth: width, clientHeight: height }],
    ]) {
      for (const [key, value] of Object.entries(props)) {
        Object.defineProperty(target, key, { value, configurable: true, writable: true });
      }
    }
  }

  window.matchMedia =
    window.matchMedia ||
    ((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }));
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.ResizeObserver = window.ResizeObserver || NoopObserver;
  window.IntersectionObserver = window.IntersectionObserver || NoopObserver;
  // Without a Font Loading API, @expo/vector-icons polls for 12s and then
  // rejects. Resolve it immediately — icon fonts are irrelevant to behaviour.
  window.document.fonts = {
    load: () => Promise.resolve([{}]),
    check: () => true,
    ready: Promise.resolve(),
    add() {},
    delete() {},
    addEventListener() {},
    removeEventListener() {},
  };
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollTo = () => {};
  window.HTMLElement.prototype.measure = () => {};

  // Run the bundle(s) the page asks for, in order.
  const sources = [...window.document.querySelectorAll('script[src]')].map((node) =>
    node.getAttribute('src')
  );
  for (const src of sources) {
    // Strip any deploy-time base path: the file still sits at dist/_expo/...
    const relative = src.includes('_expo/') ? src.slice(src.indexOf('_expo/')) : src.replace(/^\//, '');
    window.eval(fs.readFileSync(path.join(DIST, relative), 'utf8'));
  }

  const api = {
    window,
    document: window.document,
    errors,

    /** Let React, layout effects and any pending timers settle. */
    async settle(times = 3) {
      for (let i = 0; i < times; i += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 0));
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    },

    text() {
      return visibleText(window.document.body).replace(/\s+/g, ' ').trim();
    },

    has(needle) {
      return api.text().includes(needle);
    },

    /** Every visible element whose own text matches. */
    findAll(needle, { exact = false } = {}) {
      const nodes = [...window.document.querySelectorAll('div,span,a,button,input,p')];
      return nodes.filter((node) => {
        if (hidden(node)) return false;
        const label =
          node.getAttribute('aria-label') ||
          visibleText(node).replace(/\s+/g, ' ').trim();
        return exact ? label === needle : label.includes(needle);
      });
    },

    /** The smallest visible element containing this text. */
    find(needle, options) {
      const matches = api.findAll(needle, options);
      return matches.length ? matches[matches.length - 1] : null;
    },

    /** Press the innermost clickable thing matching `needle`. */
    async tap(needle, options) {
      const matches = api.findAll(needle, options);
      if (!matches.length) throw new Error(`tap: nothing visible matching “${needle}”`);

      let target = null;
      for (let i = matches.length - 1; i >= 0 && !target; i -= 1) {
        let node = matches[i];
        while (node && node !== window.document.body) {
          const role = node.getAttribute('role') || node.getAttribute('data-testid');
          const tag = node.tagName.toLowerCase();
          if (
            role === 'button' ||
            role === 'radio' ||
            role === 'checkbox' ||
            role === 'link' ||
            role === 'tab' ||
            tag === 'button' ||
            tag === 'a' ||
            node.getAttribute('tabindex') !== null
          ) {
            target = node;
            break;
          }
          node = node.parentElement;
        }
      }

      const node = target ?? matches[matches.length - 1];
      const fire = (type, Ctor = window.MouseEvent) =>
        node.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, view: window }));

      fire('pointerdown', window.Event);
      fire('mousedown');
      fire('pointerup', window.Event);
      fire('mouseup');
      fire('click');
      await api.settle();
      return node;
    },

    async type(text, { placeholder } = {}) {
      const inputs = [...window.document.querySelectorAll('input,textarea')].filter(
        (node) => !hidden(node) && (!placeholder || node.placeholder?.includes(placeholder))
      );
      const input = inputs[0];
      if (!input) throw new Error(`type: no visible input${placeholder ? ` for “${placeholder}”` : ''}`);
      const prototype =
        input.tagName.toLowerCase() === 'textarea'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
      setter.call(input, text);
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      input.dispatchEvent(new window.Event('change', { bubbles: true }));
      await api.settle();
      return input;
    },

    /** Poll until the predicate passes, so we never race React. */
    async waitFor(predicate, { timeout = 4000, label = 'condition' } = {}) {
      const started = Date.now();
      while (Date.now() - started < timeout) {
        if (typeof predicate === 'string' ? api.has(predicate) : predicate()) return true;
        await api.settle(1);
      }
      throw new Error(`waitFor: timed out on ${typeof predicate === 'string' ? `“${predicate}”` : label}`);
    },

    storage() {
      const out = {};
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        out[key] = window.localStorage.getItem(key);
      }
      return out;
    },

    /** Inline colours currently painted on screen, for theme assertions. */
    colorsInUse() {
      return visibleStyles(window.document.body).toLowerCase();
    },

    close() {
      window.close();
    },
  };

  await api.settle(6);
  return api;
}

/* -------------------------------------------------------------- */
/* Minimal assertion reporting                                     */
/* -------------------------------------------------------------- */

let failures = 0;

export function section(name) {
  console.log(`\n== ${name} ==`);
}

export function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

export function finish() {
  if (failures) {
    console.log(`\n${failures} CHECK(S) FAILED`);
    process.exit(1);
  }
  console.log('\nALL CHECKS PASSED');
}
