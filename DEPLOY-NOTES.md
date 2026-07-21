# Threshold v21 deployment

Replace `index.html` and `sw.js` together.

## 1. Next-target explanation

The home screen now shows a dedicated explanation directly beneath the target:

- Why that target was selected
- The previous planned and actual duration
- Whether the previous session was completed or ended early
- The previous rating

When the app deliberately varies a target, it now distinguishes the displayed
session target from the underlying working baseline.

## 2. Review before saving

Selecting Success, OK or Not good no longer saves immediately. A review screen shows:

- Planned target
- Actual absence
- Completed or ended early
- Selected rating
- Exact next target
- The rule used to calculate it

The user can save or return to change the rating, context tags or notes.

## 3. Longer undo window

After saving, the confirmation includes the next target and offers Undo for 12 seconds.
Milestone pop-ups are delayed until the undo window has passed so they do not obscure it.

The service-worker cache is `threshold-v21`.
