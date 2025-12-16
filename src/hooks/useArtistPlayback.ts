import { useState, useCallback } from 'react';
import { Song } from '../data/songs';
import { allSongs } from '../data/allSongs';

interface ArtistPlaybackState {
  isEnabled: boolean;
  currentArtist: string | null;
  artistSongs: Song[];
  currentArtistIndex: number;
}

export const useArtistPlayback = () => {
  const [artistState, setArtistState] = useState<ArtistPlaybackState>({
    isEnabled: false,
    currentArtist: null,
    artistSongs: [],
    currentArtistIndex: 0
  });

  const toggleArtistMode = useCallback(() => {
    setArtistState(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled
    }));
  }, []);

  const setArtistPlayback = useCallback((artist: string) => {
    const songsFromArtist = allSongs.filter(song => 
      song.artist.toLowerCase().includes(artist.toLowerCase())
    );
    
    setArtistState({
      isEnabled: true,
      currentArtist: artist,
      artistSongs: songsFromArtist,
      currentArtistIndex: 0
    });
  }, []);

  const getNextArtistSong = useCallback(() => {
    if (!artistState.isEnabled || artistState.artistSongs.length === 0) return null;
    
    const nextSong = artistState.artistSongs[artistState.currentArtistIndex];
    setArtistState(prev => ({
      ...prev,
      currentArtistIndex: (prev.currentArtistIndex + 1) % prev.artistSongs.length
    }));
    
    return nextSong;
  }, [artistState]);

  const stopArtistPlayback = useCallback(() => {
    setArtistState({
      isEnabled: false,
      currentArtist: null,
      artistSongs: [],
      currentArtistIndex: 0
    });
  }, []);

  return {
    artistState,
    toggleArtistMode,
    setArtistPlayback,
    getNextArtistSong,
    stopArtistPlayback
  };
};