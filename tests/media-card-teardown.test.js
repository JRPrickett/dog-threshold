import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

assert.match(app,/function clearMediaOwnership\(\)/);
assert.match(app,/setActionHandler\(action,null\)/);
assert.match(app,/keeper\.removeAttribute\("src"\); keeper\.load\(\)/);
assert.match(app,/keeper=null/);
assert.match(app,/function scheduleTone\(/);
assert.match(app,/ctx\.createOscillator\(\)/);
assert.doesNotMatch(app,/chime=new Audio/);
assert.doesNotMatch(app,/chime\.play\(\)/);

const warningStart=app.indexOf("if(early&&mediaLeft<=early");
const warningBlock=app.slice(warningStart,warningStart+350);
assert.match(warningBlock,/showReturnNotification\(early\)/);

const targetStart=app.indexOf("if(left<=0&&!chimed)");
const targetBlock=app.slice(targetStart,targetStart+350);
assert.match(targetBlock,/audioStop\(\)/);
assert.match(targetBlock,/playChime\(\)/);
assert.doesNotMatch(targetBlock,/showReturnNotification/);
assert.match(targetBlock,/setTimeout\(clearMediaOwnership,1200\)/);

assert.doesNotMatch(
  app,
  /\/Android\/i\.test\(navigator\.userAgent/,
  "Notification permission should use capability/standalone checks rather than Android-only detection."
);

console.log("media-card-teardown.test.js passed");
