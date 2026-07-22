import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");
const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

assert.match(
  app,
  /var TAGS=\["Morning","Afternoon","Evening","Not walked yet","After a walk","Before food","After food","Radio or TV on"\]/
);

assert.match(html,/Dogs may cope differently at different times of day/);
assert.match(html,/Use session tags for quick context/);
assert.match(html,/add another scenario/);
assert.match(html,/own target progression/);

console.log("time-context.test.js passed");
