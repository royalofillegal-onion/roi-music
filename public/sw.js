
// Enhanced Service Worker for PWA functionality and better page refresh handling

const CACHE_NAME = 'royalstar-music-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/placeholder.svg'
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

// Fetch event - enhanced handling for SPA routing
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle navigation requests (page refreshes)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            return response;
          }
          // If network fails, serve index.html for SPA routing
          return caches.match('/index.html');
        })
        .catch(() => {
          // If both network and cache fail, serve index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle shared song URLs specifically
  if (url.pathname.includes('/share/') || 
      url.pathname.includes('/s/') || 
      url.pathname.includes('/song/') || 
      url.pathname.includes('/shared/') || 
      url.pathname.includes('/music/') || 
      url.pathname.includes('/track/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Handle other requests with cache-first strategy
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
              event.request.url.includes('.js') ||
              event.request.url.includes('.png') ||
              event.request.url.includes('.jpg') ||
              event.request.url.includes('.svg')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // If network request fails for navigation, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
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
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
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
      // Process pending actions when online
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing data:', error);
    return false;
  }
}

// Get pending actions from storage
async function getPendingActions() {
  try {
    // This would typically retrieve data from IndexedDB
    return [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
}

// Handle push notifications for shared songs
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Someone shared a song with you!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'shared-song',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ROI MUSIC', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
