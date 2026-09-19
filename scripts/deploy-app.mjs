import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { writeAccountConfig } from "./account-config.mjs";
const target = process.argv[2];
const config = writeAccountConfig(target);
const run = (args) => {
  const result = spawnSync("npx", ["wrangler", ...args], { stdio: "inherit" });
  if (result.status !== 0) throw new Error("Deployment step failed.");
};
const temporary = mkdtempSync(join(tmpdir(), "settledsolo-deploy-"));
try {
  if (process.env.ACCOUNTS_ENABLED === "true") {
    run([
      "d1",
      "migrations",
      "apply",
      "ACCOUNTS_DB",
      "--remote",
      "--config",
      config,
    ]);
    const secrets = join(temporary, "secrets.json");
    writeFileSync(
      secrets,
      JSON.stringify({
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
      }),
      { mode: 0o600 },
    );
    run(["secret", "bulk", secrets, "--config", config]);
  }
  run(["deploy", "--config", config]);
} finally {
  rmSync(temporary, { recursive: true, force: true });
  rmSync(config, { force: true });
}
