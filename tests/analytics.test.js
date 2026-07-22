import assert from "node:assert/strict";
import {
  createAnalytics, detectDevice, detectDisplayMode, sanitiseAnalyticsEvent,
  validAnalyticsEvent, QUEUE_KEY
} from "../js/analytics.js";

assert.equal(validAnalyticsEvent("app_open"),true);
assert.equal(validAnalyticsEvent("session_started"),true);
assert.equal(validAnalyticsEvent("session_saved"),true);
assert.equal(validAnalyticsEvent("dog_name"),false);

assert.deepEqual(
  detectDevice({
    userAgent:"Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit Safari/604.1",
    maxTouchPoints:5
  }),
  {deviceType:"mobile",browser:"Safari",operatingSystem:"iOS"}
);

assert.equal(
  detectDisplayMode(
    {matchMedia:()=>({matches:false})},
    {standalone:true}
  ),
  "standalone"
);

assert.deepEqual(
  sanitiseAnalyticsEvent({
    name:"app_open",
    occurredAt:123456,
    dogName:"  Rusty  ",
    deviceType:"mobile",
    browser:"Safari",
    operatingSystem:"iOS",
    displayMode:"standalone"
  },"v32"),
  {
    name:"app_open",
    version:"v32",
    occurredAt:123456,
    dogName:"Rusty",
    targetSeconds:null,
    stopped:null,
    sessionType:null,
    deviceType:"mobile",
    browser:"Safari",
    operatingSystem:"iOS",
    displayMode:"standalone"
  }
);

const values=new Map();
const storage={
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>values.set(key,value),
  removeItem:key=>values.delete(key)
};

let sentBody=null;
let visibilityHandler=null;
const documentRef={
  visibilityState:"visible",
  addEventListener:(name,handler)=>{
    if(name==="visibilitychange") visibilityHandler=handler;
  }
};
const windowRef={
  addEventListener(){},
  matchMedia:()=>({matches:true})
};
const navigatorRef={
  onLine:false,
  standalone:true,
  maxTouchPoints:5,
  userAgent:"Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit Safari/604.1"
};

const analytics=createAnalytics(
  {
    appVersion:"v32",
    eventEndpoint:"https://events.example.test/events",
    cloudflareWebAnalyticsToken:"token"
  },
  {
    storage,
    navigatorRef,
    windowRef,
    documentRef,
    fetcher:async (_url,options)=>{
      sentBody=JSON.parse(options.body);
      return {ok:true};
    }
  }
);

analytics.init({openDetails:()=>({dogName:"Rusty"})});
let queued=JSON.parse(values.get(QUEUE_KEY));
assert.equal(queued.length,1);
assert.equal(queued[0].name,"app_open");
assert.equal(queued[0].dogName,"Rusty");
assert.equal(queued[0].operatingSystem,"iOS");
assert.equal(queued[0].displayMode,"standalone");

// Foregrounding again records another open after the debounce period.
documentRef.visibilityState="hidden";
visibilityHandler();
await new Promise(resolve=>setTimeout(resolve,10));
documentRef.visibilityState="visible";
visibilityHandler();
// Debounce deliberately prevents an immediate duplicate in this test.
assert.equal(JSON.parse(values.get(QUEUE_KEY)).length,1);

const online=createAnalytics(
  {appVersion:"v32",eventEndpoint:"https://events.example.test/events"},
  {
    storage,
    navigatorRef:{onLine:true,userAgent:"Mozilla/5.0 Chrome/150.0",maxTouchPoints:0},
    windowRef:{addEventListener(){},matchMedia:()=>({matches:false})},
    documentRef:null,
    fetcher:async (_url,options)=>{
      sentBody=JSON.parse(options.body);
      return {ok:true};
    }
  }
);
assert.equal(await online.flush(),true);
assert.equal(sentBody.events[0].name,"app_open");
assert.equal(JSON.parse(values.get(QUEUE_KEY)).length,0);

console.log("analytics.test.js passed");
