const QUEUE_KEY="threshold.analytics.queue.v2";
const OLD_QUEUE_KEY="threshold.analytics.queue.v1";
const ALLOWED_EVENTS=new Set(["app_open","session_started","session_saved"]);
const ALLOWED_SESSION_TYPES=new Set(["absence","door"]);
const ALLOWED_DEVICE_TYPES=new Set(["mobile","tablet","desktop","unknown"]);
const ALLOWED_DISPLAY_MODES=new Set(["standalone","browser"]);
const MAX_QUEUE=50;
const BATCH_SIZE=20;
const OPEN_DEBOUNCE_MS=5000;

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
  const touchPoints=Number(navigatorRef&&navigatorRef.maxTouchPoints||0);

  let deviceType="desktop";
  if(/ipad|tablet|playbook|silk/.test(ua)||(ua.includes("macintosh")&&touchPoints>1)){
    deviceType="tablet";
  }else if(mobileHint||/mobi|iphone|ipod|android/.test(ua)){
    deviceType="mobile";
  }
  if(!userAgent) deviceType="unknown";

  let browser="Other";
  if(/edg\//.test(ua)) browser="Edge";
  else if(/samsungbrowser\//.test(ua)) browser="Samsung Internet";
  else if(/firefox\//.test(ua)||/fxios\//.test(ua)) browser="Firefox";
  else if(/crios\//.test(ua)||/chrome\//.test(ua)) browser="Chrome";
  else if(/safari\//.test(ua)) browser="Safari";

  let operatingSystem="Other";
  if(/iphone|ipad|ipod/.test(ua)||(ua.includes("macintosh")&&touchPoints>1)){
    operatingSystem="iOS";
  }else if(/android/.test(ua)){
    operatingSystem="Android";
  }else if(/windows/.test(ua)){
    operatingSystem="Windows";
  }else if(/macintosh|mac os x/.test(ua)){
    operatingSystem="macOS";
  }else if(/linux/.test(ua)){
    operatingSystem="Linux";
  }

  return {deviceType,browser,operatingSystem};
}

export function detectDisplayMode(windowRef=globalThis.window,navigatorRef=globalThis.navigator){
  try{
    if(navigatorRef&&navigatorRef.standalone===true) return "standalone";
    if(windowRef&&windowRef.matchMedia&&windowRef.matchMedia("(display-mode: standalone)").matches){
      return "standalone";
    }
  }catch{}
  return "browser";
}

export function sanitiseAnalyticsEvent(event,version){
  if(!event||!validAnalyticsEvent(event.name)) return null;

  const sessionType=ALLOWED_SESSION_TYPES.has(event.sessionType)?event.sessionType:null;
  const deviceType=ALLOWED_DEVICE_TYPES.has(event.deviceType)?event.deviceType:"unknown";
  const displayMode=ALLOWED_DISPLAY_MODES.has(event.displayMode)?event.displayMode:"browser";

  return {
    name:event.name,
    version:String(version||event.version||"unknown").slice(0,20),
    occurredAt:Number.isFinite(event.occurredAt)?Math.round(event.occurredAt):Date.now(),
    dogName:cleanText(event.dogName,40),
    targetSeconds:cleanTarget(event.targetSeconds),
    stopped:typeof event.stopped==="boolean"?event.stopped:null,
    sessionType,
    deviceType,
    browser:cleanText(event.browser,30),
    operatingSystem:cleanText(event.operatingSystem,20),
    displayMode
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
  let hiddenAt=null;
  let lastOpenTrackedAt=0;
  let openDetailsProvider=()=>({});

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
      browser:device.browser,
      operatingSystem:device.operatingSystem,
      displayMode:detectDisplayMode(windowRef,navigatorRef)
    },version);

    const queue=readQueue();
    queue.push(event);
    writeQueue(queue);
    void flush();
    return true;
  }

  function recordOpen(force=false){
    const now=Date.now();
    if(!force&&now-lastOpenTrackedAt<OPEN_DEBOUNCE_MS) return false;
    lastOpenTrackedAt=now;

    let details={};
    try{
      details=openDetailsProvider()||{};
    }catch{}
    return track("app_open",details);
  }

  function init(options={}){
    if(typeof options.openDetails==="function"){
      openDetailsProvider=options.openDetails;
    }

    recordOpen(true);

    if(windowRef&&typeof windowRef.addEventListener==="function"){
      windowRef.addEventListener("online",()=>void flush());
      windowRef.addEventListener("pageshow",event=>{
        if(event&&event.persisted) recordOpen();
      });
    }

    if(documentRef&&typeof documentRef.addEventListener==="function"){
      hiddenAt=documentRef.visibilityState==="hidden"?Date.now():null;
      documentRef.addEventListener("visibilitychange",()=>{
        if(documentRef.visibilityState==="hidden"){
          hiddenAt=Date.now();
          return;
        }
        if(hiddenAt!==null){
          hiddenAt=null;
          recordOpen();
        }
      });
    }

    void flush();
  }

  return {
    init,
    track,
    flush,
    recordOpen,
    webAnalyticsEnabled:()=>!!token,
    eventAnalyticsEnabled:()=>!!endpoint,
    queuedEvents:()=>readQueue().length
  };
}

export { QUEUE_KEY };
