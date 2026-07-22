import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

const doorStart=app.indexOf('function recordDoor(outcome)');
const doorEnd=app.indexOf('function graduate()',doorStart);
const doorBlock=app.slice(doorStart,doorEnd);
assert.ok(doorStart>=0&&doorEnd>doorStart);
assert.ok(
  doorBlock.indexOf('analytics.track("session_saved"') < doorBlock.indexOf('render();'),
  "Door session analytics must be queued before rendering."
);

const absenceStart=app.indexOf('function commitReviewedSession()');
const absenceEnd=app.indexOf('el("reviewSave").onclick',absenceStart);
const absenceBlock=app.slice(absenceStart,absenceEnd);
assert.ok(absenceStart>=0&&absenceEnd>absenceStart);
assert.ok(
  absenceBlock.indexOf('analytics.track("session_saved"') < absenceBlock.indexOf('render();'),
  "Timed session analytics must be queued before rendering."
);

console.log("save-event-order.test.js passed");
