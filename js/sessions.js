export function isCompletedAbsence(session){
  return session.kind!=="door"&&!session.stopped&&session.actual>=session.target;
}

export function sessionStatus(session){
  if(session.kind==="door") return "Door practice";
  return session.stopped?"Ended early":"Completed";
}
