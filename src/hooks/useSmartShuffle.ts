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
    
    // Create a diverse pool by mixing songs from different sources
    const shuffledPool = [...basePool].sort(() => Math.random() - 0.5);
    
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

    // Mark current song as played
    if (currentSong) {
      setShuffleState(prev => ({
        ...prev,
        playedHistory: new Set([...prev.playedHistory, currentSong.id]),
        remainingPool: prev.remainingPool.filter(song => song.id !== currentSong.id)
      }));
    }

    // If we've exhausted the current pool, create a new one
    if (shuffleState.remainingPool.length === 0) {
      const newPool = createShufflePool(shuffleState.originalPlaylist || []);
      const freshPool = newPool.filter(song => !shuffleState.playedHistory.has(song.id));
      
      // If we've played everything, reset and start fresh
      if (freshPool.length === 0) {
        const resetPool = createShufflePool(shuffleState.originalPlaylist || []);
        setShuffleState(prev => ({
          ...prev,
          currentPool: resetPool,
          remainingPool: resetPool,
          playedHistory: new Set()
        }));
        return resetPool[0] || null;
      }
      
      setShuffleState(prev => ({
        ...prev,
        remainingPool: freshPool
      }));
      
      return freshPool[0] || null;
    }

    // Return next song from remaining pool
    return shuffleState.remainingPool[0] || null;
  }, [shuffleState, createShufflePool]);

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