import { useState, useEffect } from 'react';
import { Song } from '@/data/songs';
import { uniqueSongs } from '@/data/allSongs';

export const useSyncBasedPlayback = () => {
  const [currentSync, setCurrentSync] = useState<string | null>(null);
  const [playedSyncs, setPlayedSyncs] = useState<Set<string>>(new Set());
  const [syncQueue, setSyncQueue] = useState<Song[]>([]);
  const [syncHistory, setSyncHistory] = useState<string[]>([]);

  const getSongsBySync = (sync: string): Song[] => {
    return uniqueSongs.filter(song => song.sync === sync);
  };

  const getNextSync = (): string | null => {
    const availableSyncs = ['sad', 'love', 'happy', 'devotional', 'dance', 'action', 'romantic', 'party', 'classical', 'folk'];
    const unplayedSyncs = availableSyncs.filter(sync => !playedSyncs.has(sync));
    
    if (unplayedSyncs.length === 0) {
      // Reset if all syncs have been played
      setPlayedSyncs(new Set());
      return availableSyncs[Math.floor(Math.random() * availableSyncs.length)];
    }
    
    return unplayedSyncs[Math.floor(Math.random() * unplayedSyncs.length)];
  };

  const startSyncPlayback = (initialSong: Song) => {
    if (!initialSong.sync) return [];

    const sync = initialSong.sync;
    setCurrentSync(sync);
    
    const syncSongs = getSongsBySync(sync);
    const startIndex = syncSongs.findIndex(song => song.id === initialSong.id);
    
    // Create queue starting from the selected song
    const queue = startIndex >= 0 
      ? [...syncSongs.slice(startIndex), ...syncSongs.slice(0, startIndex)]
      : syncSongs;
    
    setSyncQueue(queue);
    setSyncHistory(prev => [...prev, sync]);
    
    return queue;
  };

  const getNextSyncSong = (currentSong: Song): Song | null => {
    if (!currentSync || syncQueue.length === 0) return null;

    const currentIndex = syncQueue.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex >= 0 && currentIndex < syncQueue.length - 1) {
      // Return next song in current sync
      return syncQueue[currentIndex + 1];
    } else {
      // Current sync is complete, move to next sync
      setPlayedSyncs(prev => new Set([...prev, currentSync]));
      
      const nextSync = getNextSync();
      if (!nextSync) return null;

      const nextSyncSongs = getSongsBySync(nextSync);
      if (nextSyncSongs.length === 0) return null;

      setCurrentSync(nextSync);
      setSyncQueue(nextSyncSongs);
      setSyncHistory(prev => [...prev, nextSync]);
      
      return nextSyncSongs[0];
    }
  };

  const getSyncProgress = (): { current: number; total: number; syncName: string } => {
    if (!currentSync || syncQueue.length === 0) {
      return { current: 0, total: 0, syncName: '' };
    }

    return {
      current: syncQueue.length,
      total: syncQueue.length,
      syncName: currentSync
    };
  };

  const skipToNextSync = (): Song | null => {
    if (!currentSync) return null;

    setPlayedSyncs(prev => new Set([...prev, currentSync]));
    
    const nextSync = getNextSync();
    if (!nextSync) return null;

    const nextSyncSongs = getSongsBySync(nextSync);
    if (nextSyncSongs.length === 0) return null;

    setCurrentSync(nextSync);
    setSyncQueue(nextSyncSongs);
    setSyncHistory(prev => [...prev, nextSync]);
    
    return nextSyncSongs[0];
  };

  const resetSyncPlayback = () => {
    setCurrentSync(null);
    setPlayedSyncs(new Set());
    setSyncQueue([]);
    setSyncHistory([]);
  };

  const getSyncStats = () => {
    const totalSyncs = ['sad', 'love', 'happy', 'devotional', 'dance', 'action', 'romantic', 'party', 'classical', 'folk'];
    return {
      totalSyncs: totalSyncs.length,
      playedSyncs: playedSyncs.size,
      currentSync,
      syncHistory,
      progress: playedSyncs.size / totalSyncs.length
    };
  };

  return {
    currentSync,
    syncQueue,
    startSyncPlayback,
    getNextSyncSong,
    getSyncProgress,
    skipToNextSync,
    resetSyncPlayback,
    getSyncStats,
    getSongsBySync
  };
};