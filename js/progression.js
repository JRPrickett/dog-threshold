import { fmt } from "./timer.js";

export function absOf(scenario){
  return scenario.sessions.filter(session=>session.kind!=="door");
}

export function minStep(base){
  return base<60?2:base<300?5:10;
}

export function trailing(sessions,outcome){
  let count=0;
  for(let index=sessions.length-1;index>=0;index--){
    const session=sessions[index];
    if(session.outcome===outcome&&!(outcome==="success"&&session.stopped)) count++;
    else break;
  }
  return count;
}

export function trailingStopped(sessions,outcome){
  let count=0;
  for(let index=sessions.length-1;index>=0;index--){
    const session=sessions[index];
    if(session.stopped&&session.outcome===outcome) count++;
    else break;
  }
  return count;
}

export function nextBase(sessions,start){
  sessions=sessions.filter(session=>session.kind!=="door");

  if(!sessions.length){
    return {
      base:start,
      reason:"First session here. Pick something your dog can already do without a flicker of worry."
    };
  }

  const last=sessions[sessions.length-1];
  const base=last.base;

  if(last.stopped){
    const stoppedRun=trailingStopped(sessions,last.outcome);
    const held=Math.max(1,last.target||base);

    if(last.outcome==="success"){
      return {
        base:held,target:held,holdExact:true,
        reason:"The last session ended early but went well. Repeating the same planned duration."
      };
    }

    if(last.outcome==="ok"){
      if(stoppedRun>=2){
        const decrease=Math.max(Math.round(held*0.05),minStep(held));
        const target=Math.max(1,held-decrease);
        return {
          base:target,target,holdExact:true,
          reason:`${stoppedRun} stopped sessions with some unease. Reducing the planned duration by 5%.`
        };
      }
      return {
        base:held,target:held,holdExact:true,
        reason:"The session ended early with some unease. Holding the same planned duration once before reducing it."
      };
    }

    if(stoppedRun>=2){
      const percentage=stoppedRun>=3?0.30:0.20;
      const target=Math.max(1,Math.round(held*(1-percentage)));
      return {
        base:target,target,holdExact:true,reset:stoppedRun>=3,
        reason:`${stoppedRun} stopped difficult sessions in a row. Reducing the planned duration by ${Math.round(percentage*100)}%.`
      };
    }

    return {
      base:held,target:held,holdExact:true,
      reason:"The session ended early and was difficult. Holding once; another similar result will reduce the target."
    };
  }

  if(last.outcome==="success"){
    const run=trailing(sessions,"success");
    const percentage=run>=3?0.10:run===2?0.08:0.05;
    const step=Math.max(Math.round(base*percentage),minStep(base));
    return {
      base:base+step,
      reason:run>=3?`${run} relaxed sessions in a row. Up 10%.`
        :`Last one went well. Up ${Math.round(percentage*100)}%.`
    };
  }

  if(last.outcome==="ok"){
    if(trailing(sessions,"ok")>=2){
      const decrease=Math.max(Math.round(base*0.05),minStep(base));
      return {
        base:Math.max(1,base-decrease),
        reason:"Two borderline sessions. Easing back rather than pushing on."
      };
    }
    return {
      base,
      reason:"Borderline last time. Repeating the same duration until it's easy."
    };
  }

  const difficultRun=trailing(sessions,"bad");
  if(difficultRun>=3){
    return {
      base:Math.max(1,Math.round(base*0.7)),
      reset:true,
      reason:"Three difficult sessions. Down to 70% — and something other than duration is probably driving this."
    };
  }
  if(difficultRun===2){
    return {
      base:Math.max(1,Math.round(base*0.8)),
      reason:"Two difficult sessions in a row. Down 20% to rebuild confidence."
    };
  }
  return {
    base,
    reason:"Last session was hard. No increase — repeat it."
  };
}

export function planFor(scenario){
  const absences=absOf(scenario);
  const plan=nextBase(absences,scenario.start);
  const count=absences.length;
  const progressionReason=plan.reason;
  plan.easy=false;

  if(plan.holdExact){
    plan.target=plan.base;
  }else if(trailing(scenario.sessions,"success")>=3&&count%4===0){
    plan.target=Math.max(1,Math.round(plan.base*0.6));
    plan.easy=true;
    plan.reason=`A deliberately shorter session after several completed Success ratings. The working baseline remains ${fmt(plan.base)}.`;
  }else if(count>0){
    const seed=((count*9301+49297)%233280)/233280;
    plan.target=Math.max(1,Math.round(plan.base*(1-seed*0.08)));
    if(plan.target!==plan.base){
      plan.reason=`${progressionReason} The working baseline is ${fmt(plan.base)}; today's planned absence is varied to ${fmt(plan.target)} so duration is less predictable.`;
    }
  }else{
    plan.target=plan.base;
  }

  if(scenario.override){
    plan.target=scenario.override;
    plan.base=scenario.override;
    plan.easy=false;
    plan.reason="Target set by hand.";
  }

  return plan;
}

export function nWarm(scenario){
  return scenario.warmups==null?3:scenario.warmups;
}

export function restLen(scenario){
  return scenario.rest==null?60:scenario.rest;
}

export function rng(seed){
  return function random(){
    seed|=0;
    seed=seed+0x6D2B79F5|0;
    let value=Math.imul(seed^seed>>>15,1|seed);
    value=value+Math.imul(value^value>>>7,61|value)^value;
    return ((value^value>>>14)>>>0)/4294967296;
  };
}

export function hash(value){
  let result=2166136261;
  for(let index=0;index<value.length;index++){
    result^=value.charCodeAt(index);
    result=Math.imul(result,16777619);
  }
  return result>>>0;
}

export function buildReps(target,count,seed){
  if(count<=0||target<8) return [{kind:"main",target}];

  const random=rng(seed);
  const fractions=[];
  const reference=Math.min(target,180);
  const ceiling=Math.min(90,target-1);
  const floor=target<30?2:target<120?4:8;
  const low=target<30?0.18:0.10;
  const high=target<30?0.55:0.50;

  for(let index=0;index<count;index++){
    const middle=count===1?(low+high)/2:low+(high-low)*(index/(count-1));
    fractions.push(Math.min(high+0.06,Math.max(low-0.04,middle+(random()-0.5)*0.16)));
  }

  for(let index=fractions.length-1;index>0;index--){
    const swapIndex=Math.floor(random()*(index+1));
    [fractions[index],fractions[swapIndex]]=[fractions[swapIndex],fractions[index]];
  }

  const climbing=fractions.every((value,index)=>index===0||value>fractions[index-1]);
  if(climbing&&fractions.length>2){
    [fractions[0],fractions[fractions.length-2]]=[fractions[fractions.length-2],fractions[0]];
  }

  const repetitions=fractions.map(fraction=>({
    kind:"warm",
    target:Math.max(floor,Math.min(Math.round(reference*fraction),ceiling))
  }));

  for(let index=1;index<repetitions.length;index++){
    if(repetitions[index].target===repetitions[index-1].target){
      repetitions[index].target=Math.min(ceiling,repetitions[index].target+1);
    }
  }

  repetitions.push({kind:"main",target});
  return repetitions;
}

export function routineLength(repetitions,rest){
  return repetitions.reduce((total,repetition)=>total+repetition.target,0)+
    rest*(repetitions.length-1);
}
