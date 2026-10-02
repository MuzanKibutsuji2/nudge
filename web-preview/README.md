# web-preview

A generated copy of the exported web build, kept so the browser preview can
be served without reinstalling dependencies and rebuilding first.

It is not source. Regenerate it with:

```bash
npm run export:web && npm run preview:snapshot
```

Unused icon fonts are stripped; the app only uses Feather.
