# SettledSolo production deployment

The original Threshold root PWA remains in this renamed `settledsolo` repository during migration.

The production replacement is built from `app-v2/`.

## Build

```bash
npm install
npm run verify
npm run build:v2
```

Build output:

```text
dist-v2/
```

## Cloudflare preview

The isolated preview Worker is configured in `wrangler.preview.jsonc`.

```bash
npm run deploy:preview
```

This deploys the SPA as the `settledsolo-web-preview` Worker.

The GitHub workflow `.github/workflows/deploy-preview.yml` auto-runs on relevant pushes to
`modern-app-shell-engine` and also supports manual dispatch. It expects repository/environment
secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Preview hosts are automatically returned with `X-Robots-Tag: noindex, nofollow`.

Use the resulting workers.dev URL for the physical-device test matrix before any root-app cutover.

## Worker naming

Keep the product surfaces separate:

- `settledsolo-web` — production website/PWA
- `settledsolo-web-preview` — isolated preview website/PWA
- `settledsolo-events` — analytics/events API (legacy config currently still says `threshold-events` until that migration is handled separately)

Do not point the static site deployment at the analytics Worker.

## Cloudflare production

Production static-asset configuration lives in `wrangler.app.jsonc`.

```bash
npm run deploy:cloudflare
```

Cloudflare Static Assets are configured with SPA fallback so direct requests to:

- `/`
- `/app/`
- `/privacy`
- `/terms`
- `/help`

resolve to the React entry point rather than returning a static 404.

The intended final domain layout is:

- `settledsolo.com` — canonical
- `settledsolo.app` — redirect
- `settledsolo.co.uk` — redirect

Do not attach the final custom domains until the owner has purchased them and the modern PWA has
passed the real-device release gate.

## Security

`worker/index.ts` applies the production security headers, restrictive CSP, preview noindex policy
and static asset caching before requests reach the Vite app.

Review the CSP before introducing any future third-party analytics, authentication or API hosts.

## Cutover gate

Before replacing the old root PWA:

1. CI green.
2. Android-style Chromium Playwright green.
3. iPhone-style WebKit Playwright green.
4. Real installed iPhone PWA checks complete.
5. Real installed Android PWA checks complete.
6. Camera-app switching / lock-screen timer behaviour recorded.
7. Offline relaunch verified.
8. Backup/export/restore verified.
9. Qualified behaviour-professional content review complete.
10. SettledSolo domain/trademark checks recorded.
