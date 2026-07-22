export const SCHEMA = 4;
export const KEY = "threshold.v2";
export const OLD_KEY = "threshold.v1";

export function makeId(prefix){
  return (prefix||"id")+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}

export function intIn(value,min,max,fallback){
  const parsed=parseInt(value,10);
  return Number.isFinite(parsed)&&parsed>=min&&parsed<=max?parsed:fallback;
}

export function textIn(value,max){
  return typeof value==="string"?value.slice(0,max||500):"";
}

export function validOutcome(value){
  return value==="success"||value==="ok"||value==="bad"?value:"bad";
}

export function cleanSession(session,start){
  if(!session||typeof session!=="object") throw new Error("Invalid session");

  const door=session.kind==="door";
  const target=intIn(session.target,1,14400,intIn(session.base,1,14400,start));
  const clean={
    id:textIn(session.id,80)||makeId("p"),
    kind:door?"door":"absence",
    at:intIn(session.at,1,Number.MAX_SAFE_INTEGER,Date.now()),
    outcome:validOutcome(session.outcome),
    stopped:!!session.stopped,
    stopReason:textIn(session.stopReason,80).trim(),
    tags:Array.isArray(session.tags)
      ?session.tags.map(tag=>textIn(tag,40).trim()).filter(Boolean).slice(0,20):[],
    note:textIn(session.note,140).trim()
  };

  if(door){
    clean.level=intIn(session.level,0,7,0);
    clean.steps=intIn(session.steps,0,50,0);
    clean.planned=intIn(session.planned,1,50,Math.max(1,clean.steps));
    clean.wobbles=intIn(session.wobbles,0,50,0);
  }else{
    clean.target=target;
    clean.actual=intIn(session.actual,1,14400,target);
    clean.base=intIn(session.base,1,14400,target);

    // Migration: earlier versions did not always mark an early "I'm back" as stopped.
    if(clean.actual<clean.target) clean.stopped=true;

    clean.easy=!!session.easy;
    clean.warmups=intIn(session.warmups,0,20,0);
    clean.warmDone=intIn(session.warmDone,0,20,clean.warmups);
    clean.warmTimes=Array.isArray(session.warmTimes)
      ?session.warmTimes.map(value=>intIn(value,0,14400,0)).slice(0,20):[];
  }

  return clean;
}

export function freshState(){
  return {
    version:SCHEMA,
    name:"",
    active:"morning",
    setupDone:false,
    scenarios:[
      {id:"morning",label:"Morning",start:5,warmups:4,rest:60,sessions:[],override:null},
      {id:"daytime",label:"Daytime",start:5,warmups:4,rest:60,sessions:[],override:null},
      {id:"evening",label:"Evening",start:5,warmups:4,rest:60,sessions:[],override:null}
    ]
  };
}

export function normaliseState(input){
  if(!input||typeof input!=="object"||!Array.isArray(input.scenarios)||!input.scenarios.length){
    throw new Error("Invalid Threshold data");
  }

  const normal=freshState();
  const ids={};
  const sessionIds={};

  normal.name=textIn(input.name,40);
  normal.soundOff=!!input.soundOff;
  normal.dailyCap=intIn(input.dailyCap,1,3,2);
  normal.lastBackup=intIn(input.lastBackup,1,Number.MAX_SAFE_INTEGER,0)||undefined;
  normal.persisted=!!input.persisted;
  normal.installDismissedAt=intIn(input.installDismissedAt,1,Number.MAX_SAFE_INTEGER,0);
  normal.installGateContinuedAt=intIn(input.installGateContinuedAt,1,Number.MAX_SAFE_INTEGER,0);
  if(!normal.installDismissedAt&&input.installDismissed) normal.installDismissedAt=Date.now();

  normal.setupDone=input.setupDone===true||input.scenarios.some(
    scenario=>scenario&&Array.isArray(scenario.sessions)&&scenario.sessions.length
  );

  normal.scenarios=input.scenarios.slice(0,20).map((scenario,index)=>{
    if(!scenario||typeof scenario!=="object") throw new Error("Invalid scenario");

    let id=textIn(scenario.id,80)||makeId("s");
    while(ids[id]) id=makeId("s");
    ids[id]=true;

    const start=intIn(scenario.start,1,7200,5);
    return {
      id,
      label:textIn(scenario.label,24).trim()||`Scenario ${index+1}`,
      start,
      warmups:intIn(scenario.warmups,0,6,4),
      rest:intIn(scenario.rest,0,600,60),
      sessions:Array.isArray(scenario.sessions)?scenario.sessions.map(session=>{
        const clean=cleanSession(session,start);
        while(sessionIds[clean.id]) clean.id=makeId("p");
        sessionIds[clean.id]=true;
        return clean;
      }):[],
      override:scenario.override==null?null:intIn(scenario.override,1,14400,null),
      mode:scenario.mode==="door"?"door":"absence",
      doorLevel:intIn(scenario.doorLevel,0,7,0)
    };
  });

  normal.active=normal.scenarios.some(scenario=>scenario.id===input.active)
    ?input.active:normal.scenarios[0].id;
  normal.activeRun=input.activeRun&&typeof input.activeRun==="object"?input.activeRun:null;
  normal.version=SCHEMA;
  return normal;
}

function readRaw(storage,key){
  try{
    return storage.getItem(key);
  }catch{
    return null;
  }
}

export function createStorage(storage=globalThis.localStorage){
  let memory=null;
  let writable=true;

  function boot(){
    const current=readRaw(storage,KEY);
    if(current){
      try{
        return normaliseState(JSON.parse(current));
      }catch{
        // Continue to legacy migration or a fresh state.
      }
    }

    const legacy=readRaw(storage,OLD_KEY);
    if(legacy){
      try{
        const old=JSON.parse(legacy);
        const migrated=freshState();
        migrated.name=old.name||"";
        migrated.scenarios[0].start=old.start||5;
        migrated.scenarios[0].sessions=old.sessions||[];
        migrated.scenarios[0].label="Morning";
        migrated.setupDone=true;
        return normaliseState(migrated);
      }catch{
        // Fall through to a fresh state.
      }
    }

    return memory||freshState();
  }

  function save(state){
    state.version=SCHEMA;
    memory=state;
    try{
      storage.setItem(KEY,JSON.stringify(state));
      writable=true;
    }catch{
      writable=false;
    }
    return writable;
  }

  return {
    boot,
    save,
    canSave:()=>writable
  };
}
