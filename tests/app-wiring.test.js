import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

assert.match(
  app,
  /createStorage,\s*makeId,\s*intIn,\s*textIn,\s*validOutcome,\s*normaliseState/,
  "The session editor must import validOutcome before its submit handler uses it."
);

// Product analytics must remain deliberately separate from private training data.
assert.match(app,/analytics\.track\("session_started"\);/);
assert.match(app,/analytics\.track\("session_saved"\);/);
assert.doesNotMatch(app,/analytics\.track\("session_(?:started|saved)",\s*\{/);
assert.doesNotMatch(app,/dogName:\s*dogName\(\)/);
assert.doesNotMatch(app,/targetSeconds:/);

console.log("app-wiring.test.js passed");
