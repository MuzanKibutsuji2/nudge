/**
 * End-to-end test for the things that make Nudge a website rather than a phone
 * app in a browser: real pages, real titles, link previews, two layouts, and
 * deep links that survive a refresh.
 *
 *   npx expo export --platform web --output-dir dist
 *   node tests/e2e/website.mjs
 */
import { basePath, check, distHas, finish, launch, readPage, section } from './harness.mjs';

/** "" for a root domain, "/nudge" for a GitHub Pages project site. */
const BASE = basePath();

/** Skip onboarding so each run starts in the app proper. */
const SETTINGS = JSON.stringify({
  name: 'Riya',
  focusAreas: ['Studying'],
  theme: 'system',
  accent: 'forest',
  defaultSessionMinutes: 5,
  sounds: false,
  haptics: false,
  reduceMotion: false,
  onboarded: true,
});

const storage = { 'nudge/v1/settings': SETTINGS };

/* ------------------------------------------------------------------ */
section('Every screen is a real page');
/* ------------------------------------------------------------------ */

const PAGES = [
  'index.html',
  'home.html',
  'today.html',
  'start.html',
  'history.html',
  'settings.html',
  'onboarding.html',
  'focus.html',
  'break.html',
  'wall.html',
  'how-it-works.html',
  'stuck/index.html',
  'reset/index.html',
  'reset/room.html',
  'reset/unclutter.html',
];

for (const page of PAGES) {
  check(`/${page.replace('.html', '').replace('index', '')} is exported`, distHas(page));
}

/* ------------------------------------------------------------------ */
section('The browser tab says where you are');
/* ------------------------------------------------------------------ */

const titleOf = (file) => (readPage(file).match(/<title[^>]*>([^<]*)<\/title>/) ?? [])[1] ?? '';

check('landing', titleOf('index.html') === 'Nudge — small steps. no pressure.', titleOf('index.html'));
check('home', titleOf('home.html') === 'Home · Nudge', titleOf('home.html'));
check('today', titleOf('today.html') === 'Today · Nudge', titleOf('today.html'));
check('history', titleOf('history.html') === 'History · Nudge', titleOf('history.html'));
check('settings', titleOf('settings.html') === 'Settings · Nudge', titleOf('settings.html'));
check(
  'a page inside a flow stays unlabelled',
  titleOf('reset/room.html') === 'Nudge — small steps. no pressure.',
  titleOf('reset/room.html')
);

/* ------------------------------------------------------------------ */
section('Shareable and installable');
/* ------------------------------------------------------------------ */

const index = readPage('index.html');

check('language is declared', /<html[^>]*lang="en"/.test(index));
check('responsive viewport', index.includes('width=device-width'));
check('description for search results', /<meta name="description" content="A calm place/.test(index));
check('link preview title', index.includes('property="og:title"'));
check('link preview image', index.includes('property="og:image"'));
check('theme colour, light', index.includes('content="#FBF8F4"'));
check('theme colour, dark', index.includes('content="#131210"'));
check('web app manifest', index.includes('rel="manifest"'));
check('home-screen icon', index.includes('rel="apple-touch-icon"'));
check('favicon', index.includes('rel="icon"'));
check(
  'assets resolve for however this build is deployed',
  index.includes(`src="${BASE}/_expo/static/`),
  BASE || '(root)'
);
check('works without JavaScript enough to explain itself', index.includes('<noscript>'));
check('no-JS copy stays honest about privacy', index.includes('Nothing is sent anywhere'));

check('manifest shipped', distHas('manifest.webmanifest'));
check('service worker shipped', distHas('sw.js'));
check('robots.txt shipped', distHas('robots.txt'));
check('icon shipped', distHas('icon.png'));
check('GitHub Pages will not ignore /_expo', distHas('.nojekyll'));

const manifest = JSON.parse(readPage('manifest.webmanifest'));
check('manifest names the app', manifest.short_name === 'Nudge');
check('manifest uses relative paths, so a subpath deploy works', manifest.start_url === '.');
check('manifest has an icon', manifest.icons.length > 0);

const sw = readPage('sw.js');
check('service worker caches the hashed build', sw.includes('/_expo/static/'));
check('service worker prefers the network for pages', sw.includes('fetch(request)'));

/* ------------------------------------------------------------------ */
section('Wide screen: navigation rail');
/* ------------------------------------------------------------------ */

const desktop = await launch({ storage, viewport: { width: 1320, height: 900 } });
await desktop.waitFor('What do you need right now?');

check('the rail is there', desktop.has('small steps. no pressure.'));
check('it names the destinations', ['Home', 'Today', 'Start', 'History', 'Settings'].every((label) => desktop.has(label)));
check('it says where the data lives', desktop.has('Everything stays on this device.'));
check('it shows the version', desktop.has('Version 1.0.0'));

await desktop.tap('Today');
await desktop.waitFor('Small things I did');
check('the rail navigates', desktop.has('Small things I did'));
check('the tab title follows', desktop.window.document.title === 'Today · Nudge', desktop.window.document.title);
check(
  'the address bar follows',
  desktop.window.location.pathname === `${BASE}/today`,
  desktop.window.location.pathname
);

await desktop.tap('History');
await desktop.waitFor('What helps you start');
check('history opens from the rail', desktop.has('What helps you start'));

check('no runtime errors on desktop', desktop.errors.length === 0, desktop.errors[0]);
desktop.close();

/* ------------------------------------------------------------------ */
section('Narrow screen: the phone layout');
/* ------------------------------------------------------------------ */

const phone = await launch({ storage, viewport: { width: 414, height: 896 } });
await phone.waitFor('What do you need right now?');

check('the rail is gone', !phone.has('Everything stays on this device.'));
check('the tab bar is still there', ['Home', 'Today', 'Start', 'History', 'Settings'].every((label) => phone.has(label)));

await phone.tap('Today');
await phone.waitFor('Small things I did');
check('tabs navigate', phone.has('Small things I did'));

check('no runtime errors on a phone', phone.errors.length === 0, phone.errors[0]);
phone.close();

/* ------------------------------------------------------------------ */
section('Deep links survive a refresh');
/* ------------------------------------------------------------------ */

const deep = await launch({
  storage,
  page: 'history.html',
  url: `http://localhost${BASE}/history`,
  viewport: { width: 1320, height: 900 },
});
await deep.waitFor('What helps you start');
check('opening /history directly lands on History', deep.has('What helps you start'));
check('and not on the landing screen', !deep.has('What do you need right now?'));
check('no runtime errors', deep.errors.length === 0, deep.errors[0]);
deep.close();

const settingsPage = await launch({
  storage,
  page: 'settings.html',
  url: `http://localhost${BASE}/settings`,
  viewport: { width: 414, height: 896 },
});
await settingsPage.waitFor('Appearance');
check('opening /settings directly works on a phone too', settingsPage.has('Appearance'));
check('no runtime errors', settingsPage.errors.length === 0, settingsPage.errors[0]);
settingsPage.close();

finish();
