# Optional account activation

This branch implements accounts and sync, but **does not activate them on a deployed Worker**.
Guest use remains the default. Unconfigured account endpoints fail closed with JSON and the app
continues to work locally. Never point account bindings at the analytics database.

## Review before activation

- Merge the account PR only after code, D1, mobile-browser and production-PWA CI gates pass.
- Review `ACCOUNT-SYNC.md` and the recorded app behaviour in `ACCOUNTS-REVIEW.md`.
- Complete sender/domain verification with the email provider (the current adapter is Resend).
- Finalise public privacy/contact details, provider data-processing terms, retention and backups.
- Installed-device gates in `DEVICE-TEST-MATRIX.md` remain separate and are not cleared by CI.

## Provision isolated databases

After the provisioning workflow exists on main, run **Provision isolated account database** once
for `preview` and once for `production`. It creates or reuses only these names:

- `settledsolo-accounts-preview`
- `settledsolo-accounts-production`

It uses the existing environment's `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.
The token needs D1 read/edit permission in addition to the existing Worker deployment permissions.
The workflow prints database IDs in its job summary, never tokens. It does not enable accounts,
deploy the Worker, or touch the analytics database.

Equivalent local commands, with credentials supplied privately in the environment:

```sh
node scripts/provision-accounts.mjs preview
node scripts/provision-accounts.mjs production
```

## GitHub configuration

Set both D1 IDs as repository variables. Use environment-scoped variables/secrets for the rest.

| Name | Kind | Value |
| --- | --- | --- |
| `ACCOUNTS_PREVIEW_D1_ID` | Repository variable | Actual preview D1 UUID |
| `ACCOUNTS_PRODUCTION_D1_ID` | Repository variable | Actual production D1 UUID |
| `ACCOUNTS_ENABLED` | Environment variable | `true` only when ready to activate that environment |
| `AUTH_ORIGIN` | Environment variable | Exact HTTPS origin; preview Worker URL for preview, `https://settledsolo.com` for production; no trailing slash |
| `AUTH_EMAIL_FROM` | Environment variable | Verified sender, e.g. `SettledSolo <login@your-verified-domain>` |
| `BETTER_AUTH_SECRET` | Environment secret | Independently generated random secret, at least 32 characters; different in preview/production |
| `RESEND_API_KEY` | Environment secret | Sending key scoped to the verified domain |

Do not put secret values in source, chat, PR descriptions, screenshots or workflow output.

## Deploy preview first

Use **Deploy SettledSolo Preview** after configuration. The deployment script:

1. Validates origins, credentials and distinct database IDs.
2. Creates a temporary Wrangler config with `ACCOUNTS_DB` and a native API rate limiter.
3. Applies only account migrations to the selected D1 database.
4. Uploads auth/email secrets using a private temporary file which is removed afterwards.
5. Deploys the selected Worker and removes the temporary config.

All generated config paths are ignored by git. Secrets are not written into Wrangler config.
When `ACCOUNTS_ENABLED` is unset/false, deployment explicitly disables account endpoints; it
does not delete existing cloud data. Set the variable consistently once enabled to avoid
accidentally disabling accounts on a later deployment.

Verify a real delivered OTP, expiry/error handling, logout and a fresh OTP before deletion in
preview. Confirm the privacy notice and sender identity before enabling production. Production
remains a manual workflow dispatch from main.

## Operational boundaries

- OTPs are hashed at rest, expire after five minutes and permit three verification attempts.
- Auth uses database-backed limits plus the Worker API rate limiter. Configure Cloudflare edge
  rules for additional protection against distributed email abuse before a broader launch.
- Sync is local-first with explicit initial consent and 25-operation client batches. The server
  accepts at most 50 operations and 512 KiB, with incremental pages of 200 changes.
- API responses are private/no-store and noindexed; API failures never fall through to the SPA.
- The Worker does not log bodies, codes, dog names, notes or training history. Better Auth logging
  is disabled. Provider operational logs/backups need their retention documented before activation.
- Account deletion requires an authenticated session created within the last ten minutes and
  typed `DELETE`. Foreign keys cascade through cloud training data and auth records.
- Deleting cloud data does not remotely wipe device copies. Sign-out pauses sync and keeps the
  local log; local reset clears the device log and disconnects it without deleting cloud history.
- Passkeys are intentionally deferred; email OTP is the complete first authentication path.
- Conflicting versions remain on the device in the conflict archive, included in backup export.
