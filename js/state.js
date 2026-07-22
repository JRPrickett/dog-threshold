export const PHASES=Object.freeze({
  IDLE:"idle",
  RUNNING:"running",
  REST:"rest",
  CUE:"cue",
  DOOR_VERDICT:"doorVerdict",
  MAIN_VERDICT:"verdictMain"
});

export function saveActiveRunState(state,run){
  state.activeRun={...run,savedAt:Date.now()};
}

export function clearActiveRunState(state){
  state.activeRun=null;
}

export function loadActiveRun(state){
  return state&&state.activeRun&&typeof state.activeRun==="object"
    ?state.activeRun:null;
}

export function activeRunIsRecent(run,maxAgeMs=6*60*60*1000){
  if(!run) return false;
  const timestamp=Number(run.savedAt||run.startedAt||0);
  return timestamp>0&&Date.now()-timestamp<=maxAgeMs;
}
