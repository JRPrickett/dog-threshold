import assert from "node:assert/strict";
import { nextBase, planFor, buildReps } from "../js/progression.js";

function absence(overrides={}){
  return {
    kind:"absence", target:345, actual:345, base:345,
    stopped:false, outcome:"success", ...overrides
  };
}

{
  const result=nextBase([absence({actual:178,stopped:true})],5);
  assert.equal(result.target,345,"Stopped Success must hold the exact planned target");
  assert.equal(result.holdExact,true);
}

{
  const first=nextBase([absence({stopped:true,outcome:"ok"})],5);
  assert.equal(first.target,345,"First stopped OK must hold");

  const second=nextBase([
    absence({stopped:true,outcome:"ok"}),
    absence({stopped:true,outcome:"ok"})
  ],5);
  assert.ok(second.target<345,"Second consecutive stopped OK must reduce");
}

{
  const first=nextBase([absence({stopped:true,outcome:"bad"})],5);
  assert.equal(first.target,345,"First stopped Not good must hold");

  const second=nextBase([
    absence({stopped:true,outcome:"bad"}),
    absence({stopped:true,outcome:"bad"})
  ],5);
  assert.equal(second.target,276,"Second stopped Not good should reduce 20%");
}

{
  const plan=planFor({
    start:5,override:null,
    sessions:[absence({stopped:false,outcome:"success"})]
  });
  assert.ok(plan.base>345,"Completed Success should increase the working baseline");
  assert.ok(plan.target>0);
}

{
  const repetitions=buildReps(345,4,1234);
  assert.equal(repetitions.length,5);
  assert.equal(repetitions.at(-1).kind,"main");
  assert.equal(repetitions.at(-1).target,345);
  assert.ok(repetitions.slice(0,-1).every(rep=>rep.target<345));
}

console.log("progression.test.js passed");
