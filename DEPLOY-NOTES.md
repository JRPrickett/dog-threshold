# Threshold v29 deployment

## Startup fix

v28 called `storageStatus()` during the first render. That function checked an
undefined variable named `canSave`, causing a JavaScript runtime error.

Effects included:

- The page appearing to stall after partially drawing
- First-run setup not opening
- Later startup code not running

v29 calls `storage.canSave()` correctly.

## First-run setup

A fresh installation now reaches the setup guide and asks for:

- Dog name
- Comfortable starting absence
- Timed absence or Door is a Bore mode
- Camera acknowledgement

**Skip for now** no longer permanently marks setup as complete. The guide will
be offered again on a later launch, and remains available from Settings.

## Reset fix

**Delete everything and start over** previously called an undefined `fresh()`
helper. It now uses the exported `freshState()` function and reliably opens the
setup guide afterward.

## Existing analytics

The v28 Worker and D1 metadata changes remain included and unchanged.

- App version: `v29`
- Web Analytics token: configured
- Event endpoint: configured
- Service-worker cache: `threshold-v29`
