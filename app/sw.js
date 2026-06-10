// Service Worker — App Seguimiento Comercial CMD
// Cache version: increment to force update
var CACHE_NAME = "seguimiento-cmd-v1789";
var FILES_TO_CACHE = [
  "./seguimiento_comercial_CMD.html",
  "./manifest.json"
];

// Install: cache app files
self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate: clean old caches
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener("fetch", function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).catch(function(){
        return caches.match("./seguimiento_comercial_CMD.html");
      });
    })
  );
});