# Threshold v23 deployment

Phase two of the structural refactor.

## Newly extracted

- Session candidate creation and review-plan preview
- Session status text
- Active-run save/load/clear helpers
- Numeric settings field controllers
- Pure chart data helpers

The visual chart rendering remains in `app.js` for now because it is tightly coupled to
the existing HTML-string templates. This avoids an unnecessary UI rewrite during the
same release.

## Compatibility

The storage key, schema version and user-facing behaviour are unchanged. Existing user
data remains compatible.

## Testing

The test suite now covers session previews, active-run state and chart summaries in
addition to progression, storage and migration rules.

Service-worker cache: `threshold-v23`.
