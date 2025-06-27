
// Service Worker for PWA functionality

const CACHE_NAME = 'royalstar-music-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If found in cache, return cached response
      if (response) {
        return response;
      }
      
      // Clone the request for reuse
      const fetchRequest = event.request.clone();
      
      // Make network request and cache the response
      return fetch(fetchRequest)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching and return
          const responseToCache = response.clone();
          
          // Store important assets in cache
          if (event.request.url.includes('/static/') || 
              event.request.url.includes('/icons/') || 
              event.request.url.includes('.css') || 
              event.request.url.includes('.js')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // If network request fails, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONNECTION_STATUS') {
    console.log('Connection status:', event.data.isOnline ? 'Online' : 'Offline');
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('Attempting to sync data in background');
    event.waitUntil(syncData());
  }
});

// Function to sync data when back online
async function syncData() {
  try {
    // Check for any pending data that needs to be synced
    const pendingActions = await getPendingActions();
    
    if (pendingActions && pendingActions.length > 0) {
      console.log('Processing pending actions:', pendingActions.length);
      // Process pending actions
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing data:', error);
    return false;
  }
}

// Example function to get pending actions
async function getPendingActions() {
  // This would typically retrieve data from IndexedDB
  return [];
}
