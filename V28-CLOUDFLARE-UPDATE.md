# Threshold v28: Cloudflare dashboard update

Apply these in this order.

## 1. Add the new D1 columns

Open:

**Cloudflare → Storage & Databases → D1 → threshold-analytics → Console**

Paste and run the contents of:

```text
cloudflare-worker/migration-v28.sql
```

Run it only once. Existing rows are preserved; the new columns will be blank for
older events.

## 2. Replace the Worker code

Open:

**Cloudflare → Workers & Pages → threshold-events → Edit code**

Replace the current code with:

```text
cloudflare-worker/src/index.js
```

Select **Save and deploy**.

Your existing D1 binding (`DB`) and `ALLOWED_ORIGINS` variable remain unchanged.

The updated origin comparison is case-insensitive, so a future capitalisation
difference will not cause the same CORS failure.

## 3. Deploy Threshold v28 to GitHub Pages

Upload the contents of the v28 folder to the repository, preserving the folder
structure. The configured endpoint is already:

```text
https://threshold-events.jasonrprickett.workers.dev/events
```

The service-worker cache is `threshold-v28`.

## 4. Test

Run a short session and end it early, then save it.

In D1, run:

```sql
SELECT
  id,
  event_name,
  dog_name,
  target_seconds,
  stopped,
  session_type,
  device_type,
  browser,
  received_at
FROM usage_events
ORDER BY id DESC
LIMIT 20;
```

For saved stopped sessions only:

```sql
SELECT *
FROM usage_events
WHERE event_name = 'session_saved'
  AND stopped = 1
ORDER BY id DESC;
```

`stopped` is stored as `1` for yes, `0` for no, and blank on `session_started`
because the outcome is not known yet.
