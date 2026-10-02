import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * The HTML shell every page is served inside. This file runs at build time
 * only — it is not part of the app bundle, so nothing here can use hooks or
 * app state. It exists to make Nudge a proper web page: a title, a
 * description, link previews, and CSS that is in place before React starts.
 */

/** Set when deploying under a subpath, e.g. "/nudge" on GitHub Pages. */
const BASE = process.env.EXPO_BASE_URL ?? '';
/** Absolute origin, when it is known, so link previews resolve. */
const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? '';

const TITLE = 'Nudge — small steps. no pressure.';
const DESCRIPTION =
  'A calm place to start when you cannot. Pick the smallest useful step, do it for five minutes, stop whenever you want. Everything stays on your device.';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* The <title> is set per route by expo-router's Head in
            app/_layout.tsx; everything static lives here. */}
        <meta name="description" content={DESCRIPTION} />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FBF8F4" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#131210" />

        <link rel="icon" href={`${BASE}/favicon.ico`} />
        <link rel="apple-touch-icon" href={`${BASE}/icon.png`} />
        <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE}${BASE}/icon.png`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />

        {/* Stops the body from scrolling behind the app's own scroll views. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: BASE_STYLE }} />

        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('${BASE}/sw.js').catch(function(){})})}`,
          }}
        />
      </head>

      <body>
        <noscript>
          <div style={NOSCRIPT_STYLE}>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 12px' }}>Nudge</h1>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Nudge needs JavaScript to run. Nothing is sent anywhere either way — the whole app
              works on your device, offline.
            </p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}

/**
 * Written as a string because this is the only chance to style the page before
 * React mounts, and a flash of white would be a bad first impression for an app
 * about calm.
 */
const BASE_STYLE = `
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  body {
    background-color: #FBF8F4;
    overflow: hidden;
    overscroll-behavior: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  @media (prefers-color-scheme: dark) { body { background-color: #131210; } }

  input, textarea { outline: none; }

  /* Keyboard users get a clear ring; mouse users never see it. */
  :focus { outline: none; }
  :focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
    border-radius: 6px;
  }

  [role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="radio"], a, button {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  ::selection { background: rgba(46, 107, 94, 0.18); }

  /* A scrollbar that doesn't shout. */
  * { scrollbar-width: thin; scrollbar-color: rgba(128,120,110,0.35) transparent; }
  *::-webkit-scrollbar { width: 10px; height: 10px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background-color: rgba(128,120,110,0.3);
    border-radius: 99px;
    border: 3px solid transparent;
    background-clip: content-box;
  }
  *::-webkit-scrollbar-thumb:hover { background-color: rgba(128,120,110,0.5); }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

const NOSCRIPT_STYLE: React.CSSProperties = {
  maxWidth: 420,
  margin: '14vh auto',
  padding: '0 24px',
  color: '#2A2724',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
