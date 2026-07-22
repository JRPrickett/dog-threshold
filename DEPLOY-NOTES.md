# Threshold v34 deployment

## Active-run durability

v34 makes running separation sessions resilient to:

- Accidental Control Centre taps
- Switching to another PWA
- iOS process suspension
- Page reloads
- PWA restarts
- Browser back/forward cache restoration
- Temporary media-session interruption

The saved run includes the original start time, current repetition, plan,
completed warm-ups, pending result, notes, tags and chime state.

The app automatically restores recent active runs and recalculates elapsed time
using `Date.now() - startedAt`; it does not restart the clock from zero.

No progression logic, Cloudflare Worker or D1 schema has changed.

- App version: `v34`
- Service-worker cache: `threshold-v34`
