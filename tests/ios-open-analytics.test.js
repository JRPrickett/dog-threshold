import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const analytics=fs.readFileSync(new URL("../js/analytics.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");
const worker=fs.readFileSync(new URL("../cloudflare-worker/src/index.js",import.meta.url),"utf8");
const migration=fs.readFileSync(new URL("../cloudflare-worker/migration-v32.sql",import.meta.url),"utf8");

assert.match(html,/script type="module"/);
assert.match(html,/static\.cloudflareinsights\.com\/beacon\.min\.js/);
assert.match(html,/560cdae680184b58a8fb7da59b990fb0/);

assert.doesNotMatch(analytics,/function installWebAnalytics/);
assert.match(analytics,/ALLOWED_EVENTS=new Set\(\["app_open","session_started","session_saved"\]\)/);
assert.match(analytics,/visibilitychange/);
assert.match(analytics,/navigatorRef\.standalone===true/);
assert.match(app,/openDetails:function\(\)\{ return \{dogName:dogName\(\)\}; \}/);

assert.match(worker,/event\.name==="app_open"/);
assert.match(worker,/INSERT INTO app_open_events/);
assert.match(migration,/CREATE TABLE IF NOT EXISTS app_open_events/);

console.log("ios-open-analytics.test.js passed");
