import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

assert.match(app,/var early=target>5\?5:0/);

const warningStart=app.indexOf("if(early&&mediaLeft<=early");
const warningBlock=app.slice(warningStart,warningStart+350);
assert.match(warningBlock,/playPreChime\(\)/);
assert.match(warningBlock,/showReturnNotification\(early\)/);

const finalStart=app.indexOf("if(left<=0&&!chimed)");
const finalBlock=app.slice(finalStart,finalStart+350);
assert.match(finalBlock,/playChime\(\)/);
assert.doesNotMatch(finalBlock,/showReturnNotification/);
assert.match(app,/remaining\+\" seconds remaining/);

console.log("notification-timing.test.js passed");
