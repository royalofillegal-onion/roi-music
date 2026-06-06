
// Notification service for managing song notifications and continuous playback

export interface SongNotificationData {
  title: string;
  artist: string;
  imageUrl?: string;
  id: string;
  duration?: number; // Changed from string to number
}

interface NowPlayingPayload extends SongNotificationData {
  isPlaying: boolean;
}

let currentNotificationId: number | null = null;
let notificationTimeout: ReturnType<typeof setTimeout> | null = null;

// Custom notification element
let customNotification: HTMLDivElement | null = null;
let notificationTimer: ReturnType<typeof setTimeout> | null = null;
let browserNotification: Notification | null = null;

const NOW_PLAYING_TAG = 'roi-music-now-playing';

const formatDuration = (duration?: number) => {
  if (!duration || Number.isNaN(duration)) return '--:--';
  return `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
};

const clearCustomNotificationTimer = () => {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
};

const postToServiceWorker = async (message: Record<string, unknown>) => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active || navigator.serviceWorker.controller;
    if (!worker) return false;

    worker.postMessage(message);
    return true;
  } catch (error) {
    console.log('Service worker messaging failed:', error);
    return false;
  }
};

const renderCustomNotification = ({
  title,
  artist,
  imageUrl,
  duration,
  isPlaying,
}: NowPlayingPayload) => {
  if (customNotification) {
    customNotification.remove();
    customNotification = null;
  }

  clearCustomNotificationTimer();

  customNotification = document.createElement('div');
  customNotification.className = 'fixed top-4 right-4 z-50 min-w-[320px] max-w-[400px] rounded-lg border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl';

  customNotification.innerHTML = `
    <div class="flex items-center gap-3 p-4">
      <img src="${imageUrl || '/icon-192x192.png'}" alt="Album cover" class="interactive h-12 w-12 rounded-md object-cover" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-semibold">${title}</div>
        <div class="truncate text-xs text-muted-foreground">${artist}</div>
      </div>
      <button id="closeNotification" class="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent/15 hover:text-accent-foreground" aria-label="Close notification">&times;</button>
    </div>
    <div class="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
      <button id="prevBtn" class="rounded-full p-2 text-foreground transition-colors hover:bg-accent/15" aria-label="Previous track">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
        </svg>
      </button>
      <button id="playPauseBtn" class="rounded-full p-2 text-foreground transition-colors hover:bg-accent/15" aria-label="${isPlaying ? 'Pause' : 'Play'}">
        ${isPlaying
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'}
      </button>
      <button id="nextBtn" class="rounded-full p-2 text-foreground transition-colors hover:bg-accent/15" aria-label="Next track">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="m6 18 8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </button>
      <div class="ml-2 text-xs text-muted-foreground">${formatDuration(duration)}</div>
    </div>
  `;

  const closeBtn = customNotification.querySelector('#closeNotification');
  const prevBtn = customNotification.querySelector('#prevBtn');
  const playPauseBtn = customNotification.querySelector('#playPauseBtn');
  const nextBtn = customNotification.querySelector('#nextBtn');

  closeBtn?.addEventListener('click', () => {
    clearSongNotification();
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

  document.body.appendChild(customNotification);

  notificationTimer = setTimeout(() => {
    if (customNotification) {
      customNotification.remove();
      customNotification = null;
    }
  }, 10000);
};

const showBrowserNowPlayingNotification = async (payload: NowPlayingPayload) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const pushedToServiceWorker = await postToServiceWorker({
    type: 'SHOW_NOW_PLAYING',
    payload,
  });

  if (pushedToServiceWorker) return;

  try {
    browserNotification?.close();
    browserNotification = new Notification(payload.title, {
      body: payload.artist,
      icon: payload.imageUrl || '/icon-192x192.png',
      tag: NOW_PLAYING_TAG,
      silent: true,
    });
  } catch (error) {
    console.log('Browser notification failed:', error);
  }
};

export const ensureMediaNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.log('Notification permission request failed:', error);
    return Notification.permission;
  }
};

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  songId?: string,
  duration?: number,
  isPlaying: boolean = true,
) => {
  try {
    const payload: NowPlayingPayload = {
      title,
      artist,
      imageUrl,
      id: songId || title,
      duration,
      isPlaying,
    };

    renderCustomNotification(payload);
    void showBrowserNowPlayingNotification(payload);

    console.log('Custom notification shown:', title);
  } catch (error) {
    console.log('Custom notification failed:', error);
  }
};

export const clearSongNotification = () => {
  if (customNotification) {
    customNotification.remove();
    customNotification = null;
  }

  clearCustomNotificationTimer();
  browserNotification?.close();
  browserNotification = null;
  void postToServiceWorker({ type: 'CLEAR_NOW_PLAYING' });
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
