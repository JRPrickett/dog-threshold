# Account and sync architecture

## Goal

Add optional free accounts without making signup a prerequisite for using the training
app.

The existing local-storage model is an asset: it provides instant startup, offline use and
a safe guest mode. Production accounts should extend it rather than replace it.

## User states

### Guest

- No account required.
- Full core app works locally.
- Clear status: progress is saved on this device.
- Backup/export remains available.

### Signed in

- Local cache remains the immediate working copy.
- Changes are synced to the authenticated API.
- Account status confirms the last successful sync.
- The user can sign out without deleting cloud data.
- The user can explicitly remove local account data from that device.

## Signup conversion

Do not show a login wall on first open.

After the user has meaningful progress, surface:

> **Your progress is currently saved on this device.**
> Create a free account to back it up and use Threshold on your other devices.

When an existing guest creates an account, ask before uploading the current local log and
show the number of scenarios/sessions that will be attached to the account.

## Proposed data model

### users

- id
- email / auth subject
- created_at
- deleted_at

### dogs

- id
- user_id
- name
- created_at
- updated_at

Design for multiple dogs even if the first free UI exposes one.

### scenarios

- id
- dog_id
- label
- start_seconds
- warmups
- rest_seconds
- mode
- door_level
- created_at
- updated_at
- deleted_at

### sessions

- id
- scenario_id
- occurred_at
- kind
- target_seconds
- actual_seconds
- base_seconds
- outcome
- stopped
- stop_reason
- tags_json
- note
- created_at
- updated_at
- deleted_at

### preferences

- user_id
- daily_cap
- sound_off
- updated_at

## IDs and migration

The browser already creates stable scenario/session IDs. Preserve those during account
import where possible so the first sync does not create duplicates.

Add a local schema migration that introduces sync metadata separately from the training
record:

- local revision / updated_at
- last successful sync
- authenticated account id
- tombstones for deletes until acknowledged by the server

## Sync rules

- The UI always writes locally first.
- Sync is asynchronous and must not block a training session.
- Session creation should be idempotent by stable ID.
- Deletes use tombstones until the server confirms them.
- Server authorization is derived from the authenticated user; never trust user_id sent
  by the browser.
- Conflicts in append-only session history should normally merge.
- Settings/scenario edits use updated timestamps/revisions and surface a recoverable
  conflict instead of silently discarding data.

## Privacy boundaries

**Analytics database:** aggregate product events only.

**Account database:** private user-owned training data required to provide sync.

Do not send notes, dog names or training history to analytics.

## Required account controls

Before public account launch:

- email/account recovery;
- export all account data;
- delete account and cloud records;
- privacy notice describing storage and subprocessors;
- rate limiting;
- authenticated authorization tests;
- CSRF/origin protection appropriate to the auth design;
- audit of logs to ensure request bodies and notes are not captured accidentally.

## Provider decision

Authentication provider/framework is deliberately not chosen in this foundation change.
The next implementation should compare options against:

- Cloudflare Workers compatibility;
- passkey/magic-link support;
- cost at a free-product scale;
- UK/EU privacy/subprocessor implications;
- account deletion/export support;
- no requirement to ship privileged secrets to the browser.

Choose the provider before building UI around it.
