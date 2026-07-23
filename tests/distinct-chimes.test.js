import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

const finalStart=app.indexOf("function playChime()");
const finalEnd=app.indexOf("function playPreChime()",finalStart);
const finalBlock=app.slice(finalStart,finalEnd);

assert.match(finalBlock,/scheduleTone\(ctx,660,0\.00,0\.85,0\.14\)/);
assert.match(finalBlock,/scheduleTone\(ctx,990,0\.00,0\.70,0\.08\)/);
assert.match(finalBlock,/scheduleTone\(ctx,880,0\.42,1\.05,0\.13\)/);
assert.match(finalBlock,/scheduleTone\(ctx,1320,0\.42,0\.90,0\.07\)/);

const warningStart=app.indexOf("function playPreChime()");
const warningEnd=app.indexOf("function nowPlaying",warningStart);
const warningBlock=app.slice(warningStart,warningEnd);

assert.match(warningBlock,/scheduleTone\(ctx,520,0\.00,0\.50,0\.12\)/);
assert.match(warningBlock,/scheduleTone\(ctx,660,0\.22,0\.55,0\.11\)/);
assert.match(warningBlock,/scheduleTone\(ctx,820,0\.46,0\.60,0\.10\)/);

assert.notEqual(finalBlock,warningBlock);

console.log("distinct-chimes.test.js passed");
