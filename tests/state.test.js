import assert from "node:assert/strict";
import {
  saveActiveRunState, clearActiveRunState, loadActiveRun, activeRunIsRecent
} from "../js/state.js";

const state={};
saveActiveRunState(state,{phase:"running",startedAt:Date.now()});
assert.equal(loadActiveRun(state).phase,"running");
assert.equal(activeRunIsRecent(loadActiveRun(state)),true);
clearActiveRunState(state);
assert.equal(loadActiveRun(state),null);

console.log("state.test.js passed");
