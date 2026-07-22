/* Threshold service worker.
   Two jobs: make the app work with no signal, and make it installable.
   Bump CACHE when you change any file, or browsers will serve the old one. */
var PREFIX = "threshold-";
var CACHE = PREFIX + "v35";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./js/app.js",
  "./js/storage.js",
  "./js/progression.js",
  "./js/timer.js",
  "./js/ui.js",
  "./js/state.js",
  "./js/sessions.js",
  "./js/charts.js",
  "./js/settings.js",
  "./js/dashboard.js",
  "./js/target-reason.js",
  "./js/analytics.js",
  "./js/analytics-config.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      // don't let one missing file sink the whole install
      return Promise.all(SHELL.map(function(u){
        return c.add(u).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k===CACHE || k.indexOf(PREFIX)!==0 ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;

  var isPage = req.mode === "navigate" ||
    (req.headers.get("accept")||"").indexOf("text/html") > -1;

  if(isPage){
    // Network first, so a redeploy reaches people; cache is the fallback.
    e.respondWith(
      fetch(req).then(function(res){
        if(res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put("./index.html", copy); });
        }
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(r){ return r || caches.match("./"); });
      })
    );
    return;
  }

  // Everything else (icons, fonts): cache first, fill in behind.
  e.respondWith(
    caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(res){
        if(res && (res.status===200 || res.type==="opaque")){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
    })
  );
});


self.addEventListener("notificationclick", function(e){
  e.notification.close();
  var target=e.notification.data&&e.notification.data.url
    ?e.notification.data.url
    :self.registration.scope;

  e.waitUntil(
    clients.matchAll({type:"window",includeUncontrolled:true}).then(function(list){
      for(var i=0;i<list.length;i++){
        if(list[i].url.indexOf(self.registration.scope)===0&&"focus" in list[i]){
          return list[i].focus();
        }
      }
      return clients.openWindow ? clients.openWindow(target) : null;
    })
  );
});
