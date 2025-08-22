import { useState, useCallback } from 'react';
import { Song } from '../data/songs';
import { songsBySync, songsByArtist } from '../data/allSongs';

interface SmartPlaybackState {
  currentSyncType: string | null;
  syncQueue: Song[];
  artistMode: boolean;
  currentArtist: string | null;
  autoPlay: boolean;
}

export const useSmartPlayback = () => {
  const [state, setState] = useState<SmartPlaybackState>({
    currentSyncType: null,
    syncQueue: [],
    artistMode: false,
    currentArtist: null,
    autoPlay: true
  });

  const startSyncPlayback = useCallback((song: Song) => {
    const syncType = song.sync || 'uncategorized';
    const syncSongs = songsBySync[syncType] || [];
    
    setState(prev => ({
      ...prev,
      currentSyncType: syncType,
      syncQueue: syncSongs,
      artistMode: false
    }));
    
    return syncSongs;
  }, []);

  const startArtistPlayback = useCallback((artistName: string) => {
    const artistSongs = songsByArtist[artistName.toLowerCase()] || [];
    
    setState(prev => ({
      ...prev,
      artistMode: true,
      currentArtist: artistName.toLowerCase(),
      syncQueue: artistSongs,
      currentSyncType: null
    }));
    
    return artistSongs;
  }, []);

  const getNextSong = useCallback((currentSong: Song): Song | null => {
    if (!state.autoPlay) return null;

    // If in sync mode, get next song from sync queue
    if (state.currentSyncType && state.syncQueue.length > 0) {
      const currentIndex = state.syncQueue.findIndex(s => s.id === currentSong.id);
      if (currentIndex >= 0 && currentIndex < state.syncQueue.length - 1) {
        return state.syncQueue[currentIndex + 1];
      }
      // If sync queue is finished, move to next sync type
      return getNextSyncTypeSongs(state.currentSyncType);
    }

    // If in artist mode, get next song from artist
    if (state.artistMode && state.currentArtist && state.syncQueue.length > 0) {
      const currentIndex = state.syncQueue.findIndex(s => s.id === currentSong.id);
      if (currentIndex >= 0 && currentIndex < state.syncQueue.length - 1) {
        return state.syncQueue[currentIndex + 1];
      }
    }

    return null;
  }, [state]);

  const getNextSyncTypeSongs = useCallback((currentSync: string): Song | null => {
    const syncOrder = ['mass', 'happy', 'love', 'romantic', 'sad', 'devotional', 'action', 'dance', 'folk'];
    const currentIndex = syncOrder.indexOf(currentSync);
    
    if (currentIndex >= 0 && currentIndex < syncOrder.length - 1) {
      const nextSyncType = syncOrder[currentIndex + 1];
      const nextSongs = songsBySync[nextSyncType];
      
      if (nextSongs && nextSongs.length > 0) {
        setState(prev => ({
          ...prev,
          currentSyncType: nextSyncType,
          syncQueue: nextSongs
        }));
        return nextSongs[0];
      }
    }
    
    return null;
  }, []);

  const stopSmartPlayback = useCallback(() => {
    setState({
      currentSyncType: null,
      syncQueue: [],
      artistMode: false,
      currentArtist: null,
      autoPlay: true
    });
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      autoPlay: !prev.autoPlay
    }));
  }, []);

  return {
    state,
    startSyncPlayback,
    startArtistPlayback,
    getNextSong,
    stopSmartPlayback,
    toggleAutoPlay
  };
};