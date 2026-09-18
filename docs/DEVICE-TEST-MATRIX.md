# Production device and interruption test matrix

Last updated: 18 September 2026

Automated browser tests are necessary but are not evidence that an installed PWA behaves
identically on a real phone. This document is the manual release gate for live-session
reliability.

## Automated coverage

CI currently runs the core journey suite against:

- Chromium using a Pixel 7 device profile
- WebKit using an iPhone 15 device profile

Automated journeys include:

- onboarding -> session -> review -> history;
- reload during a running session and timestamp recovery;
- offline session completion;
- backup restore;
- departure-cue progression;
- legacy multi-scenario migration.

Playwright WebKit is **not** a substitute for Mobile Safari or an installed iOS Home Screen app.

## Supported product promise

The timer is based on original timestamps, not interval ticks. If rendering or browser execution
pauses, the displayed elapsed time should correct itself when execution resumes.

Audio, Media Session controls, wake lock and local notifications are progressive enhancement.
The training record and timer state must remain correct even when all alert features fail.

## iPhone / iPad real-device gate

Test in current Safari and as an installed Home Screen web app.

### Installation and startup

- [ ] Open production/preview HTTPS URL in Safari.
- [ ] Add to Home Screen.
- [ ] Launch from the Home Screen icon.
- [ ] Confirm standalone layout and safe-area padding.
- [ ] Close and relaunch; local history remains present.

### Live timer

- [ ] Start a 30-second main departure.
- [ ] Confirm countdown begins from the correct timestamp.
- [x] Lock the phone, unlock, and confirm the active session survives with correct timer state.
- [x] Switch away to another app and return; the active session survives and resumes from timestamp-derived elapsed time.
- [ ] Switch Safari/PWA out of the foreground after the 5-second warning boundary and return.
- [ ] Leave the app backgrounded beyond the target, return, and confirm it shows target exceeded rather than restarting.

### Audio / Media Session

- [ ] Start the departure directly from a user tap and confirm no browser autoplay error.
- [ ] Verify target chime while app remains foregrounded.
- [ ] Verify whether warning/target chimes continue while another app is foregrounded.
- [ ] Verify lock-screen / Control Centre metadata when available.
- [ ] Confirm media play/pause controls cannot accidentally stop the training clock.
- [ ] Confirm returning to the app does not create duplicate chimes.

Record the actual result; do not turn an inconsistent OS behaviour into a product guarantee.

### Notifications

On iOS/iPadOS, Web Push/system notification support is tied to Home Screen web apps and
permission must follow user interaction.

- [ ] Tap Enable system alerts from an explicit user action.
- [ ] Confirm permission state is accurately reflected.
- [ ] Verify a local in-session notification while the PWA remains active enough to execute.
- [ ] Confirm denied permission does not affect the timer.
- [ ] Confirm no repeated permission prompt.
- [ ] Tap a notification and record platform behaviour.

Server-backed Web Push is a later feature and is not required for this local-first release.

### Recovery

- [x] Close the PWA during an active session.
- [x] Reopen it.
- [x] Confirm the active session survives/reconstructs rather than restarting.
- [ ] Complete/review/save the recovered session.
- [ ] Confirm exactly one history record exists.

### Offline

- [ ] Launch once online.
- [ ] Enable Airplane Mode.
- [ ] Relaunch the installed app.
- [ ] Start, complete and save a session.
- [ ] Restore connectivity.
- [ ] Confirm no local data was lost.

### PWA update safety

- [ ] Deploy a new preview build while an older build is installed.
- [ ] Start a live session on the old build.
- [ ] Confirm update does not force a reload.
- [ ] Complete/save the session.
- [ ] Accept Update now outside live mode.
- [ ] Confirm history remains intact.

### iPhone preview evidence — 18 September 2026

Tested against the Cloudflare `settledsolo-web-preview` build.

User-reported real-device results:

- active session survives switching to another app and returning;
- active session survives closing/reopening the PWA;
- active session survives lock/unlock;
- session chime is audible on the tested device.

This clears the core timer/recovery resilience concern that automated WebKit could not prove.

Still to verify on iOS before public release:

- Airplane Mode relaunch and full offline save;
- notification permission/denial behaviour;
- PWA update while a live session is running;
- duplicate-chime behaviour across repeated/backgrounded sessions;
- Media Session/Control Centre presentation where available.

## Android real-device gate

Test current Chrome both in-browser and installed PWA.

Repeat:

- [ ] installation/standalone shell;
- [ ] camera-app switch during timer;
- [ ] screen lock/unlock;
- [ ] target chime foreground/background;
- [ ] notification permission;
- [ ] lock-screen Media Session presentation;
- [ ] force-close/relaunch recovery;
- [ ] offline relaunch/session;
- [ ] safe prompted PWA update.

## Desktop sanity gate

At least one current Chromium browser and Safari where available:

- [ ] first run;
- [ ] session;
- [ ] history;
- [ ] backup export;
- [ ] backup restore;
- [ ] legacy restore;
- [ ] scenario switching.

## Release evidence

For each public release, record:

- device model;
- OS version;
- browser/PWA mode;
- release commit SHA;
- date;
- pass/fail for each relevant section;
- any OS/browser limitation discovered.

A release may ship with an alert limitation if the timer/recovery/data path is still reliable and
the limitation is clearly communicated. It must not ship with a known path that can silently lose
training history or restart an active timer.
