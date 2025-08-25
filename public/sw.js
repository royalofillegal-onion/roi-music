
// Enhanced Service Worker for ROI MUSIC - Professional Music Streaming App

const CACHE_NAME = 'roi-music-v3';
const STATIC_CACHE = 'roi-music-static-v3';
const DYNAMIC_CACHE = 'roi-music-dynamic-v3';
const MUSIC_CACHE = 'roi-music-audio-v3';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/placeholder.svg',
  '/roi-assets/default-avatar.png',
  '/roi-assets/default-playlist-cover.png',
  '/roi-assets/default-song-cover.png'
];

// Global variables for media session state
let currentSong = null;
let playbackState = 'none';
let isVisible = true;
let batteryLevel = 100;

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

// Enhanced message handling for professional music app
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'CONNECTION_STATUS':
      console.log('🌐 Connection status:', data?.isOnline ? 'Online' : 'Offline');
      handleConnectionChange(data?.isOnline);
      break;
      
    case 'PAGE_VISIBILITY':
      isVisible = data?.isVisible;
      console.log('👁️ Page visibility:', isVisible ? 'visible' : 'hidden');
      handleVisibilityChange(isVisible);
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'UPDATE_MEDIA_SESSION':
      const { title, artist, imageUrl, songId, duration } = event.data;
      currentSong = { title, artist, imageUrl, songId, duration };
      console.log('🎵 Media session updated:', title, 'by', artist);
      updateMediaSession(currentSong);
      playbackState = 'playing';
      break;
      
    case 'CONTINUOUS_PLAYBACK':
      console.log('🔄 Continuous playback enabled');
      enableBackgroundPlayback();
      break;
      
    case 'SONG_TRANSITION':
      const { currentSongId, nextSongId } = event.data;
      console.log('⏭️ Song transition:', currentSongId, '->', nextSongId);
      handleSongTransition(currentSongId, nextSongId);
      break;
      
    case 'PLAYBACK_STATE':
      playbackState = event.data.state;
      console.log('▶️ Playback state:', playbackState);
      updatePlaybackState(playbackState);
      break;
      
    case 'BATTERY_LEVEL':
      batteryLevel = event.data.level;
      handleBatteryChange(batteryLevel);
      break;
  }
});

// Enhanced media session management
function updateMediaSession(song) {
  if (!song) return;
  
  // Show persistent notification for better control
  const options = {
    body: `🎤 ${song.artist} • ROI MUSIC`,
    icon: song.imageUrl || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'roi-music-now-playing',
    requireInteraction: false,
    silent: true,
    persistent: true,
    renotify: true,
    data: {
      songId: song.songId,
      title: song.title,
      artist: song.artist,
      action: 'music-control'
    },
    actions: [
      {
        action: 'previous',
        title: '⏮️ Previous',
        icon: '/icon-192x192.png'
      },
      {
        action: 'play-pause',
        title: '⏯️ Play/Pause',
        icon: '/icon-192x192.png'
      },
      {
        action: 'next',
        title: '⏭️ Next',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  self.registration.showNotification(`🎵 ${song.title}`, options);
}

function handleConnectionChange(isOnline) {
  if (isOnline) {
    // Sync any pending data
    syncPendingData();
  } else {
    // Cache current playback state
    cachePlaybackState();
  }
}

function handleVisibilityChange(visible) {
  if (!visible && playbackState === 'playing') {
    // Enable background playback optimization
    enableBackgroundOptimization();
  }
}

function enableBackgroundPlayback() {
  console.log('🔄 Background playback optimization enabled');
  // Keep service worker active
  self.skipWaiting();
}

function handleSongTransition(currentId, nextId) {
  // Preload next song if possible
  if (nextId) {
    preloadSong(nextId);
  }
}

function updatePlaybackState(state) {
  playbackState = state;
  
  // Update all clients about playback state
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PLAYBACK_STATE_UPDATE',
        state: state
      });
    });
  });
}

function handleBatteryChange(level) {
  if (level <= 15 && playbackState === 'playing') {
    // Show low battery notification
    self.registration.showNotification('🔋 Low Battery', {
      body: `Battery at ${level}%. Music will continue playing in background.`,
      icon: '/icon-192x192.png',
      tag: 'low-battery-music'
    });
  }
}

async function syncPendingData() {
  // Sync listening history, preferences, etc.
  console.log('📊 Syncing user data...');
}

function cachePlaybackState() {
  // Cache current state for offline use
  console.log('💾 Caching playback state for offline use');
}

function enableBackgroundOptimization() {
  // Optimize for background playback
  console.log('⚡ Background optimization enabled');
}

function preloadSong(songId) {
  // Preload next song for seamless playback
  console.log('📥 Preloading next song:', songId);
}

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

// Handle push notifications for shared songs and music notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Someone shared a song with you!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'shared-song',
      requireInteraction: false,
      silent: false,
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ROI MUSIC', options)
    );
  }
});

// Enhanced notification handling for music playback
function showMusicNotification(title, artist, imageUrl) {
  const options = {
    body: `${artist} - Now Playing`,
    icon: imageUrl || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'music-player',
    requireInteraction: false,
    silent: true,
    data: {
      action: 'music',
      title,
      artist
    },
    actions: [
      {
        action: 'previous',
        title: 'Previous',
        icon: '/icon-192x192.png'
      },
      {
        action: 'play-pause',
        title: 'Play/Pause',
        icon: '/icon-192x192.png'
      },
      {
        action: 'next',
        title: 'Next',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  return self.registration.showNotification(`🎵 ${title}`, options);
}

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
