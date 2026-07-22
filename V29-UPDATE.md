# Updating to Threshold v29

1. Upload the full contents of the v29 folder to the GitHub Pages repository.
2. Preserve the `js`, `css`, `assets`, `tests`, and `cloudflare-worker` folders.
3. No additional D1 migration is required beyond the v28 migration.
4. No Worker-code change is required if the v28 Worker is already deployed.
5. Close all open Threshold browser tabs and the installed app.
6. Open the GitHub Pages site once in the browser, close it, then reopen the
   installed app so the `threshold-v29` service worker takes control.

Do not clear the site's storage, as the training history is stored locally.
