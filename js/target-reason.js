import { absOf, trailing, trailingStopped } from "./progression.js";
import { fmt } from "./timer.js";

const OUTCOME_LABELS={success:"Success",ok:"OK",bad:"Not good"};

export function friendlyTargetReason(scenario,plan){
  const sessions=absOf(scenario);
  const last=sessions.at(-1)||null;

  if(scenario.override){
    return {summary:"You set this target manually.",details:technicalDetails(last,plan)};
  }
  if(!last){
    return {
      summary:"This is the comfortable starting time you selected.",
      details:technicalDetails(last,plan)
    };
  }
  if(plan.easy){
    return {
      summary:"Today’s session is intentionally shorter to keep departure lengths varied.",
      details:technicalDetails(last,plan)
    };
  }

  if(last.stopped){
    if(last.outcome==="success"){
      return {
        summary:"The last session ended early but went well, so the same target will be repeated.",
        details:technicalDetails(last,plan)
      };
    }
    if(last.outcome==="ok"){
      return {
        summary:trailingStopped(sessions,"ok")>=2
          ?"Recent sessions have shown some uncertainty, so today’s target is slightly shorter."
          :"The last session ended early with some uncertainty, so the same target will be repeated.",
        details:technicalDetails(last,plan)
      };
    }
    return {
      summary:trailingStopped(sessions,"bad")>=2
        ?"Recent sessions have been difficult, so today’s target has been reduced."
        :"The last session was difficult, so the same target will be tried once more.",
      details:technicalDetails(last,plan)
    };
  }

  if(last.outcome==="success"){
    return {
      summary:"Last session went well, so today’s target is slightly longer.",
      details:technicalDetails(last,plan)
    };
  }
  if(last.outcome==="ok"){
    return {
      summary:trailing(sessions,"ok")>=2
        ?"Recent sessions have shown some uncertainty, so today’s target is slightly shorter."
        :"Last session showed some uncertainty, so the target is staying similar.",
      details:technicalDetails(last,plan)
    };
  }
  return {
    summary:trailing(sessions,"bad")>=2
      ?"Recent sessions have been difficult, so today’s target has been reduced."
      :"Last session was difficult, so the target is staying similar.",
    details:technicalDetails(last,plan)
  };
}

function technicalDetails(last,plan){
  if(!last){
    return [
      ["Training baseline",fmt(plan.base)],
      ["Today’s target",fmt(plan.target)]
    ];
  }
  return [
    ["Previous target",fmt(last.target)],
    ["Actual time",fmt(last.actual)],
    ["Rating",OUTCOME_LABELS[last.outcome]||last.outcome],
    ["Session status",last.stopped?"Ended early":"Completed"],
    ["Training baseline",fmt(plan.base)],
    ["Today’s target",fmt(plan.target)]
  ];
}
