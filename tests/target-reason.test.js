import assert from "node:assert/strict";
import { friendlyTargetReason } from "../js/target-reason.js";

function session(overrides={}){
  return {kind:"absence",target:345,actual:345,base:345,stopped:false,outcome:"success",...overrides};
}

assert.equal(
  friendlyTargetReason({start:5,override:null,sessions:[]},{base:5,target:5,easy:false}).summary,
  "This is the comfortable starting time you selected."
);
assert.equal(
  friendlyTargetReason({start:5,override:null,sessions:[session()]},{base:362,target:358,easy:false}).summary,
  "Last session went well, so today’s target is slightly longer."
);
assert.equal(
  friendlyTargetReason(
    {start:5,override:null,sessions:[session({actual:178,stopped:true})]},
    {base:345,target:345,easy:false}
  ).summary,
  "The last session ended early but went well, so the same target will be repeated."
);
assert.equal(
  friendlyTargetReason({start:5,override:null,sessions:[session()]},{base:362,target:217,easy:true}).summary,
  "Today’s session is intentionally shorter to keep departure lengths varied."
);

console.log("target-reason.test.js passed");
