const CACHE_NAME = "word-flow-6b805d8";
const urlsToCache = [
  "/",
  "/reviews",
  "/dictionary",
  "/training",
  "/favicon/favicon-16x16.png",
  "/favicon/favicon-32x32.png",
  "/favicon/apple-touch-icon.png",
  "/favicon/android-chrome-192x192.png",
  "/site.webmanifest",
];

// Check if we're running on localhost
const isLocalhost =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname === "::1";

console.log(
  `🔧 SW: Running on ${isLocalhost ? "localhost (caching disabled)" : "production (caching enabled)"}`,
);

// Install event - cache resources
self.addEventListener("install", (event) => {
  // Skip caching on localhost
  if (isLocalhost) {
    console.log("🚫 SW: Skipping cache installation on localhost");
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return Promise.allSettled(
        urlsToCache.map((url) =>
          cache.add(url).catch((error) => {
            console.warn(`Failed to cache ${url}:`, error);
            return null;
          }),
        ),
      );
    }),
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  // On localhost, always fetch from network (no caching)
  if (isLocalhost) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.error("Fetch failed on localhost:", error);
        return new Response("Service Unavailable", { status: 503 });
      }),
    );
    return;
  }

  // Production caching logic
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            // Clone the response to check for auth errors before caching
            const responseToCheck = response.clone();

            // For HTML responses, check if they contain auth errors
            if (response.headers.get("content-type")?.includes("text/html")) {
              return responseToCheck.text().then((text) => {
                // Don't cache responses that contain auth errors
                if (
                  text.includes("AuthApiError") ||
                  text.includes("Invalid Refresh Token")
                ) {
                  console.log("🚫 SW: Not caching response with auth error");
                  return response;
                }

                // Safe to cache - no auth errors detected
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });

                return response;
              });
            }

            // For non-HTML responses, cache normally
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.error("Fetch failed:", error);

            // Return offline page for navigation requests
            if (event.request.destination === "document") {
              return caches.match("/offline.html").then((offlineResponse) => {
                return (
                  offlineResponse || new Response("Offline", { status: 503 })
                );
              });
            }

            // Return a generic offline response for other requests
            return new Response("Service Unavailable", { status: 503 });
          });
      })
      .catch((error) => {
        console.error("Cache match failed:", error);
        return new Response("Cache Error", { status: 500 });
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log("Background sync triggered");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New vocabulary word available!",
    icon: "/favicon/android-chrome-192x192.png",
    badge: "/favicon/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Learn Now",
        icon: "/favicon/favicon-32x32.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/favicon/favicon-32x32.png",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Word Flow", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/words"));
  }
});
