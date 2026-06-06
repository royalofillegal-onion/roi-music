// Background playback service for continuous music in mobile apps and PWAs

export interface BackgroundPlaybackConfig {
  enableWakeLock: boolean;
  enableMediaSession: boolean;
  preloadNextSongs: number;
  backgroundSyncInterval: number;
}

class BackgroundPlaybackService {
  private wakeLock: WakeLockSentinel | null = null;
  private config: BackgroundPlaybackConfig = {
    enableWakeLock: true,
    enableMediaSession: true,
    preloadNextSongs: 3,
    backgroundSyncInterval: 30000 // 30 seconds
  };
  
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map();
  private isServiceWorkerReady = false;

  async initialize() {
    await this.registerServiceWorker();
    await this.requestWakeLock();
    this.setupVisibilityHandling();
    this.setupMediaSessionHandling();
    
    console.log('Background playback service initialized');
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        registration.addEventListener('updatefound', () => {
          console.log('Service worker update found');
        });
        
        if (navigator.serviceWorker.controller) {
          this.isServiceWorkerReady = true;
          console.log('Service worker is controlling the page');
        }
        
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.isServiceWorkerReady = true;
          console.log('Service worker controller changed');
        });
        
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    }
  }

  private async requestWakeLock() {
    if (this.config.enableWakeLock && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired for background playback');
        
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
          this.wakeLock = null;
        });
        
      } catch (error) {
        console.warn('Wake lock request failed:', error);
      }
    }
  }

  private setupVisibilityHandling() {
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        // App went to background
        console.log('App backgrounded - maintaining playback');
        
        // Ensure wake lock is active
        if (!this.wakeLock && this.config.enableWakeLock) {
          await this.requestWakeLock();
        }
        
        // Signal background state to service worker
        this.signalBackgroundState(true);
        
      } else {
        // App came to foreground
        console.log('App foregrounded');
        this.signalBackgroundState(false);
      }
    });
  }

  private setupMediaSessionHandling() {
    // NOTE: Media Session action handlers are owned exclusively by
    // `MediaSessionService` (registered from PlayerContext). Registering them
    // here too would overwrite the working handlers with no-ops and break the
    // pause / next / previous buttons on the lock-screen / Chrome notification.
    // Intentionally a no-op.
    return;
  }

  private signalBackgroundState(isBackground: boolean) {
    if (this.isServiceWorkerReady && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'BACKGROUND_STATE_CHANGE',
        isBackground
      });
    }
  }

  private notifyPlaybackEvent(action: string, details?: any) {
    // Send playback events to main app
    window.dispatchEvent(new CustomEvent('backgroundPlaybackEvent', {
      detail: { action, ...details }
    }));
  }

  async preloadSongs(songUrls: string[]) {
    const urlsToPreload = songUrls.slice(0, this.config.preloadNextSongs);
    
    for (const url of urlsToPreload) {
      if (!this.preloadedAudios.has(url)) {
        try {
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.src = url;
          
          // Don't await loading, just start the process
          audio.load();
          
          this.preloadedAudios.set(url, audio);
          console.log('Preloaded song:', url.split('/').pop());
          
        } catch (error) {
          console.warn('Failed to preload song:', error);
        }
      }
    }
    
    // Clean up old preloaded audios
    if (this.preloadedAudios.size > this.config.preloadNextSongs * 2) {
      const entries = Array.from(this.preloadedAudios.entries());
      const toRemove = entries.slice(0, entries.length - this.config.preloadNextSongs);
      
      toRemove.forEach(([url]) => {
        this.preloadedAudios.delete(url);
      });
    }
  }

  getPreloadedAudio(url: string): HTMLAudioElement | null {
    return this.preloadedAudios.get(url) || null;
  }

  updateMediaSession(metadata: {
    title: string;
    artist: string;
    album?: string;
    artwork?: { src: string; sizes: string; type: string }[];
  }) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album || 'ROI MUSIC',
        artwork: metadata.artwork || [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    }
  }

  setPlaybackState(state: 'playing' | 'paused' | 'none') {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  async enableBackgroundSync() {
    if (this.isServiceWorkerReady && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - Background sync API
        await registration.sync.register('background-music-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  }

  cleanup() {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
    
    this.preloadedAudios.clear();
    console.log('Background playback service cleaned up');
  }
}

export const backgroundPlaybackService = new BackgroundPlaybackService();