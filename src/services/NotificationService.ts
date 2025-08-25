
// Notification service for managing song notifications and continuous playback

export interface SongNotificationData {
  title: string;
  artist: string;
  imageUrl?: string;
  id: string;
  duration?: number; // Changed from string to number
}

let currentNotificationId: number | null = null;
let notificationTimeout: NodeJS.Timeout | null = null;

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  songId?: string,
  duration?: number
) => {
  try {
    // Cancel any existing notification timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    // Signal to service worker about current song
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_MEDIA_SESSION',
        title,
        artist,
        imageUrl,
        songId,
        duration
      });
    }

    // Enhanced media session
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: 'ROI MUSIC',
        artwork: [
          { src: imageUrl || '/icon-192x192.png', sizes: '96x96', type: 'image/png' },
          { src: imageUrl || '/icon-192x192.png', sizes: '128x128', type: 'image/png' },
          { src: imageUrl || '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: imageUrl || '/icon-512x512.png', sizes: '256x256', type: 'image/png' },
          { src: imageUrl || '/icon-512x512.png', sizes: '384x384', type: 'image/png' },
          { src: imageUrl || '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
      
      navigator.mediaSession.playbackState = 'playing';
      
      // Set position state for better control
      if (duration) {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1,
          position: 0
        });
      }
    }

    // Check if notifications are supported and permitted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        // Cancel existing notification
        if (currentNotificationId) {
          // Close previous notification if it exists
        }

        const notification = new Notification(`🎵 ${title}`, {
          body: `🎤 ${artist} • ROI MUSIC`,
          icon: imageUrl || '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'roi-music-player',
          requireInteraction: false,
          silent: true,
          data: {
            songId,
            title,
            artist,
            imageUrl,
            action: 'music',
            app: 'roi-music'
          }
        });

        // Keep notification persistent during playback
        const closeDelay = duration ? Math.min(duration * 1000, 30000) : 15000;
        notificationTimeout = setTimeout(() => {
          // Don't auto-close if music is still playing
          if (navigator.mediaSession?.playbackState === 'playing') {
            return;
          }
          notification.close();
        }, closeDelay);

        notification.onclick = () => {
          window.focus();
          // Don't close notification, keep it for controls
        };

        console.log('🎵 Enhanced song notification shown:', title);
      } else if (Notification.permission === 'default') {
        // Request permission with better UX
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showSongNotification(title, artist, imageUrl, songId, duration);
          }
        });
      }
    }
  } catch (error) {
    console.log('Notification not supported or failed:', error);
  }
};

export const preNotifyNextSong = (
  title: string,
  artist: string,
  imageUrl?: string,
  songId?: string
) => {
  console.log('Pre-notifying next song:', title, 'by', artist);
  
  // Signal to service worker about upcoming song
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PREFETCH_SONG',
      song: { title, artist, imageUrl, id: songId }
    });
  }
};

export const supportsContinuousPlayback = (): boolean => {
  // Check for various indicators of continuous playback support
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isChrome = userAgent.includes('chrome');
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  return isAndroid || (isChrome && isMobile) || 'mediaSession' in navigator;
};

export const signalSongEnding = (nextSong: SongNotificationData) => {
  console.log('Signaling song ending, next:', nextSong.title);
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SONG_ENDING',
      nextSong
    });
  }
};

export const signalSongTransition = (currentSongId: string, nextSongId: string) => {
  console.log('Signaling song transition from', currentSongId, 'to', nextSongId);
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SONG_TRANSITION',
      currentSongId,
      nextSongId
    });
  }
};

export const forceNextSong = () => {
  console.log('Force next song requested');
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'FORCE_NEXT_SONG'
    });
  }
};

export const cancelNotifications = () => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  
  console.log('Notifications cancelled');
};
