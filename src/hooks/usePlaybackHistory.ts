import { useState, useEffect } from 'react';
import { Song } from '../data/Song';

interface PlaybackHistory {
  playedSongs: Set<string>;
  addToHistory: (songId: string) => void;
  resetHistory: () => void;
  getNextUnplayedSong: (songs: Song[], currentIndex: number) => Song | null;
}

export const usePlaybackHistory = (): PlaybackHistory => {
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('playback-history');
    if (saved) {
      setPlayedSongs(new Set(JSON.parse(saved)));
    }
  }, []);

  const addToHistory = (songId: string) => {
    setPlayedSongs(prev => {
      const newSet = new Set(prev);
      newSet.add(songId);
      localStorage.setItem('playback-history', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const resetHistory = () => {
    setPlayedSongs(new Set());
    localStorage.removeItem('playback-history');
  };

  const getNextUnplayedSong = (songs: Song[], currentIndex: number): Song | null => {
    // Find next unplayed song starting from current position
    for (let i = currentIndex + 1; i < songs.length; i++) {
      if (!playedSongs.has(songs[i].id)) {
        return songs[i];
      }
    }
    
    // If no unplayed songs after current, check from beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!playedSongs.has(songs[i].id)) {
        return songs[i];
      }
    }
    
    // If all songs played, reset and start over
    if (playedSongs.size >= songs.length) {
      resetHistory();
      return songs[0];
    }
    
    return null;
  };

  return {
    playedSongs,
    addToHistory,
    resetHistory,
    getNextUnplayedSong
  };
};