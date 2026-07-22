export function chartWindowLabel(mode){
  return mode==="all"?"All sessions":"Recent sessions";
}

export function progressRows(sessions,mode="one",limit=12){
  const rows=sessions.map((session,index)=>({
    index:index+1,
    target:session.target||0,
    actual:session.actual||0,
    outcome:session.outcome,
    stopped:!!session.stopped
  }));
  return mode==="all"?rows:rows.slice(-limit);
}

export function outcomeCounts(sessions){
  return sessions.reduce((counts,session)=>{
    counts[session.outcome]=(counts[session.outcome]||0)+1;
    return counts;
  },{success:0,ok:0,bad:0});
}
