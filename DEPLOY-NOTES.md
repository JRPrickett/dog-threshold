# Threshold v35 deployment

- One default scenario: **Separation training**
- Safe removal of unused legacy Morning/Daytime/Evening defaults
- Existing history, custom scenarios and active runs preserved
- Return notification moved to five seconds before the target
- Final chime remains at zero
- No duplicate final notification

Version details:

- State schema: `5`
- App version: `v35`
- Service-worker cache: `threshold-v35`

No Cloudflare Worker or D1 changes are required.
