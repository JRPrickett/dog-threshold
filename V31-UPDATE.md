# Updating to Threshold v31

## What changed

Android/Chrome owns the tap destination of a Media Session card. On the reported
phone, the completed-timer media card incorrectly opened Chrome Remote Desktop.

Threshold v31 uses this flow:

1. The Media Session card and silent keeper audio remain active during the countdown.
2. At the target time, Threshold stops and clears the media session.
3. The chime plays.
4. Threshold creates a normal web notification titled **Time to head back**.
5. Tapping that notification focuses an existing Threshold window or opens the
   installed Threshold app.

The Media Session artwork paths are also corrected, and the manifest now has a
stable app ID.

## Notification permission

On Android, the installed app will ask for notification permission after setup
or when the first timed session starts. This request happens only while the user
is interacting with the app.

If permission is declined, the chime still plays, but there will be no persistent
**Time to head back** notification.

## Deployment

1. Upload the complete v31 package to GitHub Pages.
2. No D1 migration is required.
3. No Cloudflare Worker update is required.
4. Close all Threshold tabs and the installed app.
5. Open the GitHub Pages site once, close it, then reopen the installed app.

Service-worker cache: `threshold-v31`.
