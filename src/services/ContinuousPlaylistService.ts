
import { supabase } from '@/integrations/supabase/client';

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  image_url?: string;
  duration: number;
  scheduled_time?: string;
}

export class ContinuousPlaylistService {
  private currentIndex = 0;
  private playlist: PlaylistSong[] = [];
  private isActive = false;
  private audioElement: HTMLAudioElement | null = null;
  private intervalId: number | null = null;
  public onSongChange?: (song: PlaylistSong) => void;

  constructor(onSongChangeCallback?: (song: PlaylistSong) => void) {
    this.onSongChange = onSongChangeCallback;
  }

  private initializeAudio(): void {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.volume = 0.15;
      this.audioElement.crossOrigin = "anonymous";
      
      this.audioElement.addEventListener('ended', () => {
        console.log('Song ended, playing next...');
        this.playNext();
      });
      
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setTimeout(() => this.playNext(), 1000);
      });

      this.audioElement.addEventListener('loadstart', () => {
        console.log('Loading audio...');
      });

      this.audioElement.addEventListener('canplaythrough', () => {
        console.log('Audio ready to play');
        if (this.isActive) {
          this.audioElement?.play().catch(console.error);
        }
      });
    }
  }

  async loadDailyPlaylist(): Promise<void> {
    try {
      const { data: videos, error } = await supabase
        .from('scheduled_videos')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.playlist = videos?.map(video => ({
        id: video.id,
        title: video.title,
        artist: 'RoyalStar Music',
        audio_url: video.url,
        image_url: video.thumbnail_url,
        duration: 180
      })) || [];

      console.log(`Loaded ${this.playlist.length} songs for continuous playback`);
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  }

  getCurrentSong(): PlaylistSong | null {
    if (this.playlist.length === 0) return null;
    return this.playlist[this.currentIndex] || null;
  }

  playNext(): PlaylistSong | null {
    if (this.playlist.length === 0) return null;
    
    // Stop current audio properly
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = '';
    }
    
    // Move to next song
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    const currentSong = this.getCurrentSong();
    
    console.log(`Playing song ${this.currentIndex + 1}/${this.playlist.length}: ${currentSong?.title}`);
    
    // Notify song change
    if (currentSong && this.onSongChange) {
      this.onSongChange(currentSong);
    }
    
    // Play the new song
    if (this.isActive && currentSong) {
      this.playAudio(currentSong);
    }
    
    return currentSong;
  }

  private playAudio(song: PlaylistSong): void {
    if (!song || !this.audioElement || !this.isActive) return;
    
    console.log(`Loading audio: ${song.title}`);
    this.audioElement.src = song.audio_url;
    this.audioElement.load();
  }

  start(): void {
    if (this.playlist.length === 0) {
      console.log('No playlist loaded');
      return;
    }

    this.isActive = true;
    this.initializeAudio();
    
    const currentSong = this.getCurrentSong();
    if (currentSong) {
      if (this.onSongChange) {
        this.onSongChange(currentSong);
      }
      this.playAudio(currentSong);
    }

    // Auto-advance every 3 minutes
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = window.setInterval(() => {
      if (this.isActive) {
        this.playNext();
      }
    }, 180000); // 3 minutes

    console.log('Continuous playlist started');
  }

  stop(): void {
    this.isActive = false;
    
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement.src = '';
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  skipToNext(): void {
    if (this.isActive) {
      this.playNext();
    }
  }
}

export const continuousPlaylistService = new ContinuousPlaylistService();
