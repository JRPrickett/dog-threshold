import assert from "node:assert/strict";
import { freshState, normaliseState, createStorage, KEY } from "../js/storage.js";

{
  const state=freshState();
  assert.equal(state.scenarios.length,3);
  assert.equal(state.scenarios[0].warmups,4);
}

{
  const normal=normaliseState({
    name:"Milo",
    active:"home",
    dailyCap:3,
    scenarios:[{
      id:"home",label:"Home",start:15,warmups:2,rest:45,sessions:[]
    }]
  });
  assert.equal(normal.name,"Milo");
  assert.equal(normal.dailyCap,3);
  assert.equal(normal.scenarios[0].rest,45);
  assert.equal(normal.version,4);
}

{
  const values=new Map();
  const fakeStorage={
    getItem:key=>values.get(key)??null,
    setItem:(key,value)=>values.set(key,value)
  };
  const storage=createStorage(fakeStorage);
  const state=freshState();
  state.name="Pippin";
  assert.equal(storage.save(state),true);
  assert.ok(values.has(KEY));
  assert.equal(storage.boot().name,"Pippin");
}

console.log("storage.test.js passed");
