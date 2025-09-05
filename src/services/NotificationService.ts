
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

// Custom notification element
let customNotification: HTMLDivElement | null = null;
let notificationTimer: NodeJS.Timeout | null = null;

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  songId?: string,
  duration?: number
) => {
  try {
    // Remove existing notification
    if (customNotification) {
      customNotification.remove();
      customNotification = null;
    }

    // Clear existing timer
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }

    // Create custom notification with controls
    customNotification = document.createElement('div');
    customNotification.className = 'fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 min-w-[320px] max-w-[400px]';
    
    const durationText = duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : '--:--';
    
    customNotification.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${imageUrl || '/icon-192x192.png'}" alt="Album cover" class="w-12 h-12 rounded-md object-cover" />
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate">${title}</div>
          <div class="text-gray-300 text-xs truncate">${artist}</div>
        </div>
        <button id="closeNotification" class="text-gray-400 hover:text-white text-lg">&times;</button>
      </div>
      <div class="flex items-center justify-between mt-3 gap-2">
        <button id="prevBtn" class="p-2 hover:bg-white/10 rounded-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
          </svg>
        </button>
        <button id="playPauseBtn" class="p-2 hover:bg-white/10 rounded-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <button id="nextBtn" class="p-2 hover:bg-white/10 rounded-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
        <div class="text-xs text-gray-300 ml-2">${durationText}</div>
      </div>
    `;

    // Add event listeners
    const closeBtn = customNotification.querySelector('#closeNotification');
    const prevBtn = customNotification.querySelector('#prevBtn');
    const playPauseBtn = customNotification.querySelector('#playPauseBtn');
    const nextBtn = customNotification.querySelector('#nextBtn');

    closeBtn?.addEventListener('click', () => {
      if (customNotification) {
        customNotification.remove();
        customNotification = null;
      }
    });

    prevBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('playerPrevious'));
    });

    playPauseBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('playerTogglePlayPause'));
    });

    nextBtn?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('playerNext'));
    });

    // Add to document
    document.body.appendChild(customNotification);

    // Auto-close after 10 seconds
    notificationTimer = setTimeout(() => {
      if (customNotification) {
        customNotification.remove();
        customNotification = null;
      }
    }, 10000);

    console.log('Custom notification shown:', title);
  } catch (error) {
    console.log('Custom notification failed:', error);
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
