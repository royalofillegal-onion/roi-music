
// Service Worker for Push Notifications and Media Playback

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Cache current song info for media notifications
let currentMediaInfo = {
  title: '',
  artist: '',
  albumArt: '',
  isPlaying: false
};

self.addEventListener('push', (event) => {
  console.log('Push notification received', event);

  try {
    const data = event.data.json();

    // Check if this is a media notification
    if (data.type === 'media') {
      currentMediaInfo = {
        title: data.title || 'Now Playing',
        artist: data.artist || '',
        albumArt: data.icon || '/icon-192x192.png',
        isPlaying: data.isPlaying || false
      };
      
      // Show media notification
      const title = data.title || 'RoyalStar Music';
      const options = {
        body: data.artist || 'Now playing',
        icon: data.icon || '/icon-192x192.png',
        badge: '/badge-96x96.png',
        image: data.icon || null,
        vibrate: [100, 50, 100],
        tag: 'media-playback',
        actions: [
          {
            action: 'previous',
            title: 'Previous'
          },
          {
            action: data.isPlaying ? 'pause' : 'play',
            title: data.isPlaying ? 'Pause' : 'Play'
          },
          {
            action: 'next',
            title: 'Next'
          }
        ],
        data: {
          type: 'media',
          url: data.url || '/'
        }
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
      return;
    }

    // Handle regular notifications
    const title = data.title || 'RoyalStar Music';
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
    event.waitUntil(
      self.registration.showNotification('RoyalStar Music', {
        body: 'New activity in your account',
        icon: '/icon-192x192.png',
        badge: '/badge-96x96.png',
        vibrate: [100, 50, 100]
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);

  const notification = event.notification;
  const action = event.action;
  
  // Close notification
  notification.close();

  // Handle media controls
  if (notification.data && notification.data.type === 'media') {
    if (action === 'play' || action === 'pause' || action === 'next' || action === 'previous') {
      // Send message to all clients about media action
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'media-control',
            action: action
          });
        });
      });
      
      return;
    }
  }

  // Handle regular notification click
  const urlToOpen = notification.data && notification.data.url ? notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-playback-data') {
    console.log('Syncing playback data in background');
    event.waitUntil(syncPlaybackData());
  } else if (event.tag === 'media-notification-update') {
    console.log('Updating media notification');
    event.waitUntil(updateMediaNotification());
  }
});

async function syncPlaybackData() {
  console.log('Background sync completed');
  // Implement logic to sync playback position with server if needed
}

async function updateMediaNotification() {
  if (currentMediaInfo.title) {
    return self.registration.showNotification(currentMediaInfo.title, {
      body: currentMediaInfo.artist,
      icon: currentMediaInfo.albumArt,
      badge: '/badge-96x96.png',
      tag: 'media-playback',
      actions: [
        {
          action: 'previous',
          title: 'Previous'
        },
        {
          action: currentMediaInfo.isPlaying ? 'pause' : 'play',
          title: currentMediaInfo.isPlaying ? 'Pause' : 'Play'
        },
        {
          action: 'next',
          title: 'Next'
        }
      ],
      data: {
        type: 'media'
      }
    });
  }
}

// Listen to message events for updating notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_MEDIA_INFO') {
    currentMediaInfo = {
      ...currentMediaInfo,
      ...event.data.mediaInfo
    };
    
    // Update notification if requested
    if (event.data.updateNotification) {
      updateMediaNotification();
    }
  }
});
