# Threshold analytics setup

Threshold v26 includes two independent analytics features. Both are disabled
until you add your Cloudflare account values.

## 1. Cloudflare Web Analytics

This confirms that Threshold is being opened and revisited.

1. Sign in to Cloudflare.
2. Open **Web Analytics**.
3. Select **Add a site**.
4. Enter the GitHub Pages hostname, for example:

   ```text
   YOUR-USERNAME.github.io
   ```

5. Open **Manage site** and copy the JavaScript snippet.
6. From that snippet, copy only the token value.
7. Open `js/analytics-config.js` and paste it here:

   ```js
   cloudflareWebAnalyticsToken:"YOUR_TOKEN"
   ```

Threshold loads Cloudflare's official Web Analytics beacon only when this value
is present.

## 2. Anonymous session events

The `cloudflare-worker/` folder contains a Worker and D1 schema that record only:

- `session_started`
- `session_saved`
- App version
- Event and receipt timestamps

Follow `cloudflare-worker/README.md` to create and deploy it. Then paste its
`/events` URL into:

```js
eventEndpoint:"https://threshold-events.YOUR-SUBDOMAIN.workers.dev/events"
```

## Offline behaviour

When the Worker endpoint is configured but the phone is offline, events are held
in a small local queue. Threshold sends them when it next has a connection and
removes them from the queue after Cloudflare accepts them.

The queue holds no training details or user/device identifier.

## Privacy statement

The in-app guide now tells users that anonymous visits and session start/save
counts may be collected, and explicitly lists the training information that is
not sent.
