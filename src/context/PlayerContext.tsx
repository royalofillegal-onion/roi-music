import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";
import { supabase } from "@/integrations/supabase/client";
import { 
  showAndroidNotification, 
  signalContinuousPlayback,
  enableContinuousPlayback,
  registerMediaSession 
} from "@/services/androidNotification";
import { 
  showSongNotification,
  cancelNotifications
} from "@/services/NotificationService";
import { showNotification } from "@/utils/notificationUtils";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  isShuffled: boolean;
  isRepeating: boolean;
  likedSongs: string[];
  isLiveMode: boolean;
  playMode: 'sequence' | 'shuffle' | 'repeat';
  recentlyPlayed: Song[];
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seek: (time: number) => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (songId: string) => void;
  toggleLikeSong: (songId: string) => Promise<boolean>;
  isLiked: (songId: string) => boolean;
  setIsLiveMode: (isLive: boolean) => void;
  setPlaybackMode: (mode: 'sequence' | 'shuffle' | 'repeat') => void;
  playLikedSongs: () => void;
  playPlaylist: (songs: Song[]) => void;
  continuousPlayback: boolean;
  setContinuousPlayback: (value: boolean) => void;
  autoPlayArtist: boolean;
  setAutoPlayArtist: (value: boolean) => void;
  playArtistSongs: (artistName: string, allSongs: Song[], startingSong?: Song) => void;
  circularQueue: Song[];
  currentQueueIndex: number;
  createCircularQueue: (songs: Song[], startingSong?: Song) => Song[];
  playOnceMode: boolean;
  setPlayOnceMode: (value: boolean) => void;
  resetPlayHistory: () => void;
  playedSongsHistory: Set<string>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [playMode, setPlayMode] = useState<'sequence' | 'shuffle' | 'repeat'>('sequence');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [continuousPlayback, setContinuousPlayback] = useState(true);
  const [autoPlayArtist, setAutoPlayArtist] = useState(true);
  const [circularQueue, setCircularQueue] = useState<Song[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [playedSongsHistory, setPlayedSongsHistory] = useState<Set<string>>(new Set());
  const [playOnceMode, setPlayOnceMode] = useState(false);
  const [shuffleHistory, setShuffleHistory] = useState<Set<string>>(new Set());
  const [shuffleQueue, setShuffleQueue] = useState<Song[]>([]);
  const [audioLoadingRetries, setAudioLoadingRetries] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize background playback service
    const initBackgroundPlayback = async () => {
      try {
        const { backgroundPlaybackService } = await import('@/services/BackgroundPlaybackService');
        await backgroundPlaybackService.initialize();
        
        // Listen for background playback events
        window.addEventListener('backgroundPlaybackEvent', (event: CustomEvent) => {
          const { action, seekTime } = event.detail;
          
          switch (action) {
            case 'play':
              resumeSong();
              break;
            case 'pause':
              pauseSong();
              break;
            case 'previoustrack':
              previousSong();
              break;
            case 'nexttrack':
              nextSong();
              break;
            case 'seekto':
              if (seekTime !== undefined) {
                seek(seekTime);
              }
              break;
          }
        });
        
      } catch (error) {
        console.warn('Background playback service initialization failed:', error);
      }
    };
    
    initBackgroundPlayback();
    
    return () => {
      // Cleanup will be handled by the service
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      // Initialize enhanced player service
      const initEnhancedPlayer = async () => {
        try {
          const { enhancedPlayerService } = await import('@/services/EnhancedPlayerService');
          await enhancedPlayerService.initialize();
        } catch (error) {
          console.warn('Enhanced player service initialization failed:', error);
        }
      };
      
      initEnhancedPlayer();
      enableContinuousPlayback();
      signalContinuousPlayback();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      console.log('Song ended, checking for next action...');
      
      if (isRepeating) {
        console.log('Repeat mode: replaying current song');
        if (audioRef.current && currentSong) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            showAndroidNotification(
              `🔁 Repeating: ${currentSong.title}`, 
              `${currentSong.artist} - ROI MUSIC HD`
            );
          }).catch(error => {
            console.error("Error repeating song:", error);
            handlePlaybackError();
          });
        }
        return;
      }
      
      // Reset retry counter on successful song completion
      setAudioLoadingRetries(0);
      
      if (queue.length > 0 || circularQueue.length > 0) {
        console.log('Playing next from queue/circular queue');
        nextSong();
      } else if (continuousPlayback) {
        console.log('Continuous playback enabled, playing next song');
        showAndroidNotification(
          "🎵 Continuing playback...", 
          "Finding your next song - ROI MUSIC HD"
        );
        
        // Enhanced continuous playback with error handling
        setTimeout(() => {
          try {
            playNextFromAllSongs();
          } catch (error) {
            console.error('Error in continuous playback:', error);
            handlePlaybackError();
          }
        }, 300); // Reduced delay for smoother experience
      } else {
        console.log('Playback ended - continuous playback disabled');
        setIsPlaying(false);
        showAndroidNotification(
          "⏹️ Playback stopped", 
          "Music paused - ROI MUSIC HD"
        );
      }
    };

    const handleCanPlay = () => {
      setIsAudioLoading(false);
      setAudioLoadingRetries(0);
      signalContinuousPlayback();
    };

    const handleLoadStart = () => {
      setIsAudioLoading(true);
    };

    const handleError = () => {
      console.error('Audio loading error');
      setIsAudioLoading(false);
      handlePlaybackError();
    };

    const handleStalled = () => {
      console.warn('Audio playback stalled');
      if (audioLoadingRetries < 2) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().catch(() => handlePlaybackError());
          }
        }, 1000);
        setAudioLoadingRetries(prev => prev + 1);
      } else {
        handlePlaybackError();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleStalled);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleStalled);
    };
  }, [queue, isRepeating, currentSong, circularQueue]);

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: 'ROI MUSIC',
        artwork: [
          { src: currentSong.imageUrl || '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: currentSong.imageUrl || '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        resumeSong();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        pauseSong();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        previousSong();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextSong();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Load from Supabase for authenticated users
          const { data: likedSongsData, error } = await supabase
            .from('liked_songs')
            .select('song_id')
            .eq('user_id', session.user.id);
          
          if (!error && likedSongsData) {
            const likedSongIds = likedSongsData.map(item => item.song_id);
            setLikedSongs(likedSongIds);
          }
        } else {
          // Load from localStorage for non-authenticated users
          const saved = localStorage.getItem("likedSongs");
          if (saved) {
            setLikedSongs(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Error loading liked songs:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem("likedSongs");
        if (saved) {
          setLikedSongs(JSON.parse(saved));
        }
      }
    };

    loadLikedSongs();
  }, []);

  useEffect(() => {
    // Always keep localStorage updated as backup
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    if (isShuffled) {
      setPlayMode('shuffle');
    } else if (isRepeating) {
      setPlayMode('repeat');
    } else {
      setPlayMode('sequence');
    }
  }, [isShuffled, isRepeating]);

  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 10);
    });
  };

  const createSmartShuffleQueue = (songs: Song[]) => {
    // Use the provided songs or fall back to all unique songs
    const sourcePool = songs.length > 0 ? songs : uniqueSongs;
    
    // Create a more diverse shuffle by mixing different sources
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
    
    return shuffled;
  };

  const createCircularQueue = (songs: Song[], startingSong?: Song) => {
    if (startingSong) {
      const startIndex = songs.findIndex(song => song.id === startingSong.id);
      if (startIndex !== -1) {
        const reorderedSongs = [
          ...songs.slice(startIndex),
          ...songs.slice(0, startIndex)
        ];
        setCircularQueue(reorderedSongs);
        setCurrentQueueIndex(0);
        return reorderedSongs;
      }
    }
    
    setCircularQueue(songs);
    setCurrentQueueIndex(0);
    return songs;
  };

  const getNextSongInCircular = (): Song | null => {
    if (circularQueue.length === 0) return null;
    
    const nextIndex = (currentQueueIndex + 1) % circularQueue.length;
    setCurrentQueueIndex(nextIndex);
    return circularQueue[nextIndex];
  };

  const getPreviousSongInCircular = (): Song | null => {
    if (circularQueue.length === 0) return null;
    
    const prevIndex = currentQueueIndex === 0 ? circularQueue.length - 1 : currentQueueIndex - 1;
    setCurrentQueueIndex(prevIndex);
    return circularQueue[prevIndex];
  };

  const handlePlaybackError = () => {
    console.error('Playback error encountered');
    
    if (audioLoadingRetries < 3) {
      // Try to continue with next song
      console.log('Attempting to continue playback with next song...');
      setAudioLoadingRetries(prev => prev + 1);
      
      showAndroidNotification(
        "⚠️ Song failed to load", 
        "Trying next song - ROI MUSIC HD"
      );
      
      setTimeout(() => {
        if (queue.length > 0 || circularQueue.length > 0) {
          nextSong();
        } else {
          playNextFromAllSongs();
        }
      }, 1000);
    } else {
      // Reset retries and stop playback
      setAudioLoadingRetries(0);
      setIsPlaying(false);
      setIsAudioLoading(false);
      
      showAndroidNotification(
        "❌ Playback stopped", 
        "Multiple loading errors - ROI MUSIC HD"
      );
    }
  };

  const playSong = async (song: Song) => {
    if (!audioRef.current) return;

    // Reset loading state and retries for new song
    setIsAudioLoading(true);
    setAudioLoadingRetries(0);

    // Add song to played history when playing
    if (playOnceMode) {
      setPlayedSongsHistory(prev => new Set([...prev, song.id]));
    }

    setCurrentSong(song);
    addToRecentlyPlayed(song);
    
    try {
      // Use background playback service if available
      const { backgroundPlaybackService } = await import('@/services/BackgroundPlaybackService');
      
      // Update media session immediately
      backgroundPlaybackService.updateMediaSession({
        title: song.title,
        artist: song.artist,
        album: 'ROI MUSIC',
        artwork: song.imageUrl ? [
          { src: song.imageUrl, sizes: '192x192', type: 'image/png' },
          { src: song.imageUrl, sizes: '512x512', type: 'image/png' }
        ] : undefined
      });
      
      // Check if we have a preloaded audio
      const preloadedAudio = backgroundPlaybackService.getPreloadedAudio(song.audioUrl);
      if (preloadedAudio) {
        console.log('Using preloaded audio for:', song.title);
        // Use the preloaded audio instead of creating a new one
        audioRef.current = preloadedAudio;
        audioRef.current.volume = volume;
      }
      
      // Pre-load next songs for smooth playback
      const nextSongs = isShuffled && shuffleQueue.length > 0 
        ? shuffleQueue.filter(s => !shuffleHistory.has(s.id)).slice(0, 3)
        : queue.slice(0, 3);
      
      if (nextSongs.length > 0) {
        backgroundPlaybackService.preloadSongs(nextSongs.map(s => s.audioUrl));
      }
      
    } catch (error) {
      console.warn('Background playback service not available:', error);
    }
    
    // Enhanced audio loading with better error handling
    if (!audioRef.current.src || audioRef.current.src !== song.audioUrl) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.preload = "metadata";
      audioRef.current.load();
    }
    
    // Enhanced playback with comprehensive error handling
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.then(async () => {
        setIsPlaying(true);
        setIsAudioLoading(false);
        
        // Update background playback state
        try {
          const { backgroundPlaybackService } = await import('@/services/BackgroundPlaybackService');
          backgroundPlaybackService.setPlaybackState('playing');
        } catch (error) {
          console.warn('Background playback service not available:', error);
        }
        
        // Only show notifications if not in play-once mode
        if (!playOnceMode) {
          showSongNotification(
            song.title,
            song.artist,
            song.imageUrl,
            song.id,
            song.duration
          );
          
          showAndroidNotification(
            `🎵 Now Playing: ${song.title}`, 
            `${song.artist} - ROI MUSIC HD`
          );
        }
        
        registerMediaSession({
          title: song.title,
          artist: song.artist,
          imageUrl: song.imageUrl,
          duration: song.duration,
          id: song.id
        });
        
        signalContinuousPlayback();
      }).catch(error => {
        console.error("Error playing song:", error);
        setIsAudioLoading(false);
        handlePlaybackError();
      });
    }
  };
  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeSong = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        signalContinuousPlayback();
      });
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  const nextSong = () => {
    console.log('Next song called');
    
    if (continuousPlayback && circularQueue.length > 0) {
      const nextSong = getNextSongInCircular();
      if (nextSong) {
        console.log('Playing next song from circular queue:', nextSong.title);
        playSong(nextSong);
        return;
      }
    }
    
    if (queue.length > 0) {
      const nextSong = queue[0];
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      console.log('Playing next song from queue:', nextSong.title);
      playSong(nextSong);
      return;
    }
    
    playNextFromAllSongs();
  };

  const previousSong = () => {
    console.log('Previous song called');
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (continuousPlayback && circularQueue.length > 0) {
      const prevSong = getPreviousSongInCircular();
      if (prevSong) {
        console.log('Playing previous song from circular queue:', prevSong.title);
        playSong(prevSong);
        return;
      }
    }
    
    if (recentlyPlayed.length > 1) {
      const prevSong = recentlyPlayed[1];
      console.log('Playing previous song from recent:', prevSong.title);
      playSong(prevSong);
      return;
    }
    
    playPreviousFromAllSongs();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seekTo = (time: number) => {
    seek(time);
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => {
      const newShuffled = !prev;
      
      if (newShuffled) {
        // Create a smart shuffle queue from all available songs
        const smartQueue = createSmartShuffleQueue(circularQueue.length > 0 ? circularQueue : uniqueSongs);
        setShuffleQueue(smartQueue);
        setShuffleHistory(new Set());
        
        // Shuffle existing queue if present
        if (queue.length > 0) {
          const shuffled = [...queue].sort(() => Math.random() - 0.5);
          setQueue(shuffled);
        }
        
        // Shuffle circular queue if present
        if (circularQueue.length > 0) {
          const shuffledCircular = [...circularQueue];
          // Keep current song at index 0, shuffle the rest
          const currentSong = shuffledCircular[currentQueueIndex];
          const remainingSongs = shuffledCircular.filter((_, i) => i !== currentQueueIndex);
          const shuffledRemaining = remainingSongs.sort(() => Math.random() - 0.5);
          
          const newCircularQueue = [currentSong, ...shuffledRemaining];
          setCircularQueue(newCircularQueue);
          setCurrentQueueIndex(0);
        }
      } else {
        setShuffleQueue([]);
        setShuffleHistory(new Set());
      }
      
      return newShuffled;
    });
  };

  const toggleRepeat = () => {
    setIsRepeating(prev => !prev);
  };

  const toggleLike = async (songId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Handle Supabase liked songs for authenticated users
        const isCurrentlyLiked = likedSongs.includes(songId);
        
        if (isCurrentlyLiked) {
          // Remove from Supabase
          const { error } = await supabase
            .from('liked_songs')
            .delete()
            .eq('user_id', session.user.id)
            .eq('song_id', songId);
          
          if (!error) {
            setLikedSongs(prev => prev.filter(id => id !== songId));
          } else {
            console.error("Failed to remove from liked songs");
          }
        } else {
          // Add to Supabase
          const { error } = await supabase
            .from('liked_songs')
            .insert({
              user_id: session.user.id,
              song_id: songId
            });
          
          if (!error) {
            setLikedSongs(prev => [...prev, songId]);
          } else {
            console.error("Failed to add to liked songs");
          }
        }
      } else {
        // Handle localStorage liked songs for non-authenticated users
        setLikedSongs(prev => {
          const isLiked = prev.includes(songId);
          if (isLiked) {
            return prev.filter(id => id !== songId);
          } else {
            return [...prev, songId];
          }
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleLikeSong = async (songId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Handle Supabase liked songs for authenticated users
        const isCurrentlyLiked = likedSongs.includes(songId);
        
        if (isCurrentlyLiked) {
          // Remove from Supabase
          const { error } = await supabase
            .from('liked_songs')
            .delete()
            .eq('user_id', session.user.id)
            .eq('song_id', songId);
          
          if (!error) {
            setLikedSongs(prev => prev.filter(id => id !== songId));
            showNotification.songUnliked(songId);
            return false;
          } else {
            console.error("Failed to remove from liked songs");
            return likedSongs.includes(songId);
          }
        } else {
          // Add to Supabase
          const { error } = await supabase
            .from('liked_songs')
            .insert({
              user_id: session.user.id,
              song_id: songId
            });
          
          if (!error) {
            setLikedSongs(prev => [...prev, songId]);
            showNotification.songLiked(songId);
            return true;
          } else {
            console.error("Failed to add to liked songs");
            return likedSongs.includes(songId);
          }
        }
      } else {
        // Handle localStorage liked songs for non-authenticated users
        const isCurrentlyLiked = likedSongs.includes(songId);
        if (isCurrentlyLiked) {
          setLikedSongs(prev => prev.filter(id => id !== songId));
          showNotification.songUnliked(songId);
          return false;
        } else {
          setLikedSongs(prev => [...prev, songId]);
          showNotification.songLiked(songId);
          return true;
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return likedSongs.includes(songId);
    }
  };

  const isLiked = (songId: string): boolean => {
    return likedSongs.includes(songId);
  };

  const setPlaybackMode = (mode: 'sequence' | 'shuffle' | 'repeat') => {
    setPlayMode(mode);
    setIsShuffled(mode === 'shuffle');
    setIsRepeating(mode === 'repeat');
  };

  const playLikedSongs = () => {
    // Play liked songs functionality
  };

  const playPlaylist = (songs: Song[]) => {
    if (songs.length === 0) return;
    
    // If shuffle is enabled, create a shuffle queue for this playlist
    if (isShuffled) {
      const smartQueue = createSmartShuffleQueue(songs);
      setShuffleQueue(smartQueue);
      setShuffleHistory(new Set());
    }
    
    // Create circular queue for the playlist
    createCircularQueue(songs, songs[0]);
    playSong(songs[0]);
  };

  const playArtistSongs = (artistName: string, allSongs: Song[], startingSong?: Song) => {
    const artistSongs = allSongs.filter(song => song.artist === artistName);
    if (artistSongs.length > 0) {
      createCircularQueue(artistSongs, startingSong);
      const songToPlay = startingSong || artistSongs[0];
      playSong(songToPlay);
    }
  };

    const playNextFromAllSongs = () => {
    if (isShuffled && shuffleQueue.length > 0) {
      // Get next song from shuffle queue with better randomization
      const remainingSongs = shuffleQueue.filter(song => !shuffleHistory.has(song.id));
      
      if (remainingSongs.length === 0) {
        // Reset shuffle with re-shuffled queue for variety
        setShuffleHistory(new Set());
        const reshuffledQueue = createSmartShuffleQueue(shuffleQueue);
        setShuffleQueue(reshuffledQueue);
        const nextSong = reshuffledQueue[0];
        if (nextSong) {
          setShuffleHistory(new Set([nextSong.id]));
          playSong(nextSong);
          
          // Pre-queue next few songs for smooth playback
          if (reshuffledQueue.length > 1) {
            const preQueue = reshuffledQueue.slice(1, 4);
            setQueue(prev => [...prev, ...preQueue]);
          }
        }
        return;
      }
      
      // Randomize selection from remaining songs for better shuffle
      const randomIndex = Math.floor(Math.random() * remainingSongs.length);
      const nextSong = remainingSongs[randomIndex];
      setShuffleHistory(prev => new Set([...prev, nextSong.id]));
      
      // Pre-load next song for better continuity
      if (remainingSongs.length > 1) {
        const preloadSong = remainingSongs[randomIndex === remainingSongs.length - 1 ? 0 : randomIndex + 1];
        const preloadAudio = new Audio();
        preloadAudio.preload = "metadata";
        preloadAudio.src = preloadSong.audioUrl;
      }
      
      playSong(nextSong);
      return;
    }
    
    if (!currentSong) return;
    
    // Filter songs to avoid duplicates by title and artist, and exclude already played
    const availableSongs = uniqueSongs.filter(song => {
      if (song.id === currentSong.id) return false;
      
      // Check if this song was already played (by title and artist match)
      const songKey = `${song.title.toLowerCase().trim()}-${song.artist.toLowerCase().trim()}`;
      const currentSongKey = `${currentSong.title.toLowerCase().trim()}-${currentSong.artist.toLowerCase().trim()}`;
      
      return songKey !== currentSongKey && !playedSongsHistory.has(song.id);
    });
    
    if (availableSongs.length === 0) {
      if (playOnceMode && playedSongsHistory.size > 0) {
        // Reset history when all songs have been played
        setPlayedSongsHistory(new Set());
        // Play a random song from all available
        const randomIndex = Math.floor(Math.random() * uniqueSongs.length);
        const nextSong = uniqueSongs[randomIndex];
        console.log('Resetting play history and playing:', nextSong.title);
        playSong(nextSong);
      }
      return;
    }
    
    // Use a more random selection to avoid repetitive patterns
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    const nextSong = availableSongs[randomIndex];
    
    console.log('Playing next song from all songs:', nextSong.title);
    playSong(nextSong);
  };

  const playPreviousFromAllSongs = () => {
    if (isShuffled && shuffleQueue.length > 0) {
      // For shuffle mode, pick a random previously played song or any random song
      const playedSongs = shuffleQueue.filter(song => shuffleHistory.has(song.id));
      
      if (playedSongs.length > 0) {
        const randomPrevious = playedSongs[Math.floor(Math.random() * playedSongs.length)];
        playSong(randomPrevious);
        return;
      }
    }
    
    if (!currentSong) return;
    
    const currentIndex = uniqueSongs.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? uniqueSongs.length - 1 : currentIndex - 1;
    const prevSong = uniqueSongs[prevIndex];
    
    console.log('Playing previous song from all songs:', prevSong.title);
    playSong(prevSong);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        isShuffled,
        isRepeating,
        likedSongs,
        isLiveMode,
        playMode,
        recentlyPlayed,
        playSong,
        pauseSong,
        resumeSong,
        togglePlayPause,
        nextSong,
        previousSong,
        seek: (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        },
        seekTo,
        setVolume: (newVolume: number) => {
          if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolumeState(newVolume);
          }
        },
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        toggleLikeSong,
        isLiked,
        setIsLiveMode,
        setPlaybackMode,
        playLikedSongs,
        playPlaylist,
        continuousPlayback,
        setContinuousPlayback,
        autoPlayArtist,
        setAutoPlayArtist,
        playArtistSongs,
        circularQueue,
        currentQueueIndex,
        createCircularQueue,
        playOnceMode,
        setPlayOnceMode,
        resetPlayHistory: () => {
          setPlayedSongsHistory(new Set());
        },
        playedSongsHistory,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
