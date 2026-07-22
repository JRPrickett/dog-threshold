# Threshold v31 deployment

## Android media-card routing workaround

The completed timer no longer leaves **Time to head back** in Chrome's Media
Session card. That card's main tap target is controlled by Android/Chrome and
was opening Chrome Remote Desktop on the reported device.

At target time, Threshold now:

- Stops and clears the browser media session
- Plays the existing chime
- Shows a regular Threshold notification when permission is granted
- Handles the notification click in `sw.js`
- Focuses an open Threshold client or opens the PWA URL

The lock-screen/media countdown still operates before the target is reached.

## Additional corrections

- Media Session artwork now points to `assets/icons/`
- The web manifest has a stable `id`
- App version: `v31`
- Service-worker cache: `threshold-v31`

No Cloudflare or D1 changes are required.
