import { useState, useCallback } from 'react';
import { Song } from '../data/songs';
import { uniqueSongs } from '../data/allSongs';

interface SmartShuffleState {
  isEnabled: boolean;
  currentPool: Song[];
  playedHistory: Set<string>;
  remainingPool: Song[];
  originalPlaylist?: Song[];
}

export const useSmartShuffle = () => {
  const [shuffleState, setShuffleState] = useState<SmartShuffleState>({
    isEnabled: false,
    currentPool: [],
    playedHistory: new Set(),
    remainingPool: [],
  });

  const createShufflePool = useCallback((songs: Song[]) => {
    // If playlist is provided, use it, otherwise use all unique songs
    const basePool = songs.length > 0 ? songs : uniqueSongs;
    
    // Fisher-Yates shuffle for O(n) performance instead of sort()
    const shuffledPool = [...basePool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    
    return shuffledPool;
  }, []);

  const enableShuffle = useCallback((playlist?: Song[]) => {
    const pool = createShufflePool(playlist || []);
    
    setShuffleState({
      isEnabled: true,
      currentPool: pool,
      playedHistory: new Set(),
      remainingPool: [...pool],
      originalPlaylist: playlist,
    });

    return pool;
  }, [createShufflePool]);

  const disableShuffle = useCallback(() => {
    setShuffleState({
      isEnabled: false,
      currentPool: [],
      playedHistory: new Set(),
      remainingPool: [],
    });
  }, []);

  const getNextShuffledSong = useCallback((currentSong?: Song) => {
    if (!shuffleState.isEnabled) return null;

    // Get next song immediately for instant response
    const nextSong = shuffleState.remainingPool[0] || null;
    
    // Update state asynchronously to avoid blocking
    setTimeout(() => {
      setShuffleState(prev => {
        const newPlayedHistory = currentSong 
          ? new Set([...prev.playedHistory, currentSong.id])
          : prev.playedHistory;
        
        let newRemainingPool = currentSong 
          ? prev.remainingPool.filter(song => song.id !== currentSong.id)
          : prev.remainingPool.slice(1);

        // If pool is exhausted, quickly generate new one
        if (newRemainingPool.length === 0) {
          const basePool = prev.originalPlaylist || uniqueSongs;
          
          // Quick Fisher-Yates for immediate response
          const freshPool = [...basePool];
          for (let i = freshPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [freshPool[i], freshPool[j]] = [freshPool[j], freshPool[i]];
          }
          
          // Reset history if we've played everything
          const finalHistory = freshPool.every(song => newPlayedHistory.has(song.id)) 
            ? new Set<string>() 
            : newPlayedHistory;
          
          newRemainingPool = freshPool.filter(song => !finalHistory.has(song.id));
          
          return {
            ...prev,
            playedHistory: finalHistory,
            remainingPool: newRemainingPool,
            currentPool: freshPool
          };
        }

        return {
          ...prev,
          playedHistory: newPlayedHistory,
          remainingPool: newRemainingPool
        };
      });
    }, 0);

    return nextSong;
  }, [shuffleState]);

  const getPreviousShuffledSong = useCallback(() => {
    if (!shuffleState.isEnabled) return null;
    
    // For shuffle mode, we can pick a random song from the played history
    // or just return a random song from the pool
    const availableSongs = shuffleState.currentPool.filter(song => 
      shuffleState.playedHistory.has(song.id)
    );
    
    if (availableSongs.length > 0) {
      return availableSongs[Math.floor(Math.random() * availableSongs.length)];
    }
    
    return null;
  }, [shuffleState]);

  const reshufflePool = useCallback(() => {
    if (!shuffleState.isEnabled) return;
    
    const newPool = createShufflePool(shuffleState.originalPlaylist || []);
    setShuffleState(prev => ({
      ...prev,
      currentPool: newPool,
      remainingPool: newPool.filter(song => !prev.playedHistory.has(song.id)),
    }));
  }, [shuffleState.isEnabled, shuffleState.originalPlaylist, createShufflePool]);

  return {
    shuffleState,
    enableShuffle,
    disableShuffle,
    getNextShuffledSong,
    getPreviousShuffledSong,
    reshufflePool,
  };
};