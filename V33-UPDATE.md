# Threshold v33: system media-card fix

## Why Chrome Remote Desktop appeared

Threshold used one HTML audio element to keep the background countdown active
and a second HTML audio element for the final chime. At the target time the
countdown element was stopped, but playing the chime could immediately create a
new system **Now Playing** card.

The main tap action on that card belongs to iOS/Android and the browser. A web
page cannot assign its own URL to that tap. On the reported phone the operating
system was routing it to Chrome Remote Desktop.

## What v33 changes

- The final and early-warning chimes now use the Web Audio API, not an HTML
  audio element.
- The background keeper audio element is completely destroyed when the target
  is reached, rather than merely paused.
- Media metadata, progress state and every registered media action handler are
  cleared.
- Threshold repeats the cleanup after 1.2 seconds to remove a briefly retained
  system card.
- Notification permission detection is no longer Android-only.

The expected result is that the **Now Playing** card disappears at the target
instead of being recreated by the chime. Where a proper Threshold notification
is supported and permission has been granted, that notification remains the
route back to the app.

## Deployment

1. Upload the complete v33 package to GitHub Pages.
2. No D1 migration is required.
3. No Cloudflare Worker update is required.
4. Close all Threshold tabs and the installed app.
5. Open the GitHub Pages site once, close it, then reopen the installed app.

Service-worker cache: `threshold-v33`.
