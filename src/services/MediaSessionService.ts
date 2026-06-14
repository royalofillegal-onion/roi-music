/**
 * Spotify-like Media Session API Service
 * Provides lock screen / notification controls with album art, 
 * play/pause/skip buttons, and seek bar on supported platforms.
 * 
 * Audio category: Sets up proper media session for "audio" type playback
 * so the OS treats it as music (not a generic notification).
 * 
 * Enhanced with rainbow gradient colors and RoiMusic branding.
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
  private artworkCanvas: HTMLCanvasElement | null = null;

  /**
   * Register all media session action handlers (call once on app init).
   */
  registerHandlers(callbacks: MediaSessionCallbacks): void {
    if (!('mediaSession' in navigator)) return;

    this.callbacks = callbacks;

    const emit = (action: string, extra?: Record<string, unknown>) => {
      try {
        window.dispatchEvent(new CustomEvent('mediasession:action', {
          detail: { action, at: Date.now(), ...extra },
        }));
      } catch { /* ignore */ }
    };

    navigator.mediaSession.setActionHandler('play', () => {
      emit('play');
      callbacks.onPlay();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      emit('pause');
      callbacks.onPause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      emit('next');
      callbacks.onNextTrack();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      emit('previous');
      callbacks.onPreviousTrack();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        emit('seekto', { seekTime: details.seekTime });
        callbacks.onSeekTo(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      emit('seekforward');
      callbacks.onSeekForward(details.seekOffset ?? 10);
    });

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      emit('seekbackward');
      callbacks.onSeekBackward(details.seekOffset ?? 10);
    });

    try {
      navigator.mediaSession.setActionHandler('stop', () => {
        emit('stop');
        callbacks.onPause();
      });
    } catch {
      // Not supported
    }
  }

  /**
   * Create enhanced artwork with rainbow border and RoiMusic branding.
   * This generates a canvas-based image for the notification.
   */
  private async createEnhancedArtwork(imageUrl: string, size: number): Promise<string> {
    return new Promise((resolve) => {
      if (!this.artworkCanvas) {
        this.artworkCanvas = document.createElement('canvas');
      }
      const canvas = this.artworkCanvas;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Rainbow gradient background border
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.17, '#ff7700');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.67, '#0077ff');
        gradient.addColorStop(0.83, '#8b00ff');
        gradient.addColorStop(1, '#ff0099');

        // Fill rainbow border
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Draw album art with padding for border
        const borderWidth = Math.floor(size * 0.04);
        const artSize = size - borderWidth * 2;
        const radius = Math.floor(size * 0.06);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(borderWidth, borderWidth, artSize, artSize, radius);
        ctx.clip();
        ctx.drawImage(img, borderWidth, borderWidth, artSize, artSize);
        ctx.restore();

        // RoiMusic branding at bottom
        const bannerHeight = Math.floor(size * 0.12);
        const bannerY = size - bannerHeight - borderWidth;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(borderWidth, bannerY, artSize, bannerHeight);

        // Rainbow text for "ROI MUSIC"
        const fontSize = Math.floor(size * 0.055);
        ctx.font = `bold ${fontSize}px 'Inter', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textGradient = ctx.createLinearGradient(
          size * 0.3, bannerY, size * 0.7, bannerY + bannerHeight
        );
        textGradient.addColorStop(0, '#00e5ff');
        textGradient.addColorStop(0.5, '#d946ef');
        textGradient.addColorStop(1, '#f97316');

        ctx.fillStyle = textGradient;
        ctx.fillText('♪ ROI MUSIC', size / 2, bannerY + bannerHeight / 2);

        try {
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(imageUrl);
        }
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  }

  /**
   * Update the Now Playing metadata (album art, title, artist).
   * This is what appears on the lock screen / notification shade.
   * Enhanced with rainbow-bordered artwork and RoiMusic branding.
   */
  async updateMetadata(info: NowPlayingInfo): Promise<void> {
    if (!('mediaSession' in navigator)) return;

    const sizes = [96, 128, 192, 256, 384, 512];
    const baseArtwork: MediaImage[] = info.imageUrl
      ? sizes.map((s) => ({ src: info.imageUrl!, sizes: `${s}x${s}`, type: 'image/jpeg' }))
      : [];

    // Set metadata IMMEDIATELY (synchronously) so the OS shows the
    // notification with correct title/artist + transport controls right away.
    // Without this, async artwork generation can delay or block the
    // notification from ever appearing on some Android browsers.
    navigator.mediaSession.metadata = new MediaMetadata({
      title: info.title,
      artist: info.artist,
      album: info.album || 'ROI Music',
      artwork: baseArtwork,
    });

    // Then asynchronously upgrade to rainbow-bordered artwork (best-effort).
    if (info.imageUrl) {
      try {
        const enhanced = await this.createEnhancedArtwork(info.imageUrl, 512);
        if (enhanced.startsWith('data:')) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: info.title,
            artist: info.artist,
            album: info.album || 'ROI Music',
            artwork: sizes.map((s) => ({ src: enhanced, sizes: `${s}x${s}`, type: 'image/png' })),
          });
        }
      } catch {
        // keep base artwork
      }
    }
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
