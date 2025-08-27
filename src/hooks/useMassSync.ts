import { useState, useCallback } from 'react';
import { Song } from '../data/songs';

interface MassSyncState {
  selectedSongs: Song[];
  isActive: boolean;
  currentSyncIndex: number;
}

export const useMassSync = () => {
  const [syncState, setSyncState] = useState<MassSyncState>({
    selectedSongs: [],
    isActive: false,
    currentSyncIndex: 0
  });

  const addToSync = useCallback((song: Song) => {
    setSyncState(prev => ({
      ...prev,
      selectedSongs: [...prev.selectedSongs, song]
    }));
  }, []);

  const removeFromSync = useCallback((songId: string) => {
    setSyncState(prev => ({
      ...prev,
      selectedSongs: prev.selectedSongs.filter(s => s.id !== songId)
    }));
  }, []);

  const startMassSync = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      isActive: true,
      currentSyncIndex: 0
    }));
  }, []);

  const stopMassSync = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      isActive: false,
      currentSyncIndex: 0,
      selectedSongs: []
    }));
  }, []);

  const getNextSyncSong = useCallback(() => {
    if (!syncState.isActive || syncState.selectedSongs.length === 0) return null;
    
    const nextSong = syncState.selectedSongs[syncState.currentSyncIndex];
    setSyncState(prev => ({
      ...prev,
      currentSyncIndex: (prev.currentSyncIndex + 1) % prev.selectedSongs.length
    }));
    
    return nextSong;
  }, [syncState]);

  return {
    syncState,
    addToSync,
    removeFromSync,
    startMassSync,
    stopMassSync,
    getNextSyncSong
  };
};