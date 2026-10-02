/**
 * app.json holds the static config; this file adds the parts that depend on
 * where the site is being deployed.
 *
 *   EXPO_BASE_URL         subpath the site is served from, e.g. "/nudge" for a
 *                         GitHub Pages project site. Empty for a root domain.
 *   EXPO_PUBLIC_SITE_URL  absolute origin, used for link-preview images.
 *
 * Both are set by .github/workflows/deploy.yml. Building locally with neither
 * set produces a site that works from the root of any host.
 */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? '',
  },
});
