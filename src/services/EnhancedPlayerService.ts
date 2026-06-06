import { Song } from "@/data/songs";
import { backgroundPlaybackService } from "./BackgroundPlaybackService";
import { continuousPlaylistService } from "./ContinuousPlaylistService";

export interface EnhancedPlayerConfig {
  autoRetryOnError: boolean;
  maxRetries: number;
  seamlessTransition: boolean;
  preloadNextSongs: number;
  crossfadeDuration: number;
}

class EnhancedPlayerService {
  private config: EnhancedPlayerConfig = {
    autoRetryOnError: true,
    maxRetries: 3,
    seamlessTransition: true,
    preloadNextSongs: 2,
    crossfadeDuration: 0.3
  };

  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  private retryCount = 0;
  private isTransitioning = false;
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map();

  async initialize() {
    await backgroundPlaybackService.initialize();
    await continuousPlaylistService.loadDailyPlaylist();
    
    // Setup enhanced event listeners
    this.setupEventListeners();
    
    console.log('Enhanced Player Service initialized');
  }

  private setupEventListeners() {
    // Listen for visibility changes for better background handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleBackgroundMode();
      } else {
        this.handleForegroundMode();
      }
    });

    // Media Session action handlers are owned by MediaSessionService
    // (registered from PlayerContext). Do NOT register them here — it would
    // overwrite the working handlers and break notification buttons.

  }

  async playSong(song: Song, onTimeUpdate?: (time: number) => void, onDurationChange?: (duration: number) => void, onEnded?: () => void) {
    try {
      // Check if we have a preloaded audio for this song
      const preloadedAudio = this.preloadedAudios.get(song.audioUrl);
      
      if (preloadedAudio && preloadedAudio.readyState >= 3) {
        console.log('Using preloaded audio for seamless playback:', song.title);
        this.currentAudio = preloadedAudio;
        this.preloadedAudios.delete(song.audioUrl);
      } else {
        // Create new audio element
        this.currentAudio = new Audio(song.audioUrl);
        this.currentAudio.preload = 'auto';
      }

      // Enhanced error handling
      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        this.handleAudioError(song, onEnded);
      });

      this.currentAudio.addEventListener('stalled', () => {
        console.warn('Audio stalled, attempting recovery...');
        this.handleAudioStall();
      });

      this.currentAudio.addEventListener('canplay', () => {
        console.log('Audio ready to play:', song.title);
        this.retryCount = 0; // Reset on successful load
      });

      // Setup event listeners
      if (onTimeUpdate) {
        this.currentAudio.addEventListener('timeupdate', () => {
          onTimeUpdate(this.currentAudio?.currentTime || 0);
        });
      }

      if (onDurationChange) {
        this.currentAudio.addEventListener('loadedmetadata', () => {
          onDurationChange(this.currentAudio?.duration || 0);
        });
      }

      if (onEnded) {
        this.currentAudio.addEventListener('ended', () => {
          console.log('Song ended naturally:', song.title);
          onEnded();
        });
      }

      // Update media session
      backgroundPlaybackService.updateMediaSession({
        title: song.title,
        artist: song.artist,
        album: 'ROI MUSIC',
        artwork: song.imageUrl ? [
          { src: song.imageUrl, sizes: '192x192', type: 'image/png' },
          { src: song.imageUrl, sizes: '512x512', type: 'image/png' }
        ] : undefined
      });

      // Enhanced play attempt with retry logic
      await this.attemptPlayback();
      
      backgroundPlaybackService.setPlaybackState('playing');
      
      return this.currentAudio;

    } catch (error) {
      console.error('Error playing song:', error);
      throw error;
    }
  }

  private async attemptPlayback(): Promise<void> {
    if (!this.currentAudio) return;

    try {
      await this.currentAudio.play();
      console.log('Playback started successfully');
    } catch (error: any) {
      console.error('Playback failed:', error);
      
      if (error.name === 'NotAllowedError') {
        console.log('Auto-play blocked, waiting for user interaction');
        throw new Error('AUTOPLAY_BLOCKED');
      } else if (this.config.autoRetryOnError && this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        console.log(`Retrying playback (${this.retryCount}/${this.config.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.attemptPlayback();
      } else {
        throw error;
      }
    }
  }

  private handleAudioError(song: Song, onEnded?: () => void) {
    console.error('Audio error for song:', song.title);
    
    if (this.config.autoRetryOnError && this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      console.log(`Retrying audio load (${this.retryCount}/${this.config.maxRetries})`);
      
      setTimeout(() => {
        if (this.currentAudio) {
          this.currentAudio.load();
          this.attemptPlayback().catch(() => {
            console.error('Retry failed, skipping to next song');
            onEnded?.();
          });
        }
      }, 1000);
    } else {
      console.error('Max retries reached, skipping to next song');
      onEnded?.();
    }
  }

  private handleAudioStall() {
    if (this.currentAudio && this.retryCount < this.config.maxRetries) {
      this.retryCount++;
      console.log('Attempting to recover from stall...');
      
      const currentTime = this.currentAudio.currentTime;
      this.currentAudio.load();
      
      this.currentAudio.addEventListener('canplay', () => {
        if (this.currentAudio) {
          this.currentAudio.currentTime = currentTime;
          this.currentAudio.play().catch(console.error);
        }
      }, { once: true });
    }
  }

  async preloadNextSongs(nextSongs: Song[]) {
    const songsToPreload = nextSongs.slice(0, this.config.preloadNextSongs);
    
    for (const song of songsToPreload) {
      if (!this.preloadedAudios.has(song.audioUrl)) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = song.audioUrl;
          
          // Don't await - let it load in background
          audio.load();
          
          this.preloadedAudios.set(song.audioUrl, audio);
          console.log('Preloading song for seamless playback:', song.title);
          
          // Clean up if we have too many preloaded
          if (this.preloadedAudios.size > this.config.preloadNextSongs * 2) {
            const firstKey = this.preloadedAudios.keys().next().value;
            this.preloadedAudios.delete(firstKey);
          }
          
        } catch (error) {
          console.warn('Failed to preload song:', song.title, error);
        }
      }
    }
  }

  pausePlayback() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      backgroundPlaybackService.setPlaybackState('paused');
      console.log('Playback paused');
    }
  }

  resumePlayback() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(error => {
        console.error('Failed to resume playback:', error);
        this.handleAudioError({ audioUrl: this.currentAudio?.src || '' } as Song);
      });
      backgroundPlaybackService.setPlaybackState('playing');
      console.log('Playback resumed');
    }
  }

  seekTo(time: number) {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time;
      console.log('Seeked to:', time);
    }
  }

  setVolume(volume: number) {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getCurrentTime(): number {
    return this.currentAudio?.currentTime || 0;
  }

  getDuration(): number {
    return this.currentAudio?.duration || 0;
  }

  isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }

  private handleBackgroundMode() {
    console.log('App entered background - maintaining playback');
    // Ensure audio continues in background
    if (this.currentAudio && !this.currentAudio.paused) {
      // Force audio to continue by touching currentTime
      const currentTime = this.currentAudio.currentTime;
      this.currentAudio.currentTime = currentTime;
    }
  }

  private handleForegroundMode() {
    console.log('App returned to foreground');
    // Sync UI with audio state
  }

  cleanup() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    if (this.nextAudio) {
      this.nextAudio.pause();
      this.nextAudio = null;
    }

    this.preloadedAudios.forEach(audio => {
      audio.pause();
    });
    this.preloadedAudios.clear();

    backgroundPlaybackService.cleanup();
    console.log('Enhanced Player Service cleaned up');
  }
}

export const enhancedPlayerService = new EnhancedPlayerService();