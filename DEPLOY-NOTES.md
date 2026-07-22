# Threshold v30 deployment

## Session-saved analytics fix

In v28, a session was saved locally and then the interface was redrawn before
the `session_saved` analytics event was queued. The v28 startup/render error
could therefore interrupt execution after the local save but before analytics.

v29 fixed the render error. v30 also makes the event flow resilient:

1. Save the session locally
2. Queue and send `session_saved`
3. Redraw the interface

This applies to both timed-absence sessions and Door is a Bore sessions.

## Stopped values

- `session_started`: `stopped` is `NULL`, because the result is not yet known
- Completed `session_saved`: `stopped` is `0`
- Early-ended `session_saved`: `stopped` is `1`

## Cloudflare

No additional D1 migration or Worker-code update is required after v28.

- App version: `v30`
- Service-worker cache: `threshold-v30`
