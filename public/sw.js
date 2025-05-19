// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

self.addEventListener('push', (event) => {
  console.log('Push notification received', event);

  try {
    const data = event.data.json();

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

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

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
  }
});

async function syncPlaybackData() {
  console.log('Background sync completed');
}
