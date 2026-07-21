# Threshold

A separation anxiety training log. Works out how long to leave your dog today,
runs the session with varied warm-ups, and keeps a record of how it went.

No server, no accounts, no database. Everything is stored in the browser on the
person's own device, and nothing is ever sent anywhere.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app — markup, styles and logic |
| `manifest.webmanifest` | Lets browsers install it to a home screen |
| `sw.js` | Service worker: offline use, and required for Android install |
| `icon-192.png`, `icon-512.png` | App icons |
| `apple-touch-icon.png` | iOS home-screen icon |
| `favicon-32.png` | Browser tab icon |

All paths are relative (`./`), so it works from a subfolder such as
`username.github.io/dog-threshold/` without any changes.

## Deploying to GitHub Pages

1. Create a public repository.
2. Upload every file in this folder to the root of it.
3. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
4. Wait a minute, then open `https://username.github.io/reponame/`.

HTTPS is required for installing and for the service worker. GitHub Pages,
Netlify and Cloudflare Pages all provide it automatically.

## Installing it

- **iPhone / iPad:** open in Safari, tap Share, then *Add to Home Screen*.
  This matters — Safari deletes stored data for websites that haven't been
  opened in seven days, and home-screen apps are exempt from that.
- **Android:** Chrome shows an Install button in the app itself.
- **Desktop:** Chrome and Edge show an install icon in the address bar.

## Updating it after a change

Edit `index.html`, then **bump the `CACHE` version in `sw.js`** (for example
`threshold-v1` to `threshold-v2`) and upload both. Without that bump, people who
already installed it may keep seeing the old version from their cache.

## While you're in another app

You'll usually be watching the dog on a camera app, not this. Live Activities
and Picture-in-Picture aren't available to web apps on iOS, so instead:

- A silent audio loop starts when you begin a step, which keeps the timer
  running while the app is in the background.
- A chime sounds when the absence is up.
- The current step appears on your lock screen and in Control Centre via the
  Media Session API — the same place music track names show.
- The screen is kept awake while a session is running.

Turn it off in Settings under *Sound while you're away*. Note that muting also
gives up the background timer, since the silent loop is what keeps it alive.

## Data

Stored under the key `threshold.v2` in the browser's localStorage, roughly 2KB.
Settings has a *Download a backup* button producing a dated `.json`, and a
*Restore from a file* button to load one back — that file is the only copy that
survives someone clearing their browsing data or switching devices.
