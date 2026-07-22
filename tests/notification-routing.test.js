import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const manifest=JSON.parse(fs.readFileSync(new URL("../manifest.webmanifest",import.meta.url),"utf8"));

assert.equal(manifest.id,"./");

assert.match(app,/\.\/assets\/icons\/icon-192\.png/);
assert.match(app,/function showReturnNotification\(\)/);
assert.match(app,/registration\.showNotification\("Time to head back"/);
assert.match(app,/requestReturnNotificationPermission\(\); audioStart\(\)/);

const targetBranch=app.slice(
  app.indexOf("if(left<=0&&!chimed)"),
  app.indexOf("}",app.indexOf("if(left<=0&&!chimed)"))+1
);
assert.match(targetBranch,/audioStop\(\)/);
assert.match(targetBranch,/playChime\(\)/);
assert.match(targetBranch,/showReturnNotification\(\)/);
assert.doesNotMatch(targetBranch,/nowPlaying\("Time to head back"/);

assert.match(sw,/self\.addEventListener\("notificationclick"/);
assert.match(sw,/clients\.matchAll\(\{type:"window",includeUncontrolled:true\}\)/);
assert.match(sw,/clients\.openWindow/);

console.log("notification-routing.test.js passed");
