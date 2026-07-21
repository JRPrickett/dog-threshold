# Deployment notes

1. Download the updated package.
2. Replace `index.html`, `sw.js`, `manifest.webmanifest` and optionally `README.md` in your GitHub repository root.
3. Keep your existing PNG icon files.
4. Commit and push.
5. Open the live page once online. Installed copies should update because the cache has been bumped to `threshold-v10`.
6. Test setup, one short dummy session, edit, undo, CSV export, backup and restore before sending the link to a friend.


## v10 behaviour changes

- Door is a Bore no longer asks for a rating or note after every cue. Each cue is marked **Step done**, followed by one overall session rating and optional notes at the end.
- Following or waiting by the door is explicitly treated as compatible with a relaxed result when the dog can settle.
- Timed absences now play a softer early warning: 3 seconds before targets of 8–14 seconds, and 5 seconds before targets of 15 seconds or longer. The normal target chime still plays at zero.
- Mobile browser use is strongly gated by an installation screen. Browsers cannot force installation, so users may deliberately continue in the browser; the gate returns after seven days and the install banner remains visible until standalone mode is detected.


### Lock-screen countdown test

- Timed absences now publish Media Session position state, allowing supported phones to draw a system-managed moving progress bar and elapsed/remaining time.
- The title metadata also refreshes once per second as a fallback. iOS still controls how frequently Control Centre visibly redraws it.
- Test both a short warm-up and a main absence with the app open from the Home Screen, then switch to the camera app and inspect the Lock Screen and Control Centre.
