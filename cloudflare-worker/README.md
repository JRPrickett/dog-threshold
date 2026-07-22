# Threshold anonymous event Worker

This Worker accepts only two event names:

- `session_started`
- `session_saved`

It stores:

- Event name
- Threshold app version
- Event timestamp
- Server receipt timestamp

It does **not** receive or store dog names, scenario names, notes, durations,
ratings, training records, cookies or a device/user identifier.

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

4. In `wrangler.jsonc`, replace `https://YOUR-USERNAME.github.io` with the
   origin that hosts Threshold. Use the origin only, with no repository path.

   Example:

   ```text
   https://jasonexample.github.io
   ```

5. Create the table:

   ```bash
   npm run db:schema
   ```

6. Deploy the Worker:

   ```bash
   npm run deploy
   ```

7. Copy the resulting Worker URL into the app's `js/analytics-config.js`:

   ```js
   eventEndpoint:"https://threshold-events.YOUR-SUBDOMAIN.workers.dev/events"
   ```

## View counts

Open **Cloudflare → D1 → threshold-analytics → Console**.

Counts for the last seven days:

```sql
SELECT
  event_name,
  COUNT(*) AS total
FROM usage_events
WHERE received_at >= datetime('now', '-7 days')
GROUP BY event_name
ORDER BY event_name;
```

Daily counts for the last 30 days:

```sql
SELECT
  date(received_at) AS day,
  event_name,
  COUNT(*) AS total
FROM usage_events
WHERE received_at >= datetime('now', '-30 days')
GROUP BY date(received_at), event_name
ORDER BY day DESC, event_name;
```

A session can be started without being saved, so the two counts are not expected
to match exactly.
