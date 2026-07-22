# Threshold v36

## Time-of-day tags

The session context tags now include:

- Morning
- Afternoon
- Evening
- Not walked yet
- After a walk
- Before food
- After food
- Radio or TV on

The time-of-day choices are optional session tags. They do not create separate
target progression histories.

## Scenario guidance

A short explanation now appears beside the scenario controls:

> Dogs may cope differently at different times of day or in different
> situations. Use session tags for quick context, or add another scenario when
> that situation should have its own target progression.

This helps distinguish:

- **Tags** — quick context attached to one session
- **Scenarios** — separate histories and target progression

## Deployment

1. Upload the complete v36 package to GitHub Pages.
2. No D1 migration is required.
3. No Cloudflare Worker update is required.
4. Close all Threshold tabs and the installed app.
5. Open the GitHub Pages site once, close it, then reopen the installed app.

Service-worker cache: `threshold-v36`.
