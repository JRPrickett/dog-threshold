import assert from "node:assert/strict";
import {
  dashboardStats, timelineItems, achievementSnapshot, newlyReachedAchievements
} from "../js/dashboard.js";

const now=new Date("2026-07-21T12:00:00Z").getTime();
const scenario={
  sessions:[
    {id:"1",kind:"absence",at:now-2*86400000,target:300,actual:300,outcome:"success",stopped:false},
    {id:"2",kind:"absence",at:now-86400000,target:320,actual:320,outcome:"success",stopped:false}
  ]
};

const stats=dashboardStats(scenario,{base:340},now);
assert.equal(stats.weekCount,2);
assert.equal(stats.weekSuccess,2);
assert.equal(stats.recentSuccess,2);
assert.equal(stats.baseline,340);

const timeline=timelineItems(scenario,345,5);
assert.equal(timeline.at(-1).type,"next");
assert.equal(timeline.at(-1).target,345);

const before=achievementSnapshot([{sessions:[]}]);
const after=achievementSnapshot([scenario]);
const reached=newlyReachedAchievements(before,after);
assert.ok(reached.some(item=>item.id==="first-calm-session"));

console.log("dashboard.test.js passed");
