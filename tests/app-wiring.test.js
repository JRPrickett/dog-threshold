import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

assert.match(
  app,
  /createStorage,\s*makeId,\s*intIn,\s*textIn,\s*validOutcome,\s*normaliseState/,
  "The session editor must import validOutcome before its submit handler uses it."
);

assert.match(app,/stopped:\s*!!saved\.stopped/);
assert.match(app,/targetSeconds:\s*saved\.target/);

console.log("app-wiring.test.js passed");
