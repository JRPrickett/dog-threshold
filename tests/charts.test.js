import assert from "node:assert/strict";
import { progressRows, outcomeCounts } from "../js/charts.js";

const sessions=Array.from({length:15},(_,index)=>({
  target:index+1,actual:index+1,
  outcome:index%3===0?"ok":"success",stopped:false
}));

assert.equal(progressRows(sessions,"all").length,15);
assert.equal(progressRows(sessions,"one").length,12);
assert.equal(progressRows(sessions,"one")[0].index,4);
assert.equal(outcomeCounts(sessions).success,10);
assert.equal(outcomeCounts(sessions).ok,5);

console.log("charts.test.js passed");
