export function timedSessions(scenario){
  return scenario.sessions.filter(session=>session.kind!=="door");
}

export function dashboardStats(scenario,plan,now=Date.now()){
  const sessions=timedSessions(scenario);
  const last=sessions.at(-1)||null;
  const weekStart=new Date(now);
  weekStart.setHours(0,0,0,0);
  weekStart.setDate(weekStart.getDate()-6);
  const week=sessions.filter(session=>session.at>=weekStart.getTime());
  const recent=sessions.slice(-5);
  const completedSuccess=recent.filter(session=>
    session.outcome==="success"&&!session.stopped&&session.actual>=session.target
  ).length;

  return {
    last,
    weekCount:week.length,
    weekSuccess:week.filter(session=>session.outcome==="success").length,
    baseline:plan.base,
    recentCount:recent.length,
    recentSuccess:completedSuccess
  };
}

export function timelineItems(scenario,nextTarget,limit=5){
  const sessions=timedSessions(scenario).slice(-limit).map(session=>({
    type:"session",
    id:session.id,
    at:session.at,
    target:session.target,
    actual:session.actual,
    outcome:session.outcome,
    stopped:!!session.stopped
  }));
  sessions.push({
    type:"next",
    target:nextTarget
  });
  return sessions;
}

export function achievementSnapshot(scenarios){
  const sessions=scenarios.flatMap(scenario=>
    timedSessions(scenario).map(session=>({...session,scenario:scenario.label}))
  );
  const calm=sessions.filter(session=>
    session.outcome==="success"&&!session.stopped&&session.actual>=session.target
  );
  let currentRun=0;
  for(let index=sessions.length-1;index>=0;index--){
    const session=sessions[index];
    if(session.outcome==="success"&&!session.stopped&&session.actual>=session.target){
      currentRun++;
    }else{
      break;
    }
  }
  return {
    completedCalm:calm.length,
    totalCalmSeconds:calm.reduce((sum,session)=>sum+session.actual,0),
    currentCalmRun:currentRun,
    longestCalmSeconds:calm.reduce((best,session)=>Math.max(best,session.actual),0)
  };
}

const ACHIEVEMENTS=[
  {
    id:"first-calm-session",
    met:snapshot=>snapshot.completedCalm>=1,
    title:"First completed calm absence",
    detail:snapshot=>`The first timed absence was completed and marked Success.`
  },
  {
    id:"five-calm-sessions",
    met:snapshot=>snapshot.completedCalm>=5,
    title:"Five completed calm absences",
    detail:snapshot=>`Five timed absences have now been completed and marked Success.`
  },
  {
    id:"five-calm-in-row",
    met:snapshot=>snapshot.currentCalmRun>=5,
    title:"Five calm sessions in a row",
    detail:snapshot=>`The five most recent timed absences were completed and marked Success.`
  },
  {
    id:"one-hour-calm-training",
    met:snapshot=>snapshot.totalCalmSeconds>=3600,
    title:"One hour of completed calm absences",
    detail:snapshot=>`Completed Success sessions now total at least one hour of time alone.`
  }
];

export function newlyReachedAchievements(before,after){
  return ACHIEVEMENTS
    .filter(achievement=>!achievement.met(before)&&achievement.met(after))
    .map(achievement=>({
      id:achievement.id,
      title:achievement.title,
      detail:achievement.detail(after)
    }));
}
