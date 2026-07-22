import assert from "node:assert/strict";
import {
  createAnalytics, sanitiseAnalyticsEvent, validAnalyticsEvent, QUEUE_KEY
} from "../js/analytics.js";

assert.equal(validAnalyticsEvent("session_started"),true);
assert.equal(validAnalyticsEvent("session_saved"),true);
assert.equal(validAnalyticsEvent("dog_name"),false);

assert.deepEqual(
  sanitiseAnalyticsEvent(
    {name:"session_saved",occurredAt:123456},
    "v26"
  ),
  {name:"session_saved",version:"v26",occurredAt:123456}
);

const values=new Map();
const storage={
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>values.set(key,value)
};

let sentBody=null;
const analytics=createAnalytics(
  {
    appVersion:"v26",
    eventEndpoint:"https://events.example.test/events",
    cloudflareWebAnalyticsToken:""
  },
  {
    storage,
    navigatorRef:{onLine:false},
    windowRef:{addEventListener(){}},
    documentRef:null,
    fetcher:async (_url,options)=>{
      sentBody=JSON.parse(options.body);
      return {ok:true};
    }
  }
);

assert.equal(analytics.track("session_started"),true);
assert.equal(JSON.parse(values.get(QUEUE_KEY)).length,1);
assert.equal(analytics.track("not_allowed"),false);

// Create an online instance over the same queue and flush it.
const online=createAnalytics(
  {appVersion:"v26",eventEndpoint:"https://events.example.test/events"},
  {
    storage,
    navigatorRef:{onLine:true},
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
assert.equal(JSON.parse(values.get(QUEUE_KEY)).length,0);

console.log("analytics.test.js passed");
