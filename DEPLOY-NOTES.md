# Threshold v22 deployment

This is a structural refactor rather than a feature release.

## Before deployment

Copy the existing app icons into `assets/icons/`:

- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`

## Behaviour

The existing UI, progression rules, local-storage key and schema version are retained.
Users should keep their existing data because the production origin and storage key do
not change.

## Technical changes

- Inline CSS moved to `css/app.css`
- Inline JavaScript moved to ES modules
- Storage/migrations isolated in `js/storage.js`
- Progression/warm-ups isolated in `js/progression.js`
- Duration and UI helpers isolated
- Node-based regression tests added
- GitHub Actions test workflow added
- Service-worker shell updated for all module files
- Cache version bumped to `threshold-v22`

Run `npm test` before deployment.
