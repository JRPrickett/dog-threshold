# Threshold v34: interruption-proof sessions

## What was wrong

Threshold already stored an `activeRun`, but the function used to rebuild that
run after an iOS reload or process restart was missing. This meant a session
could be safely written to local storage yet still fail to return to its live
timer screen after interruption.

## What v34 changes

- Implements full reconstruction of a saved active run
- Preserves the original `startedAt` timestamp
- Automatically restores a recent active session at startup
- Recalculates elapsed time from the original timestamp
- Checkpoints the active run every five seconds
- Saves immediately on `visibilitychange`, `pagehide` and iOS/WebKit `freeze`
- Restarts the timer display and background audio when Threshold returns
- Attempts to recover the silent keeper audio after a system media pause/stop
- Saves whether the five-second and final chimes have already fired
- Never ends a session because the app was hidden, suspended or switched away

Only explicit Threshold actions can end or discard the session:

- **I'm back**
- **End session early**
- Completing/saving the result
- **Discard unfinished session**

## Example

If the Control Centre media panel opens another PWA:

1. Threshold checkpoints the active run.
2. The original departure timestamp remains stored.
3. Opening Threshold again restores the same repetition.
4. Elapsed time is calculated from the original timestamp.
5. The user returns to the live session screen instead of losing the run.

## Deployment

1. Upload the full v34 package to GitHub Pages.
2. No D1 migration is required.
3. No Cloudflare Worker update is required.
4. Close all Threshold tabs and the installed app.
5. Open the GitHub Pages site once, close it, then reopen the installed app.

Service-worker cache: `threshold-v34`.
