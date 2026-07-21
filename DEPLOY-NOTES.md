# Deployment notes

1. Download the updated package.
2. Replace `index.html`, `sw.js`, `manifest.webmanifest` and optionally the documentation files in your GitHub repository root.
3. Keep your existing PNG icon files.
4. Commit and push.
5. Open the live page once while online. Installed copies should update because the cache is now `threshold-v14`.
6. Completely close and reopen the Home Screen app before testing.

## v12 certificate refinement

- Milestone certificates now use a warm ivory paper design with a restrained double border.
- The layout is cleaner and more editorial: small Threshold branding, **MILESTONE ACHIEVED**, the dog’s name, a prominent duration, date and scenario.
- Subtle amber, green and ochre confetti marks sit in the corners without overwhelming the certificate.
- The previous tagline has been replaced by **A new threshold reached.**
- Long dog names, durations and scenario names automatically scale to remain within the certificate.

## Previous v11 behaviour changes

### Ending a session early

- **Stop the session** is now labelled **End session early**.
- Ending during a settle break no longer automatically records a **Not good** result.
- The user chooses an optional reason and then rates how the dog coped up to that point.
- Suggested reasons include dog concern, an external interruption, needing a break, or the plan feeling too difficult.
- The reason appears in the session log, session editor and CSV export.
- A stopped session rated relaxed is saved honestly but does not increase the next target. A stopped session rated **Not good** still feeds into the cautious step-back logic.
- Door is a Bore uses the same end-early and final-rating flow.

### Milestone celebrations

- Every earned milestone is now tappable.
- Tapping it opens a certificate-style celebration image containing the dog name, milestone, date and scenario.
- **Share milestone** uses the device share sheet and includes the PNG certificate where the browser supports file sharing.
- **Save certificate** downloads the PNG for sharing later.
- Newly earned milestones open the celebration automatically after the session is saved.

## Suggested checks

- End a timed session during a settle break, choose an interruption reason and rate it relaxed.
- Confirm the stopped session is logged and the next target does not increase.
- End a Door is a Bore session early and confirm it reaches one final rating screen.
- Complete or add a successful 30-second absence, then tap the 30-second milestone.
- Test both **Share milestone** and **Save certificate** on the phone.

The v10 Media Session countdown experiment is unchanged. iOS still controls whether and how often Control Centre redraws it.

## Version 13 — shorter warm-ups

Warm-up absences are now capped at 90 seconds. For main targets longer than three minutes, the warm-up plan is drawn from a fixed short-duration range rather than remaining a percentage of the full target. This prevents long targets from producing multi-minute warm-ups.


## Version 14 — Door is a Bore transition

- Door is a Bore now has a visible **Switch to timed departures** button on the main session screen.
- The switch remains available even when the daily session ceiling has been reached.
- Settings now asks **Ready for timed departures?** while Door is a Bore is active.
- Outside Door is a Bore, the prompt reads **Not ready for timed departures yet?**
- Switching preserves the scenario's Door is a Bore history and uses a cautious three-second starting point when there is no previous timed history.
