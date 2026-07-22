# Threshold v22 — phase-one refactor

This version keeps the existing GitHub Pages/PWA architecture and user-facing
behaviour, while separating the source into maintainable files.

## Active modules

- `js/storage.js` — schema, migration, normalisation and browser persistence
- `js/progression.js` — progression decisions and warm-up planning
- `js/timer.js` — duration formatting
- `js/ui.js` — shared DOM and escaping helpers
- `js/app.js` — current screen orchestration and remaining feature code
- `css/app.css` — complete application stylesheet

`state.js`, `sessions.js`, `charts.js` and `settings.js` establish the next module
boundaries. Their larger DOM-coupled implementations remain in `app.js` during this
first phase to avoid a risky full rewrite.

## Run locally

ES modules should be served over HTTP rather than opened directly from the filesystem.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Run tests

No third-party packages are required:

```bash
npm test
```

## Deploy to GitHub Pages

Deploy the contents of this directory. Copy the existing production icon files into
`assets/icons/` before deployment.

The service-worker cache is `threshold-v22`.

## Recommended next extraction

1. Session lifecycle and review flow
2. Timer and active-run recovery
3. Charts
4. Settings controllers
5. DOM rendering components
