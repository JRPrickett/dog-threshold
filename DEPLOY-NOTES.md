# Threshold v24 deployment

## User-facing changes

### Dashboard

The home screen now includes:

- Last timed session
- Sessions and Success ratings from the last seven days
- Current working baseline
- Completed calm results across the five most recent sessions

### Recent-progress timeline

The latest five timed sessions are shown in order with:

- Outcome
- Completed or ended-early status
- Planned and actual duration
- The next planned target and its explanation

### Meaningful achievements

Threshold now recognises newly crossed training markers:

- First completed calm absence
- Five completed calm absences
- Five calm sessions in a row
- One cumulative hour of completed calm absences

These appear only when a newly saved session crosses the threshold. They are not
streaks, points or daily-pressure mechanics. Undoing the session cancels the
celebration.

## Technical

Dashboard statistics, timeline preparation and achievement detection live in
`js/dashboard.js` and have dedicated tests.

Service-worker cache: `threshold-v24`.
