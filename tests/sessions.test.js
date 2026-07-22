import assert from "node:assert/strict";
import {
  makeCandidateSession, previewPlanWithCandidate, sessionStatusText
} from "../js/sessions.js";

const plan={base:345,target:345};
const pending={
  base:345,target:345,actual:178,easy:false,stopped:true,
  stopReason:"",warmups:4,warmDone:4,warmTimes:[10,20,30,40]
};

const candidate=makeCandidateSession({
  outcome:"success",pending,plan,tags:["After a walk"],note:"Calm"
});
assert.equal(candidate.base,345);
assert.equal(candidate.stopped,true);
assert.equal(sessionStatusText(candidate),"Ended early");

const preview=previewPlanWithCandidate({
  start:5,override:null,sessions:[]
},candidate);
assert.equal(preview.target,345);

console.log("sessions.test.js passed");
