# Threshold analytics setup

Threshold uses two deliberately limited analytics layers.

## 1. Cloudflare Web Analytics

Cloudflare Web Analytics is used for aggregate site traffic and does not require a
Threshold account.

The configured token lives in `js/analytics-config.js`.

## 2. Product event counts

The `cloudflare-worker/` Worker accepts only:

- `app_open`
- `session_started`
- `session_saved`

The event service stores only the app version, timestamps and basic platform metadata
(device type, browser, operating system/display mode where relevant).

It does **not** receive dog names, scenario names, notes, ratings, planned/actual
durations, outcomes or training history.

This separation is intentional. Future account sync will use a different authenticated
API and database model; private training records must never be mixed into analytics.

## Offline behaviour

When the event endpoint is configured but the phone is offline, events are held in a
small local queue. Threshold sends them when it next has a connection and removes them
after Cloudflare accepts them.

## Existing D1 databases

Older Threshold schemas included nullable columns for additional metadata. The v38
Worker no longer writes those values. Existing databases can keep the old nullable
columns until a later maintenance migration; new databases should use
`cloudflare-worker/schema.sql`.

## Privacy rule

Product analytics answer questions such as "is the app being used?" and "are sessions
being completed?". They are not a second copy of the user's training log.
