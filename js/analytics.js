const QUEUE_KEY="threshold.analytics.queue.v2";
const OLD_QUEUE_KEY="threshold.analytics.queue.v1";
const ALLOWED_EVENTS=new Set(["session_started","session_saved"]);
const ALLOWED_SESSION_TYPES=new Set(["absence","door"]);
const ALLOWED_DEVICE_TYPES=new Set(["mobile","tablet","desktop","unknown"]);
const MAX_QUEUE=50;
const BATCH_SIZE=20;

export function validAnalyticsEvent(name){
  return ALLOWED_EVENTS.has(name);
}

function cleanText(value,max){
  const text=typeof value==="string"?value.trim():"";
  return text?text.slice(0,max):null;
}

function cleanTarget(value){
  const target=Number(value);
  return Number.isFinite(target)&&target>=1&&target<=14400?Math.round(target):null;
}

export function detectDevice(navigatorRef=globalThis.navigator){
  const userAgent=String(navigatorRef&&navigatorRef.userAgent||"");
  const ua=userAgent.toLowerCase();
  const mobileHint=!!(navigatorRef&&navigatorRef.userAgentData&&navigatorRef.userAgentData.mobile);

  let deviceType="desktop";
  if(/ipad|tablet|playbook|silk/.test(ua)) deviceType="tablet";
  else if(mobileHint||/mobi|iphone|ipod|android/.test(ua)) deviceType="mobile";
  if(!userAgent) deviceType="unknown";

  let browser="Other";
  if(/edg\//.test(ua)) browser="Edge";
  else if(/samsungbrowser\//.test(ua)) browser="Samsung Internet";
  else if(/firefox\//.test(ua)||/fxios\//.test(ua)) browser="Firefox";
  else if(/crios\//.test(ua)||/chrome\//.test(ua)) browser="Chrome";
  else if(/safari\//.test(ua)) browser="Safari";

  return {deviceType,browser};
}

export function sanitiseAnalyticsEvent(event,version){
  if(!event||!validAnalyticsEvent(event.name)) return null;

  const sessionType=ALLOWED_SESSION_TYPES.has(event.sessionType)?event.sessionType:null;
  const deviceType=ALLOWED_DEVICE_TYPES.has(event.deviceType)?event.deviceType:"unknown";

  return {
    name:event.name,
    version:String(version||event.version||"unknown").slice(0,20),
    occurredAt:Number.isFinite(event.occurredAt)?Math.round(event.occurredAt):Date.now(),
    dogName:cleanText(event.dogName,40),
    targetSeconds:cleanTarget(event.targetSeconds),
    stopped:typeof event.stopped==="boolean"?event.stopped:null,
    sessionType,
    deviceType,
    browser:cleanText(event.browser,30)
  };
}

export function createAnalytics(config={},dependencies={}){
  const storage=dependencies.storage??globalThis.localStorage;
  const fetcher=dependencies.fetcher??globalThis.fetch;
  const documentRef=dependencies.documentRef??globalThis.document;
  const windowRef=dependencies.windowRef??globalThis.window;
  const navigatorRef=dependencies.navigatorRef??globalThis.navigator;

  const version=String(config.appVersion||"unknown").slice(0,20);
  const token=String(config.cloudflareWebAnalyticsToken||"").trim();
  const endpoint=String(config.eventEndpoint||"").trim();
  let flushing=false;

  function readStored(key){
    try{
      const parsed=JSON.parse(storage.getItem(key)||"[]");
      return Array.isArray(parsed)?parsed:[];
    }catch{
      return [];
    }
  }

  function readQueue(){
    try{
      const current=readStored(QUEUE_KEY);
      const legacy=current.length?[]:readStored(OLD_QUEUE_KEY);
      const queue=(current.length?current:legacy)
        .map(event=>sanitiseAnalyticsEvent(event,version))
        .filter(Boolean)
        .slice(-MAX_QUEUE);

      if(legacy.length){
        storage.setItem(QUEUE_KEY,JSON.stringify(queue));
        storage.removeItem(OLD_QUEUE_KEY);
      }
      return queue;
    }catch{
      return [];
    }
  }

  function writeQueue(queue){
    try{
      storage.setItem(QUEUE_KEY,JSON.stringify(queue.slice(-MAX_QUEUE)));
      return true;
    }catch{
      return false;
    }
  }

  function installWebAnalytics(){
    if(!token||!documentRef||documentRef.querySelector("[data-threshold-web-analytics]")){
      return false;
    }

    const script=documentRef.createElement("script");
    script.defer=true;
    script.src="https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute("data-cf-beacon",JSON.stringify({token,spa:false}));
    script.setAttribute("data-threshold-web-analytics","true");
    (documentRef.head||documentRef.body||documentRef.documentElement).appendChild(script);
    return true;
  }

  async function flush(){
    if(flushing||!endpoint||typeof fetcher!=="function") return false;
    if(navigatorRef&&navigatorRef.onLine===false) return false;

    const queue=readQueue();
    if(!queue.length) return true;

    flushing=true;
    const batch=queue.slice(0,BATCH_SIZE);
    try{
      const response=await fetcher(endpoint,{
        method:"POST",
        mode:"cors",
        credentials:"omit",
        cache:"no-store",
        keepalive:true,
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({events:batch})
      });

      if(!response.ok) return false;
      writeQueue(queue.slice(batch.length));
      return true;
    }catch{
      return false;
    }finally{
      flushing=false;
    }
  }

  function track(name,details={}){
    if(!endpoint||!validAnalyticsEvent(name)) return false;

    const device=detectDevice(navigatorRef);
    const event=sanitiseAnalyticsEvent({
      name,
      occurredAt:Date.now(),
      dogName:details.dogName,
      targetSeconds:details.targetSeconds,
      stopped:details.stopped,
      sessionType:details.sessionType,
      deviceType:device.deviceType,
      browser:device.browser
    },version);

    const queue=readQueue();
    queue.push(event);
    writeQueue(queue);
    void flush();
    return true;
  }

  function init(){
    installWebAnalytics();
    if(windowRef&&typeof windowRef.addEventListener==="function"){
      windowRef.addEventListener("online",()=>void flush());
    }
    void flush();
  }

  return {
    init,
    track,
    flush,
    webAnalyticsEnabled:()=>!!token,
    eventAnalyticsEnabled:()=>!!endpoint,
    queuedEvents:()=>readQueue().length
  };
}

export { QUEUE_KEY };
