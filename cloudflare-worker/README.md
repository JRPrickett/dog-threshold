# Threshold aggregate event Worker

This Worker accepts three event names:

- `app_open`
- `session_started`
- `session_saved`

It stores aggregate product telemetry only:

- Event name (for session events)
- Threshold app version
- Event timestamp
- Server receipt timestamp
- Basic device/browser/platform metadata

It does **not** receive dog names, scenario names, notes, ratings, durations, outcomes,
training records, cookies or a Threshold user identifier.

Future account sync must use a separate authenticated API and data model.

## Setup

1. Install dependencies:

   ```bash
   npm install
   npx wrangler login
   ```

2. Create the D1 database:

   ```bash
   npm run db:create
   ```

3. Copy the returned `database_id` into `wrangler.jsonc`.

4. Set `ALLOWED_ORIGINS` in `wrangler.jsonc` to the real app origin plus local
   development origins.

5. Create the schema:

   ```bash
   npm run db:schema
   ```

6. Deploy the Worker:

   ```bash
   npm run deploy
   ```

7. Put the resulting `/events` URL in `js/analytics-config.js`.

## Existing databases

The v38 Worker intentionally stopped writing dog/session-detail fields that existed in
older schemas. Those nullable columns can remain in an existing D1 database; new
databases should use the current `schema.sql`.

## Useful counts

Last seven days:

```sql
SELECT event_name, COUNT(*) AS total
FROM usage_events
WHERE received_at >= datetime('now', '-7 days')
GROUP BY event_name
ORDER BY event_name;
```

A session can be started without being saved, so start/save counts are not expected to
match exactly.
