import assert from "node:assert/strict";
import {
  createAnalytics, detectDevice, sanitiseAnalyticsEvent,
  validAnalyticsEvent, QUEUE_KEY
} from "../js/analytics.js";

assert.equal(validAnalyticsEvent("session_started"),true);
assert.equal(validAnalyticsEvent("session_saved"),true);
assert.equal(validAnalyticsEvent("dog_name"),false);

assert.deepEqual(
  detectDevice({userAgent:"Mozilla/5.0 (iPhone) AppleWebKit Safari/604.1"}),
  {deviceType:"mobile",browser:"Safari"}
);

assert.deepEqual(
  sanitiseAnalyticsEvent({
    name:"session_saved",
    occurredAt:123456,
    dogName:"  Bertie  ",
    targetSeconds:75,
    stopped:true,
    sessionType:"absence",
    deviceType:"mobile",
    browser:"Safari"
  },"v28"),
  {
    name:"session_saved",
    version:"v28",
    occurredAt:123456,
    dogName:"Bertie",
    targetSeconds:75,
    stopped:true,
    sessionType:"absence",
    deviceType:"mobile",
    browser:"Safari"
  }
);

const values=new Map();
const storage={
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>values.set(key,value),
  removeItem:key=>values.delete(key)
};

let sentBody=null;
const analytics=createAnalytics(
  {
    appVersion:"v28",
    eventEndpoint:"https://events.example.test/events",
    cloudflareWebAnalyticsToken:""
  },
  {
    storage,
    navigatorRef:{
      onLine:false,
      userAgent:"Mozilla/5.0 (Linux; Android 15) Chrome/150.0 Mobile"
    },
    windowRef:{addEventListener(){}},
    documentRef:null,
    fetcher:async (_url,options)=>{
      sentBody=JSON.parse(options.body);
      return {ok:true};
    }
  }
);

assert.equal(analytics.track("session_started",{
  dogName:"Bertie",
  targetSeconds:90,
  sessionType:"absence"
}),true);

const queued=JSON.parse(values.get(QUEUE_KEY));
assert.equal(queued.length,1);
assert.equal(queued[0].dogName,"Bertie");
assert.equal(queued[0].targetSeconds,90);
assert.equal(queued[0].deviceType,"mobile");
assert.equal(analytics.track("not_allowed"),false);

const online=createAnalytics(
  {appVersion:"v28",eventEndpoint:"https://events.example.test/events"},
  {
    storage,
    navigatorRef:{onLine:true,userAgent:"Mozilla/5.0 Chrome/150.0"},
    windowRef:{addEventListener(){}},
    documentRef:null,
    fetcher:async (_url,options)=>{
      sentBody=JSON.parse(options.body);
      return {ok:true};
    }
  }
);
assert.equal(await online.flush(),true);
assert.equal(sentBody.events[0].name,"session_started");
assert.equal(sentBody.events[0].dogName,"Bertie");
assert.equal(JSON.parse(values.get(QUEUE_KEY)).length,0);

console.log("analytics.test.js passed");
