# Threshold v28 deployment

## Save-session fix

The session editor used `validOutcome(...)` without importing it. That produced
a runtime error when **Save session** was pressed. The missing import is fixed.

## Richer usage events

`session_started` and `session_saved` can now include:

- Dog name entered in Threshold
- Planned target time
- Whether the saved session was stopped early
- Session type: timed absence or door exercise
- Broad device type: mobile, tablet or desktop
- Browser family

Threshold does not send the full user-agent string or create a device/user ID.

Scenario names, notes, ratings, actual duration and full training history are
not sent.

## Existing database

Run `cloudflare-worker/migration-v28.sql` once, then replace the deployed Worker
code with `cloudflare-worker/src/index.js`.

## Configuration

- App version: `v28`
- Web Analytics token: configured
- Event endpoint: configured
- Service-worker cache: `threshold-v28`
