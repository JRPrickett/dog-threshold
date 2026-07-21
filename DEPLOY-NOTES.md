# Threshold v20 deployment

Replace `index.html` and `sw.js` together.

## Early-return progression fix

Pressing **I'm back** before the main-absence target is reached now automatically
marks the session as stopped early.

This means:

- Returned before target + Success: repeat the exact planned target
- Returned before target + OK: follow the stopped-OK hold/reduction rules
- Returned before target + Not good: follow the stopped-not-good hold/reduction rules
- Reaching or exceeding the target continues to count as a completed session

Older affected records are repaired when the app loads: any absence whose actual time
is shorter than its target is treated as stopped early. This should correct the
currently displayed next target without requiring the session to be deleted.

The session editor now follows the same rule.

The service-worker cache is `threshold-v20`.
