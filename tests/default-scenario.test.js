import assert from "node:assert/strict";
import { freshState, normaliseState } from "../js/storage.js";

const fresh=freshState();
assert.equal(fresh.scenarios.length,1);
assert.equal(fresh.active,"training");
assert.equal(fresh.scenarios[0].label,"Separation training");

const custom=normaliseState({
  active:"training",
  scenarios:[
    {id:"training",label:"Separation training",start:5,sessions:[]},
    {id:"s2",label:"Front door",start:5,sessions:[]}
  ]
});
assert.equal(custom.scenarios.length,2);
assert.equal(custom.scenarios[1].label,"Front door");

console.log("default-scenario.test.js passed");
