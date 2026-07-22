const QUEUE_KEY="threshold.analytics.queue.v1";
const ALLOWED_EVENTS=new Set(["session_started","session_saved"]);
const MAX_QUEUE=50;
const BATCH_SIZE=20;

export function validAnalyticsEvent(name){
  return ALLOWED_EVENTS.has(name);
}

export function sanitiseAnalyticsEvent(event,version){
  if(!event||!validAnalyticsEvent(event.name)) return null;
  return {
    name:event.name,
    version:String(version||"unknown").slice(0,20),
    occurredAt:Number.isFinite(event.occurredAt)?Math.round(event.occurredAt):Date.now()
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

  function readQueue(){
    try{
      const parsed=JSON.parse(storage.getItem(QUEUE_KEY)||"[]");
      return Array.isArray(parsed)
        ?parsed.map(event=>sanitiseAnalyticsEvent(event,version)).filter(Boolean).slice(-MAX_QUEUE)
        :[];
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

  function track(name){
    if(!endpoint||!validAnalyticsEvent(name)) return false;
    const queue=readQueue();
    queue.push(sanitiseAnalyticsEvent({name,occurredAt:Date.now()},version));
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
