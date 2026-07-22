import assert from "node:assert/strict";
import { cleanSession, normaliseState } from "../js/storage.js";

{
  const migrated=cleanSession({
    kind:"absence",target:345,actual:178,base:178,stopped:false,outcome:"success"
  },5);
  assert.equal(migrated.stopped,true);
}

{
  const normal=normaliseState({
    active:"morning",
    scenarios:[{
      id:"morning",label:"Morning",start:5,
      sessions:[{kind:"absence",target:345,actual:178,base:178,stopped:false,outcome:"success"}]
    }]
  });
  assert.equal(normal.scenarios[0].sessions[0].stopped,true);
  assert.equal(normal.scenarios[0].label,"Separation training");
}

{
  const normal=normaliseState({
    active:"morning",
    scenarios:[
      {id:"morning",label:"Morning",start:5,sessions:[]},
      {id:"daytime",label:"Daytime",start:5,sessions:[]},
      {id:"evening",label:"Evening",start:5,sessions:[]}
    ]
  });
  assert.equal(normal.scenarios.length,1);
  assert.equal(normal.scenarios[0].label,"Separation training");
}

{
  const normal=normaliseState({
    active:"morning",
    scenarios:[
      {
        id:"morning",label:"Morning",start:5,
        sessions:[{kind:"absence",target:10,actual:10,base:10,outcome:"success"}]
      },
      {id:"daytime",label:"Daytime",start:5,sessions:[]},
      {id:"evening",label:"Evening",start:5,sessions:[]}
    ]
  });
  assert.equal(normal.scenarios.length,1);
  assert.equal(normal.scenarios[0].label,"Separation training");
  assert.equal(normal.scenarios[0].sessions.length,1);
}

{
  const normal=normaliseState({
    active:"morning",
    scenarios:[
      {
        id:"morning",label:"Morning",start:5,
        sessions:[{kind:"absence",target:10,actual:10,base:10,outcome:"success"}]
      },
      {
        id:"evening",label:"Evening",start:5,
        sessions:[{kind:"absence",target:8,actual:8,base:8,outcome:"success"}]
      }
    ]
  });
  assert.equal(normal.scenarios.length,2);
  assert.equal(normal.scenarios[0].label,"Morning");
  assert.equal(normal.scenarios[1].label,"Evening");
}

{
  const normal=normaliseState({
    active:"custom",
    scenarios:[
      {id:"morning",label:"Morning",start:5,sessions:[]},
      {id:"daytime",label:"Daytime",start:5,sessions:[]},
      {id:"evening",label:"Evening",start:5,sessions:[]},
      {id:"custom",label:"At work",start:12,sessions:[]}
    ]
  });
  assert.equal(normal.scenarios.length,1);
  assert.equal(normal.scenarios[0].id,"custom");
  assert.equal(normal.scenarios[0].label,"At work");
}

{
  const normal=normaliseState({
    active:"daytime",
    activeRun:{scenarioId:"daytime",phase:"running"},
    scenarios:[
      {id:"morning",label:"Morning",start:5,sessions:[]},
      {id:"daytime",label:"Daytime",start:5,sessions:[]},
      {id:"evening",label:"Evening",start:5,sessions:[]}
    ]
  });
  assert.equal(normal.scenarios.length,1);
  assert.equal(normal.scenarios[0].id,"daytime");
  assert.equal(normal.scenarios[0].label,"Separation training");
}

console.log("migration.test.js passed");
