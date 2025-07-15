import { songs } from "@/data/songs";

export interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
}

class ContinuousPlaylistService {
  private playlist: PlaylistSong[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private intervalId: NodeJS.Timeout | null = null;
  public onSongChange: ((song: PlaylistSong) => void) | null = null;

  async loadDailyPlaylist() {
    // Convert songs data to playlist format
    this.playlist = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      duration: song.duration
    }));
    
    // Shuffle playlist for variety
    this.shufflePlaylist();
    
    console.log('Daily playlist loaded:', this.playlist.length, 'songs');
  }

  private shufflePlaylist() {
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
  }

  start() {
    if (this.playlist.length === 0) {
      console.log('No playlist loaded');
      return;
    }

    this.isPlaying = true;
    this.playCurrentSong();
    
    // Change song every 3-4 minutes for continuous variety
    this.intervalId = setInterval(() => {
      this.nextSong();
    }, 3.5 * 60 * 1000); // 3.5 minutes
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playCurrentSong() {
    if (this.playlist.length === 0) return;
    
    const currentSong = this.playlist[this.currentIndex];
    console.log('Continuous playlist playing:', currentSong.title);
    
    if (this.onSongChange) {
      this.onSongChange(currentSong);
    }
  }

  private nextSong() {
    if (this.playlist.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    
    // Reshuffle when we complete a cycle
    if (this.currentIndex === 0) {
      this.shufflePlaylist();
    }
    
    this.playCurrentSong();
  }

  getCurrentSong(): PlaylistSong | null {
    if (this.playlist.length === 0) return null;
    return this.playlist[this.currentIndex];
  }

  getPlaylist(): PlaylistSong[] {
    return [...this.playlist];
  }
}

export const continuousPlaylistService = new ContinuousPlaylistService();
