# Updating to Threshold v30

1. Upload the complete contents of the v30 folder to GitHub Pages.
2. No D1 migration is needed.
3. No Cloudflare Worker change is needed if the v28 Worker is deployed.
4. Close all Threshold tabs and the installed PWA.
5. Open the GitHub Pages site once in the browser.
6. Close it and reopen the installed app.

After saving a stopped test session, query D1:

```sql
SELECT
  id,
  event_name,
  app_version,
  dog_name,
  target_seconds,
  stopped,
  session_type,
  device_type,
  browser,
  occurred_at,
  received_at
FROM usage_events
ORDER BY id DESC
LIMIT 20;
```

Expected pair:

```text
session_started  stopped = NULL
session_saved    stopped = 1
```
