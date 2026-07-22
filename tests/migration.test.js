import assert from "node:assert/strict";
import { cleanSession, normaliseState } from "../js/storage.js";

{
  const migrated=cleanSession({
    kind:"absence",
    target:345,
    actual:178,
    base:178,
    stopped:false,
    outcome:"success"
  },5);
  assert.equal(migrated.stopped,true,
    "A historical early return must be repaired as a stopped session");
}

{
  const normal=normaliseState({
    active:"morning",
    scenarios:[{
      id:"morning",
      label:"Morning",
      start:5,
      sessions:[{
        kind:"absence",
        target:345,
        actual:178,
        base:178,
        stopped:false,
        outcome:"success"
      }]
    }]
  });
  assert.equal(normal.scenarios[0].sessions[0].stopped,true);
}

console.log("migration.test.js passed");
