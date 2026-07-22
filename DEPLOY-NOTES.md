# Threshold v32 deployment

## iOS Web Analytics behaviour

Cloudflare Web Analytics is now installed with its exact static `type="module"`
snippet in `index.html`, rather than being created dynamically by app code.

Installed iOS PWAs may resume an existing document without another page load.
Because a Cloudflare page view is not guaranteed in that case, Threshold now
records `app_open` foreground events in a separate D1 table.

## New D1 table

Run `cloudflare-worker/migration-v32.sql` once to create:

```text
app_open_events
```

Fields include:

- App version
- Dog name
- Broad operating system
- Device type
- Browser family
- `standalone` or `browser`
- Event and receipt timestamps

## Worker

Replace the deployed Worker with the v32 Worker code so it accepts `app_open`
and routes it to the new table.

## Version

- App version: `v32`
- Service-worker cache: `threshold-v32`
- Existing session-event table and data remain unchanged
