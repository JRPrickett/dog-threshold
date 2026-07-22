# Threshold v22 — phase-one refactor

This version keeps the existing GitHub Pages/PWA architecture and user-facing
behaviour, while separating the source into maintainable files.

## Active modules

- `js/storage.js` — schema, migration, normalisation and browser persistence
- `js/progression.js` — progression decisions and warm-up planning
- `js/timer.js` — duration formatting
- `js/ui.js` — shared DOM and escaping helpers
- `js/app.js` — current screen orchestration and remaining feature code
- `css/app.css` — complete application stylesheet

`state.js`, `sessions.js`, `charts.js` and `settings.js` establish the next module
boundaries. Their larger DOM-coupled implementations remain in `app.js` during this
first phase to avoid a risky full rewrite.

## Run locally

ES modules should be served over HTTP rather than opened directly from the filesystem.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Run tests

No third-party packages are required:

```bash
npm test
```

## Deploy to GitHub Pages

Deploy the contents of this directory. Copy the existing production icon files into
`assets/icons/` before deployment.

The service-worker cache is `threshold-v22`.

## Recommended next extraction

1. Session lifecycle and review flow
2. Timer and active-run recovery
3. Charts
4. Settings controllers
5. DOM rendering components


## Phase two

Session review calculations, active-run persistence, numeric settings controllers and
pure chart-data preparation are now separated from `app.js`. Visual chart templates
remain in `app.js` until the screen-rendering extraction.


## v24 dashboard and engagement layer

`js/dashboard.js` now owns pure calculations for dashboard cards, recent-progress
timeline data and meaningful achievement detection. These features do not alter the
progression algorithm.


## v25 target explanations

`js/target-reason.js` converts progression outcomes into concise user-facing wording, with technical details available through an optional disclosure.


## v26 anonymous analytics

`js/analytics.js` provides privacy-limited page analytics setup and an offline
queue for `session_started` and `session_saved`. The event receiver is included
under `cloudflare-worker/` and stores the aggregate events in Cloudflare D1.
See `ANALYTICS-SETUP.md`.


## v27 plain-language update

Internal planning terminology is no longer shown in the interface. The dashboard
uses **Longest calm absence**, and optional target details contain only directly
recognisable session information. Cloudflare Web Analytics is enabled using the
configured token.


## v28 save fix and usage metadata

The session editor save failure is fixed. Saved-session analytics now record
stopped status plus limited session and device metadata. Because dog name is now
included, these events should be described as limited usage analytics rather
than strictly anonymous analytics.


## v29 startup fix

The initial render no longer stops on an undefined storage-status variable.
First-run setup opens normally, and the reset/setup-skip paths have also been
corrected.


## v30 saved-event ordering

`session_saved` is now queued immediately after the local save and before the
interface redraw, so a rendering problem cannot suppress the usage event.


## v31 notification routing

At the planned return time, Threshold replaces the browser-owned Media Session
card with a service-worker notification whose click handler explicitly focuses
or opens Threshold. The countdown media controls remain available before the
target is reached.


## v32 iOS app-open analytics

Cloudflare's official beacon is now embedded directly in `index.html`.
Foreground/resume activity is counted separately in D1 as `app_open_events`,
including whether the app was running in standalone Home Screen mode.


## v33 media-card fix

The final chime is generated through Web Audio and the HTML media element is
fully destroyed at target time. This prevents the system Now Playing card from
being recreated after the countdown ends.


## v34 interruption-proof sessions

Active sessions are checkpointed during the run and whenever the app is hidden.
A reload or PWA restart reconstructs the run from its original start timestamp,
so switching apps cannot silently reset or discard the timer.


## v35 simpler scenarios and earlier notification

Fresh installations start with a single **Separation training** scenario.
Unused untouched legacy defaults are removed without deleting history or custom
scenarios. The return notification now appears with the five-second warning.


## v36 time-of-day context

Morning, Afternoon and Evening are available as optional session tags. Guidance
near the scenario controls explains that tags add context to one session, while
separate scenarios maintain independent target progression.
