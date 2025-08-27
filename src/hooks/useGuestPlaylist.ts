import { useState, useEffect } from 'react';
import { Song } from '@/data/songs';

const GUEST_PLAYLIST_KEY = '444_guest_playlist';

export const useGuestPlaylist = () => {
  const [guestPlaylist, setGuestPlaylist] = useState<Song[]>([]);

  // Load guest playlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(GUEST_PLAYLIST_KEY);
    if (saved) {
      try {
        setGuestPlaylist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading guest playlist:', error);
      }
    }
  }, []);

  // Save to localStorage whenever playlist changes
  useEffect(() => {
    localStorage.setItem(GUEST_PLAYLIST_KEY, JSON.stringify(guestPlaylist));
  }, [guestPlaylist]);

  const addToGuestPlaylist = (song: Song) => {
    setGuestPlaylist(prev => {
      // Check if song already exists
      if (prev.some(s => s.id === song.id)) {
        return prev;
      }
      return [...prev, song];
    });
  };

  const removeFromGuestPlaylist = (songId: string) => {
    setGuestPlaylist(prev => prev.filter(song => song.id !== songId));
  };

  const clearGuestPlaylist = () => {
    setGuestPlaylist([]);
  };

  const isInGuestPlaylist = (songId: string) => {
    return guestPlaylist.some(song => song.id === songId);
  };

  return {
    guestPlaylist,
    addToGuestPlaylist,
    removeFromGuestPlaylist,
    clearGuestPlaylist,
    isInGuestPlaylist,
    playlistCount: guestPlaylist.length
  };
};