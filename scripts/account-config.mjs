import { readFileSync, writeFileSync } from "node:fs";
export function accountConfig(target, env = process.env) {
  if (!["preview", "production"].includes(target)) throw new Error("Choose preview or production.");
  const config = JSON.parse(readFileSync(target === "preview" ? "wrangler.preview.jsonc" : "wrangler.app.jsonc", "utf8"));
  config.vars.ACCOUNTS_ENABLED = "false";
  if (env.ACCOUNTS_ENABLED !== "true") return config;
  const db = target === "preview" ? env.ACCOUNTS_PREVIEW_D1_ID : env.ACCOUNTS_PRODUCTION_D1_ID;
  const other = target === "preview" ? env.ACCOUNTS_PRODUCTION_D1_ID : env.ACCOUNTS_PREVIEW_D1_ID;
  if (!db || !/^[a-f0-9-]{36}$/i.test(db)) throw new Error("Set the target account D1 database ID before enabling accounts.");
  if (!other || !/^[a-f0-9-]{36}$/i.test(other) || db === other) throw new Error("Set distinct preview and production account D1 IDs before enabling accounts.");
  const origin = new URL(env.AUTH_ORIGIN ?? "");
  if (origin.protocol !== "https:" || origin.origin !== env.AUTH_ORIGIN) throw new Error("AUTH_ORIGIN must be an exact HTTPS origin, without a trailing slash.");
  if (target === "preview" && origin.origin === new URL(config.vars.SITE_URL).origin) throw new Error("Preview auth cannot use the production origin.");
  if (target === "production" && origin.origin !== new URL(config.vars.SITE_URL).origin) throw new Error("Production auth must use SITE_URL.");
  if (!env.AUTH_EMAIL_FROM || !env.RESEND_API_KEY || (env.BETTER_AUTH_SECRET?.length ?? 0) < 32) throw new Error("Configure AUTH_EMAIL_FROM, RESEND_API_KEY and a strong BETTER_AUTH_SECRET first.");
  config.vars = { ...config.vars, ACCOUNTS_ENABLED: "true", AUTH_ORIGIN: origin.origin, AUTH_EMAIL_FROM: env.AUTH_EMAIL_FROM };
  config.d1_databases = [{ binding: "ACCOUNTS_DB", database_name: `settledsolo-accounts-${target}`, database_id: db, migrations_dir: "migrations/accounts" }];
  config.ratelimits = [{ name: "ACCOUNT_RATE_LIMITER", namespace_id: target === "preview" ? "17001" : "17002", simple: { limit: 60, period: 60 } }];
  return config;
}
export function writeAccountConfig(target) {
  const path = `.wrangler-accounts-${target}.jsonc`;
  writeFileSync(path, JSON.stringify(accountConfig(target), null, 2));
  return path;
}
