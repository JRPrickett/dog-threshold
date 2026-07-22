# Threshold v32: iOS app-open analytics

Cloudflare Web Analytics measures actual page loads. An installed iOS PWA can
return from suspension without loading the HTML document again, so reopening the
Home Screen app does not necessarily create another Cloudflare visit.

Threshold v32 therefore uses two complementary measures:

- Cloudflare's exact static Web Analytics snippet for real page loads
- D1 `app_open_events` for initial loads and foreground/resume activity

## 1. Add the D1 table

Open:

**Cloudflare → Storage & Databases → D1 → threshold-analytics → Console**

Run the contents of:

```text
cloudflare-worker/migration-v32.sql
```

This only creates a new table and indexes; it does not modify existing session
events.

## 2. Replace the Worker code

Open:

**Cloudflare → Workers & Pages → threshold-events → Edit code**

Replace the Worker with:

```text
cloudflare-worker/src/index.js
```

Select **Save and deploy**.

Your existing `DB` binding and `ALLOWED_ORIGINS` value stay unchanged.

## 3. Upload Threshold v32

Upload the full v32 folder contents to GitHub Pages.

The service-worker cache is:

```text
threshold-v32
```

Close all Threshold tabs and the installed PWA, open the GitHub Pages site once,
then reopen the installed app.

## 4. Check iOS opens

Open and close the iOS Home Screen app, leaving it in the background for more
than five seconds before reopening it.

Run:

```sql
SELECT
  id,
  app_version,
  dog_name,
  operating_system,
  device_type,
  browser,
  display_mode,
  occurred_at,
  received_at
FROM app_open_events
ORDER BY id DESC
LIMIT 30;
```

A Home Screen launch or resume should show:

```text
operating_system = iOS
display_mode = standalone
browser = Safari
```

Safari-tab use should normally show:

```text
operating_system = iOS
display_mode = browser
```

## Daily open counts

```sql
SELECT
  date(received_at) AS day,
  operating_system,
  display_mode,
  COUNT(*) AS opens
FROM app_open_events
GROUP BY date(received_at), operating_system, display_mode
ORDER BY day DESC, operating_system, display_mode;
```
