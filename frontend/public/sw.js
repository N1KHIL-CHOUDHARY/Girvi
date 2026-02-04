self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("app-cache-v1").then((cache) => {
        return cache.addAll([
          "/",
          "/index.html",
          "/manifest.json"
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
  });
  
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
  