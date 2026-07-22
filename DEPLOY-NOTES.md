# Threshold v33 deployment

## Media-card teardown

The final chime no longer uses an HTML `<audio>` element. It is generated with
Web Audio oscillators, which prevents the chime from creating a fresh browser
media notification after the countdown media session has been stopped.

At target time Threshold now:

1. Destroys the keeper audio element
2. Clears Media Session metadata, position and action handlers
3. Plays the chime through Web Audio
4. Shows the normal Threshold notification when supported/permitted
5. Repeats the media-session cleanup after 1.2 seconds

This removes the system media card rather than trying to control its main tap,
which is not exposed to web applications.

No analytics, D1 or Cloudflare Worker changes are required.

- App version: `v33`
- Service-worker cache: `threshold-v33`
