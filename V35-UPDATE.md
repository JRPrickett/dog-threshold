# Threshold v35

## One default scenario

New users now start with one scenario called **Separation training**. Further
scenarios can still be created through **Add a scenario**.

Existing data is protected. The migration removes only unused, untouched legacy
Morning/Daytime/Evening defaults. It keeps scenarios containing history, custom
scenarios and any scenario referenced by an active run. A sole remaining legacy
scenario is renamed **Separation training** without changing its ID.

## Five-second notification

The **Time to head back** notification now appears exactly five seconds before
the target whenever the target is longer than five seconds.

At five seconds remaining:

- The early warning chime plays
- The notification says **5 seconds remaining**
- The Dynamic Island/media countdown continues

At zero, the final chime still plays without creating a duplicate notification.

## Deployment

1. Upload the complete v35 package to GitHub Pages.
2. No D1 migration is required.
3. No Cloudflare Worker update is required.
4. Close all Threshold tabs and the installed app.
5. Open the GitHub Pages site once, close it, then reopen the installed app.

Service-worker cache: `threshold-v35`.
