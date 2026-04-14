/**
 * Spotify-like Media Session API Service
 * Provides lock screen / notification controls with album art, 
 * play/pause/skip buttons, and seek bar on supported platforms.
 * 
 * Audio category: Sets up proper media session for "audio" type playback
 * so the OS treats it as music (not a generic notification).
 */

export interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  onSeekTo: (time: number) => void;
  onSeekForward: (offset: number) => void;
  onSeekBackward: (offset: number) => void;
}

export interface NowPlayingInfo {
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  duration?: number;
  currentTime?: number;
  isPlaying?: boolean;
}

class MediaSessionManager {
  private callbacks: MediaSessionCallbacks | null = null;
  private positionInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Register all media session action handlers (call once on app init).
   */
  registerHandlers(callbacks: MediaSessionCallbacks): void {
    if (!('mediaSession' in navigator)) return;

    this.callbacks = callbacks;

    navigator.mediaSession.setActionHandler('play', () => {
      callbacks.onPlay();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      callbacks.onPause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      callbacks.onNextTrack();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      callbacks.onPreviousTrack();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        callbacks.onSeekTo(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      callbacks.onSeekForward(details.seekOffset ?? 10);
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      callbacks.onSeekBackward(details.seekOffset ?? 10);
    });

    // Try to set stop handler (not supported everywhere)
    try {
      navigator.mediaSession.setActionHandler('stop', () => {
        callbacks.onPause();
      });
    } catch {
      // Not supported
    }
  }

  /**
   * Update the Now Playing metadata (album art, title, artist).
   * This is what appears on the lock screen / notification shade.
   */
  updateMetadata(info: NowPlayingInfo): void {
    if (!('mediaSession' in navigator)) return;

    const artwork: MediaImage[] = [];
    if (info.imageUrl) {
      artwork.push(
        { src: info.imageUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: info.imageUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: info.imageUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: info.imageUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: info.imageUrl, sizes: '384x384', type: 'image/jpeg' },
        { src: info.imageUrl, sizes: '512x512', type: 'image/jpeg' }
      );
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: info.title,
      artist: info.artist,
      album: info.album || 'ROI Music',
      artwork,
    });
  }

  /**
   * Update playback state (playing / paused).
   */
  updatePlaybackState(isPlaying: boolean): void {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }

  /**
   * Update the position state (seek bar on lock screen).
   * Call this on every timeupdate for accurate seek bar.
   */
  updatePositionState(currentTime: number, duration: number, playbackRate: number = 1): void {
    if (!('mediaSession' in navigator)) return;
    if (!duration || !isFinite(duration) || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position: Math.min(currentTime, duration),
      });
    } catch {
      // Position state not supported or invalid values
    }
  }

  /**
   * Start auto-updating position state from an audio element.
   */
  startPositionTracking(audioElement: HTMLAudioElement): void {
    this.stopPositionTracking();
    this.positionInterval = setInterval(() => {
      if (audioElement.duration && isFinite(audioElement.duration)) {
        this.updatePositionState(
          audioElement.currentTime,
          audioElement.duration,
          audioElement.playbackRate
        );
      }
    }, 1000);
  }

  stopPositionTracking(): void {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  /**
   * Clean up all handlers.
   */
  destroy(): void {
    this.stopPositionTracking();
    if (!('mediaSession' in navigator)) return;

    const actions: MediaSessionAction[] = [
      'play', 'pause', 'nexttrack', 'previoustrack',
      'seekto', 'seekforward', 'seekbackward'
    ];
    actions.forEach(action => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // ignore
      }
    });
  }
}

export const mediaSessionManager = new MediaSessionManager();
