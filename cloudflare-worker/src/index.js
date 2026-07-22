const ALLOWED_EVENTS=new Set(["session_started","session_saved"]);
const MAX_BATCH=20;
const MAX_BODY_BYTES=8192;

function allowedOrigin(request,env){
  const origin=request.headers.get("Origin")||"";
  const allowed=String(env.ALLOWED_ORIGINS||"")
    .split(",")
    .map(value=>value.trim())
    .filter(Boolean);
  return allowed.includes(origin)?origin:"";
}

function corsHeaders(origin){
  return {
    "Access-Control-Allow-Origin":origin,
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type",
    "Access-Control-Max-Age":"86400",
    "Cache-Control":"no-store",
    "Vary":"Origin"
  };
}

function jsonResponse(body,status,origin){
  return new Response(JSON.stringify(body),{
    status,
    headers:{
      ...corsHeaders(origin),
      "Content-Type":"application/json; charset=utf-8"
    }
  });
}

function normaliseEvent(event){
  if(!event||!ALLOWED_EVENTS.has(event.name)) return null;

  const occurredAt=Number(event.occurredAt);
  const now=Date.now();
  const ninetyDays=90*24*60*60*1000;
  if(!Number.isFinite(occurredAt)||occurredAt<now-ninetyDays||occurredAt>now+5*60*1000){
    return null;
  }

  return {
    name:event.name,
    version:String(event.version||"unknown").slice(0,20),
    occurredAt:new Date(occurredAt).toISOString()
  };
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    const origin=allowedOrigin(request,env);

    if(request.method==="OPTIONS"){
      return origin
        ?new Response(null,{status:204,headers:corsHeaders(origin)})
        :new Response(null,{status:403});
    }

    if(url.pathname!=="/events"||request.method!=="POST"){
      return new Response("Not found",{status:404});
    }

    if(!origin){
      return new Response("Origin not allowed",{status:403});
    }

    const length=Number(request.headers.get("Content-Length")||0);
    if(length>MAX_BODY_BYTES){
      return jsonResponse({error:"Request too large"},413,origin);
    }

    let body;
    try{
      body=await request.json();
    }catch{
      return jsonResponse({error:"Invalid JSON"},400,origin);
    }

    if(!body||!Array.isArray(body.events)||body.events.length<1||body.events.length>MAX_BATCH){
      return jsonResponse({error:"Invalid event batch"},400,origin);
    }

    const events=body.events.map(normaliseEvent);
    if(events.some(event=>!event)){
      return jsonResponse({error:"Invalid event"},400,origin);
    }

    const statements=events.map(event=>
      env.DB.prepare(
        "INSERT INTO usage_events (event_name, app_version, occurred_at) VALUES (?1, ?2, ?3)"
      ).bind(event.name,event.version,event.occurredAt)
    );

    await env.DB.batch(statements);
    return new Response(null,{status:204,headers:corsHeaders(origin)});
  }
};
