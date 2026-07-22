import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8");

assert.match(app,/function restoreRun\(run\)/);
assert.match(app,/activeRunIsRecent\(run,24\*60\*60\*1000\)/);
assert.match(app,/function autoRestoreActiveRun\(\)/);
assert.match(app,/if\(autoRestoreActiveRun\(\)\) return/);

assert.match(app,/window\.addEventListener\("pagehide",checkpointBeforeBackground\)/);
assert.match(app,/window\.addEventListener\("pageshow"/);
assert.match(app,/document\.addEventListener\("visibilitychange"/);
assert.match(app,/document\.addEventListener\("freeze",checkpointBeforeBackground\)/);

assert.match(app,/if\(now-lastCheckpoint>=5000\)/);
assert.match(app,/persistActiveRun\(true\)/);
assert.match(app,/startedAt=restoredStartedAt/);

assert.match(app,/keeper\.addEventListener\("pause"/);
assert.match(app,/setActionHandler\("stop",keepRunning\)/);

const lifecycleStart=app.indexOf("function resumeAfterInterruption()");
const lifecycleBlock=app.slice(lifecycleStart,lifecycleStart+1400);
assert.match(lifecycleBlock,/if\(phase==="running"\)/);
assert.match(lifecycleBlock,/audioStart\(\)/);
assert.match(lifecycleBlock,/runTicker\(\)/);
assert.doesNotMatch(lifecycleBlock,/phase="idle"/);
assert.doesNotMatch(lifecycleBlock,/clearActiveRun\(\)/);

console.log("interruption-proof.test.js passed");
