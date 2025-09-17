// Service Worker for AI Roadmap Planner
const CACHE_NAME = 'ai-roadmap-planner-v1';
const STATIC_CACHE_NAME = 'ai-roadmap-planner-static-v1';
const DYNAMIC_CACHE_NAME = 'ai-roadmap-planner-dynamic-v1';
const MAX_ITEMS = 50; // Maximum number of items in dynamic cache

// Ensure clients is available in all contexts
const clients = self.clients || self.registration?.clients;

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (API calls, etc.)
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', request.url);
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone();

            // Cache dynamic content with size management
            caches.open(DYNAMIC_CACHE_NAME)
              .then(async (cache) => {
                await cache.put(request, responseToCache);
                
                // Check cache size and clean up if necessary
                const keys = await cache.keys();
                if (keys.length > MAX_ITEMS) {
                  // Delete oldest entries (keys[0] is oldest)
                  const entriesToDelete = keys.length - MAX_ITEMS;
                  for (let i = 0; i < entriesToDelete; i++) {
                    await cache.delete(keys[i]);
                  }
                  console.log(`Cleaned up ${entriesToDelete} old cache entries`);
                }
              })
              .catch((error) => {
                console.error('Cache management error:', error);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.log('Network request failed:', request.url, error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for roadmap data
self.addEventListener('sync', (event) => {
  if (event.tag === 'roadmap-sync') {
    console.log('Background sync triggered for roadmap data');
    event.waitUntil(
      // Sync roadmap data when connection is restored
      syncRoadmapData()
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'View Roadmap',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?tab=saved')
    );
  }
});

// Helper function for syncing roadmap data
async function syncRoadmapData() {
  try {
    // Get all clients (open tabs)
    const clients = await self.clients.matchAll();
    
    // Send message to all clients to sync data
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ROADMAP_DATA',
        timestamp: Date.now()
      });
    });
    
    console.log('Roadmap data sync completed');
  } catch (error) {
    console.error('Failed to sync roadmap data:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ROADMAP_DATA') {
    // Cache roadmap data for offline access
    const roadmapData = event.data.data;
    caches.open(DYNAMIC_CACHE_NAME)
      .then(cache => {
        cache.put('/roadmap-data', new Response(JSON.stringify(roadmapData)));
      });
  }
});
