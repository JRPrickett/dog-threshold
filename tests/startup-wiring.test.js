import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

assert.match(
  app,
  /createStorage,\s*makeId,\s*intIn,\s*textIn,\s*validOutcome,\s*normaliseState,\s*freshState/,
  "The reset flow must import freshState."
);

assert.match(
  app,
  /if\(!storage\.canSave\(\)\)/,
  "storageStatus must call the storage adapter instead of an undefined variable."
);

assert.doesNotMatch(
  app,
  /if\(!canSave\)/,
  "The old undefined canSave reference must not return."
);

assert.match(
  app,
  /state=freshState\(\)/,
  "Delete-everything must reset through freshState()."
);

assert.match(
  app,
  /setupSkip"\)\.onclick=function\(\)\{\s*state\.setupDone=false/,
  "Skip for now must not permanently mark setup as complete."
);

console.log("startup-wiring.test.js passed");
