# SettledSolo handover

**Last updated:** 19 September 2026, 16:21 BST  
**Repository:** `JRPrickett/settledsolo`  
**Current main before PR #26:** `b298fa10b52c1b58fabfe62f58163ecbdcfe8458`

This is the current-state handover for another agent or contributor picking up SettledSolo. Read `AGENTS.md` first for repository rules.

## Executive status

SettledSolo is now well beyond the original prototype stage. The active product is the modern React/TypeScript PWA under `app-v2/`, served through the Cloudflare Worker in `worker/`.

**Phase 1 of the current production-readiness roadmap — guided onboarding — is complete and merged.**

PRs **#21–#25** are merged. **PR #26 is the current open release-hardening PR** at this handover update. The last merged functional change, PR #24, completed CI successfully; PR #25 added the agent rules and this living handover.

The project is now in **release hardening / real-device gates**. The first hardening pass is PR #26, which adds duplicate-save protection, recovery/notification regressions, a production-service-worker offline relaunch gate and preview-deployment cleanup. After those automated gates are green, finish the genuinely OS-dependent checks on real iOS/Android devices before moving to the remaining behaviour-quality items and then D1/accounts/sync.

Do not jump straight into cloud sync in a way that destabilises the currently reliable local-first session path.

## What changed most recently

### PR #26 — Release hardening gates — open at this handover update

This starts the post-onboarding release-hardening phase.

Changes on the PR branch:

- prevents duplicate history records from a fast/double tap on **Save session** by using an in-flight save guard;
- adds a recovered-review browser journey that reloads before save, deliberately double-taps save and proves one history record remains after a second reload;
- adds notification-denial coverage proving denial does not block training and is not immediately re-prompted;
- adds a separate production-PWA Playwright gate that builds the real service worker, relaunches offline, saves offline and verifies the data after connectivity returns;
- runs that production-PWA gate against Chromium/Pixel 7 and WebKit/iPhone 15 profiles;
- changes preview deployment to follow `main` rather than the obsolete `modern-app-shell-engine` branch.

The production-service-worker test does **not** clear the real installed-iPhone Airplane Mode gate; that remains manual evidence.


### PR #24 — Prevent iOS form focus zoom — merged

The first-run dog-name field was inheriting a 12px label size, triggering iOS Safari's focus zoom. Other controls also had sub-16px sizes.

Now:

- text/number inputs, selects and textareas use at least 16px;
- checkbox/radio controls are excluded;
- pinch-to-zoom remains enabled;
- mobile browser regression coverage fails if visible eligible controls fall below 16px.

This is an app-wide invariant. Preserve it.

### PR #23 — Danger-zone reset and restart onboarding — merged

`More` now contains **Danger zone → Reset SettledSolo**.

The reset:

- requires typing `RESET`;
- offers a backup first;
- clears dog/profile setup, training tracks, timed-session history, departure-cue progress and onboarding state;
- clears an active persisted session;
- clears legacy Threshold migration seed data so old data cannot reappear on reload/fallback;
- returns immediately to first-run onboarding;
- is covered by a reset + full reload browser regression journey.

This was added specifically so an existing user can rerun the new onboarding from scratch.

### PR #22 — Recover cached homepage hero failures — merged

Added recovery for stale/cached homepage hero-image failures after the hero asset/path changes.

### PR #21 — Evidence-led guided onboarding — merged

First-run setup is no longer just dog name + duration.

Current routing:

1. **Departure cues first**
   - used when getting-ready cues already cause watchfulness/concern/distress or the owner is unsure;
   - no real leaving is offered initially;
   - uses the existing departure-cue ladder.

2. **Micro-departure**
   - used when departure cues appear neutral but there is no known-comfortable absence;
   - starts with a **3-second observation**;
   - the exact 3 seconds is explicitly documented as a conservative SettledSolo product heuristic, not a clinically validated threshold.

3. **Known comfortable duration**
   - used only when the owner has already observed a calm absence;
   - that duration becomes the starting ceiling.

Other onboarding behaviour:

- no "find the maximum tolerance" test;
- camera/video observation is encouraged where practical;
- only onboarding version + resulting starting path are persisted, not every intake answer;
- existing users are not forced through onboarding;
- backup/restore preserves the onboarding route;
- cue-first users stay on a cue-practice Today screen until repeated calm final-doorway practice allows the first brief timed departure.

The exact cue-readiness rule is also a product heuristic and should remain labelled/documented as such.

### PR #20 — Homepage hero loading — merged

The public hero image path/loading/cache behaviour was improved:

- duplicate CSS background image removed;
- current WebP asset used directly;
- eager/high-priority loading/preload;
- immutable asset caching;
- faster reveal.

## Current product capability

The modern PWA currently includes:

- public marketing site plus `/app`;
- installable/offline PWA shell;
- first-run guided onboarding with three starting paths;
- local-first IndexedDB storage with localStorage/memory fallback;
- legacy Threshold migration;
- Today / Progress / History / More navigation;
- adaptive next-session recommendation engine;
- departure-cue practice ladder;
- configurable/variable warm-up departures;
- default four warm-ups for targets under 10 minutes;
- warm-ups capped at one minute and, for targets under two minutes, at no more than 50% of target;
- warm-up shuffle option;
- live departure timer with progress circle;
- timestamp-based reload/interruption recovery;
- behavioural outcome + observed-signal recording;
- session context tags including confinement/free-roam;
- daily main-departure ceiling;
- milestones/achievements and progress views;
- JSON backup/restore;
- CSV export;
- notification/chime/Media Session progressive enhancement;
- interactive iOS installation guide matching the current Safari menu → Share → Add to Home Screen flow;
- destructive reset/re-onboarding flow;
- Vitest + Playwright coverage;
- Chromium/Pixel 7 and WebKit/iPhone 15 CI profiles.

## Current behavioural/evidence position

Read `docs/EVIDENCE-BASE.md` before changing the training algorithm.

The core product position is:

- systematic/gradual desensitisation;
- keep planned exposure below meaningful distress;
- observe behaviour, not just elapsed time;
- target is a ceiling, not a quota;
- setbacks make the next plan easier;
- repeated difficulty can trigger support/rest guidance;
- departure cues can be practised separately without actually leaving.

Important distinction:

**Evidence-backed principle:** begin with exposure brief/easy enough not to provoke anxiety and progress gradually based on observed behaviour.

**SettledSolo heuristics:** exact 3-second micro-departure, exact progression increments, exact repeated-calm cue-readiness gate.

Do not blur those two categories in UI, marketing or documentation.

## Storage and data architecture

### Current private training data

The active app is local-first.

Primary store:

- IndexedDB database: `dog-training-app`
- app record key: `app-data`
- active-session key: `active-session`

Fallback:

- localStorage app key: `dog-training-app.fallback.v1`
- active-session fallback key: `dog-training-app.active.fallback.v1`

Legacy migration key:

- `threshold.v2`

The reset flow deliberately clears the legacy migration key as well as modern persisted state.

### Accounts / cloud data

**Not implemented yet.**

`wrangler.app.jsonc` and `wrangler.preview.jsonc` currently have no account D1 binding.

Planned direction is documented in `docs/ACCOUNT-SYNC.md`:

- optional accounts; guest remains default;
- Better Auth in the SettledSolo Worker;
- email OTP first;
- optional passkey after sign-in;
- separate preview and production account D1 databases;
- local write first;
- sync outbox + incremental pull;
- stable IDs;
- idempotent server writes;
- tombstones for deletes;
- account export/delete.

Do not mix private account/training data into the analytics database.

## Analytics and the "how many users?" requirement

The separate `cloudflare-worker/` event service currently accepts only:

- `app_open`
- `session_started`
- `session_saved`

It stores basic app/platform metadata only. It must not receive dog names, notes, outcomes, durations or training history.

**Current limitation:** app-open counts are not a trustworthy unique-user/member count because there is no persistent anonymous user/install identifier.

For the production roadmap distinguish:

- **registered members/users:** exact count from account D1 once accounts exist;
- **active registered users:** activity/last-active measure after account implementation;
- **anonymous installations/guest active users:** only countable if a privacy-conscious random installation ID is deliberately added and disclosed.

Do not advertise raw event totals as "users".

A private internal admin dashboard remains a planned item, ideally protected by Cloudflare Access rather than a custom app password.

Suggested future metrics:

- total registered accounts;
- new accounts 7/30d;
- active accounts 7/30d;
- anonymous installations if implemented;
- account conversion;
- onboarding completion;
- starting-path split;
- sessions started/saved/completed;
- departure-cue usage;
- sync/API reliability.

## Cloudflare/deployment position

Modern production config:

- Worker: `settledsolo-web`
- config: `wrangler.app.jsonc`
- canonical `SITE_URL`: `https://settledsolo.com`

Preview config:

- Worker: `settledsolo-web-preview`
- config: `wrangler.preview.jsonc`

Production deployment is **manual workflow dispatch** from `main` via `.github/workflows/deploy-production.yml`.

The production Worker:

- serves `dist-v2`;
- runs Worker-first;
- applies CSP/security headers;
- noindexes non-production hosts and `/app`;
- gives immutable caching to built assets / current hero asset;
- gives HTML `no-cache`;
- handles canonical www/non-www sibling redirect.

### Preview deployment

PR #26 changes `.github/workflows/deploy-preview.yml` so relevant pushes to `main` deploy the preview Worker. Manual dispatch remains available.

Production deployment remains manual. Do not make production auto-deploy merely to mirror preview.

## CI / verification

GitHub CI runs on pull requests and pushes to `main`.

Main commands:

```bash
npm install --ignore-scripts
npm run verify
npm run test:e2e
```

`npm run verify` includes:

- JS syntax checks for retained legacy code;
- TypeScript check for `app-v2`;
- legacy regression suite;
- modern Vitest suite;
- modern production build;
- Cloudflare Worker dry-run.

Playwright then runs against:

- Chromium / Pixel 7 profile;
- WebKit / iPhone 15 profile.

Do not treat WebKit emulation as evidence of installed iPhone PWA lifecycle behaviour.

## Real-device release gates still open

See `docs/DEVICE-TEST-MATRIX.md` for the complete checklist.

Real iPhone evidence already recorded:

- active session survives switching apps;
- survives lock/unlock;
- survives close/reopen;
- chime was audible on the tested device.

Still important on iOS:

- real installed-PWA Airplane Mode relaunch + complete offline save (production service-worker behaviour is now covered automatically in PR #26, but real iOS lifecycle behaviour is not);
- real notification permission/denial behaviour;
- update prompt while an active session exists;
- duplicate warning/target chime behaviour across background/repeated sessions;
- Media Session/Control Centre behaviour where available;
- real-device confirmation that a recovered session saves exactly once (automated recovery/deduplication coverage is in PR #26).

Android installed-PWA testing is still largely open.

Desktop sanity checks are still open.

## Remaining behaviour-quality work

`docs/SA-QUALITY-ROADMAP.md` says items 1–4 are complete.

The smaller remaining item 5 includes:

- food/treat refusal as an optional seventh observed signal;
- a one-time "record the dog alone" pre-protocol observation step;
- a non-prescriptive vet/medication-adjacent support nudge after repeated stalled/distressed sessions.

These should be treated as separate, reviewable changes and remain evidence-aware.

## Public-beta/release work still outstanding

Before a broad public beta, remaining work includes:

- complete the physical-device release gates;
- qualified behaviour-professional review of wording/heuristics;
- feedback/contact route;
- final real product screenshots/social metadata;
- final account/privacy wording once auth/sync exists;
- confirm formal brand/trademark/domain readiness;
- small beta cohort and qualitative feedback.

Do not use training outcomes as an efficacy claim.

## Recommended next sequence

Unless the user explicitly changes priorities, the recommended order is:

1. **Release hardening**
   - finish iOS/Android/offline/update/notification device gates;
   - fix any issues discovered without changing the local-first data path.

2. **Remaining behaviour-quality items**
   - food/treat refusal signal;
   - one-time baseline recording/observation step;
   - appropriately cautious support/referral wording.

3. **D1 + accounts foundation**
   - create separate preview/production account D1 databases;
   - add migrations/bindings;
   - Better Auth + OTP;
   - account status UI.

4. **Guest import + cloud sync**
   - explicit import preview;
   - local outbox;
   - incremental sync;
   - multi-device/offline conflict tests.

5. **User-count/admin metrics**
   - exact registered account count;
   - active account measures;
   - optional anonymous installation metric if privacy design is approved;
   - private admin dashboard.

6. **Small beta**
   - observe onboarding completion, first-session completion, repeat use and multi-week use;
   - fix friction before broader launch.

## Known documentation debt

Several older documents were written before the latest merges.

In particular:

- `docs/NEXT-PHASE.md` still contains historical wording such as "Merge PR #11" and should not be used literally for current PR state.
- `docs/PRODUCT-PLAN.md` still describes some modern-app cutover work as future even though the current Cloudflare build uses `app-v2`.
- `README.md` contains long legacy development-history sections that are useful context but are not the best source for today's priority.

Use this handover as current status and update the older roadmap docs opportunistically when touching the relevant area.

## How the next agent should begin

Before making a change:

1. Read `AGENTS.md`.
2. Read this file.
3. Fetch current `main`, recent merged PRs and any open PRs.
4. Check whether this handover is still current.
5. Read the domain-specific document relevant to the task.
6. Branch from current `main`.
7. Keep the next PR focused.
8. Update this handover if the PR materially changes project state.

## Handover maintenance

After a meaningful merge, update at least:

- "What changed most recently";
- current phase;
- open PR/CI state;
- known release gates;
- recommended next sequence if priorities changed;
- architecture/data/deployment notes if affected.

The goal is that a fresh agent can continue the project from the repository alone, without needing the previous chat history.
