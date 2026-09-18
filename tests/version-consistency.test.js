import assert from "node:assert/strict";
import fs from "node:fs";

const config=fs.readFileSync(new URL("../js/analytics-config.js",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");

const appVersion=config.match(/appVersion:"(v\d+)"/)?.[1];
const cacheVersion=sw.match(/var CACHE = PREFIX \+ "(v\d+)"/)?.[1];

assert.ok(appVersion,"App version must be declared");
assert.ok(cacheVersion,"Service worker cache version must be declared");
assert.equal(
  cacheVersion,
  appVersion,
  "The service-worker cache version must move with the app version so installed PWAs do not keep stale assets."
);

console.log("version-consistency.test.js passed");
