import { planFor } from "./progression.js";

export function isCompletedAbsence(session){
  return session.kind!=="door"&&!session.stopped&&session.actual>=session.target;
}

export function sessionStatus(session){
  if(session.kind==="door") return "Door practice";
  return session.stopped?"Ended early":"Completed";
}

export function sessionStatusText(session){
  return sessionStatus(session);
}

export function makeCandidateSession({outcome,pending,plan,tags=[],note=""}){
  const candidate={
    base:pending.base,
    target:pending.target,
    actual:pending.actual,
    easy:!!pending.easy,
    stopped:!!pending.stopped,
    stopReason:pending.stopped?String(pending.stopReason||"").slice(0,80).trim():"",
    warmups:pending.warmups,
    warmDone:pending.warmDone,
    warmTimes:Array.isArray(pending.warmTimes)?pending.warmTimes.slice():[],
    outcome,
    at:Date.now(),
    kind:"absence",
    tags:tags.slice(),
    note:String(note||"").trim()
  };

  if(candidate.easy&&outcome==="success") candidate.base=plan.base;

  const floor=Math.max(1,Math.round(candidate.base*0.5));
  if(!candidate.stopped){
    if(candidate.actual<candidate.target*0.75){
      candidate.base=Math.max(floor,candidate.actual);
    }
    if(outcome==="bad"&&candidate.actual<candidate.base){
      candidate.base=Math.max(floor,candidate.actual);
    }
  }else{
    candidate.base=plan.base;
  }

  return candidate;
}

export function previewPlanWithCandidate(scenario,candidate){
  return planFor({
    ...scenario,
    sessions:scenario.sessions.concat([candidate]),
    override:null
  });
}
