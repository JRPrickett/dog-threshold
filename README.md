# Threshold

A privacy-first separation anxiety training log. It suggests a conservative absence for today, runs varied warm-ups, and keeps a local record of how each scenario went.

## What changed in v8

- First-run setup explaining safe starting durations and camera use
- Recovery prompt after a refresh, crash or interrupted session
- Edit, delete and manually add past sessions
- Undo notices after saves and deletions
- CSV export for a trainer or spreadsheet
- Stronger backup validation and automatic migration of existing v1/v2 logs
- No third-party fonts or analytics; training data remains on the device
- Install reminders return after 14 days rather than disappearing forever
- Mobile session-table scrolling and improved keyboard focus
- Service-worker cache cleanup is limited to Threshold caches


## What changed in v10

- Timed absences publish Media Session position state for a system-managed Lock Screen or Control Centre progress display where supported.
- Notification metadata refreshes once per second as a fallback instead of every five seconds.
- The progress state is cleared after each rep so it does not remain attached to settle breaks or completed sessions.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app — markup, styles and logic |
| `manifest.webmanifest` | Installation metadata |
| `sw.js` | Offline service worker |
| `USER-GUIDE.md` | Friend-facing instructions |

Keep your existing icon files in the repository: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, and any favicon you use.

## Deploying the update

Replace `index.html`, `sw.js` and `manifest.webmanifest` in the repository root. Commit and push them to the branch used by GitHub Pages. The service worker is already bumped to `threshold-v10`.

Existing data stored under `threshold.v2` is normalised in place and receives stable session IDs. A backup before deployment is still sensible.

## Privacy

There is no server, account, analytics or external font request. Training data is saved in the browser's local storage. A downloaded JSON backup is the only portable copy if browsing data is cleared or the device is changed.

## Installation

- **iPhone / iPad:** open in Safari, tap Share, then **Add to Home Screen**.
- **Android:** use the Install button shown by Chrome or the app.
- **Desktop:** Chrome and Edge usually show an install icon in the address bar.

## Development notes

All paths remain relative (`./`), so the app works in a GitHub Pages project subfolder. When changing any cached file, bump the cache version in `sw.js`.
