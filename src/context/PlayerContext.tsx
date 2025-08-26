import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";
import { toast } from "sonner";
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
  const [shuffleQueue, setShuffleQueue] = useState<Song[]>([]);
  const [shuffleHistory, setShuffleHistory] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
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
      console.log('Song ended, checking next action...');
      
      if (isRepeating && currentSong) {
        console.log('Repeating current song');
        audio.currentTime = 0;
        audio.play();
        return;
      }
      
      if (queue.length > 0 || circularQueue.length > 0) {
        console.log('Playing next from queue');
        nextSong();
      } else if (continuousPlayback) {
        console.log('Continuous playback enabled, playing next song');
        // Optimized delay for smoother transitions
        setTimeout(() => {
          playNextFromAllSongs();
        }, 500);
      } else {
        console.log('Playback ended');
        setIsPlaying(false);
      }
    };

    const handleCanPlay = () => {
      signalContinuousPlayback();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
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

  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    // Add song to played history when playing
    if (playOnceMode) {
      setPlayedSongsHistory(prev => new Set([...prev, song.id]));
    }

    setCurrentSong(song);
    addToRecentlyPlayed(song);
    // Optimize audio loading for better quality and reduced bandwidth
    audioRef.current.src = song.audioUrl;
    audioRef.current.preload = "metadata"; // Only load metadata initially to save bandwidth
    audioRef.current.load();
    
    // Enhanced playback with quality optimization
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
        
        // Only show notifications if not in play-once mode to reduce interruptions
        if (!playOnceMode) {
          showSongNotification(
            song.title,
            song.artist,
            song.imageUrl,
            song.id,
            song.duration
          );
          
          showAndroidNotification(`${song.title}`, `${song.artist} - ROI MUSIC HD`);
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
        toast.error("Failed to play song. Please try again.");
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
    toast.success(`Added "${song.title}" to queue`);
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    toast.success("Queue cleared");
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
        
        toast.success("Smart shuffle enabled - Enjoy diverse music!");
      } else {
        setShuffleQueue([]);
        setShuffleHistory(new Set());
        toast.success("Shuffle disabled");
      }
      
      return newShuffled;
    });
  };

  const toggleRepeat = () => {
    setIsRepeating(prev => !prev);
    toast.success(isRepeating ? "Repeat disabled" : "Repeat enabled");
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
            toast.success("Removed from liked songs");
          } else {
            toast.error("Failed to remove from liked songs");
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
            toast.success("Added to liked songs");
          } else {
            toast.error("Failed to add to liked songs");
          }
        }
      } else {
        // Handle localStorage liked songs for non-authenticated users
        setLikedSongs(prev => {
          const isLiked = prev.includes(songId);
          if (isLiked) {
            toast.success("Removed from liked songs");
            return prev.filter(id => id !== songId);
          } else {
            toast.success("Added to liked songs");
            return [...prev, songId];
          }
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update liked songs");
    }
  };

  const toggleLikeSong = async (songId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setLikedSongs(prev => {
        const isLiked = prev.includes(songId);
        if (isLiked) {
          toast.success("Removed from liked songs");
          const newSongs = prev.filter(id => id !== songId);
          resolve(false);
          return newSongs;
        } else {
          toast.success("Added to liked songs");
          const newSongs = [...prev, songId];
          resolve(true);
          return newSongs;
        }
      });
    });
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
    toast.success("Playing liked songs");
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
    toast.success(`Playing ${songs.length} songs`);
  };

  const playArtistSongs = (artistName: string, allSongs: Song[], startingSong?: Song) => {
    const artistSongs = allSongs.filter(song => song.artist === artistName);
    if (artistSongs.length > 0) {
      createCircularQueue(artistSongs, startingSong);
      const songToPlay = startingSong || artistSongs[0];
      playSong(songToPlay);
      toast.success(`Playing all songs by ${artistName} (${artistSongs.length} tracks)`);
    }
  };

  const playNextFromAllSongs = () => {
    if (isShuffled && shuffleQueue.length > 0) {
      // Get next song from shuffle queue
      const remainingSongs = shuffleQueue.filter(song => !shuffleHistory.has(song.id));
      
      if (remainingSongs.length === 0) {
        // Reset shuffle if we've played all songs
        setShuffleHistory(new Set());
        const nextSong = shuffleQueue[0];
        if (nextSong) {
          setShuffleHistory(new Set([nextSong.id]));
          playSong(nextSong);
        }
        return;
      }
      
      const nextSong = remainingSongs[0];
      setShuffleHistory(prev => new Set([...prev, nextSong.id]));
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
        toast.success("All songs played once! Starting fresh...");
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
        toggleLikeSong: async (songId: string): Promise<boolean> => {
          return new Promise((resolve) => {
            setLikedSongs(prev => {
              const isLiked = prev.includes(songId);
              if (isLiked) {
                const newSongs = prev.filter(id => id !== songId);
                resolve(false);
                return newSongs;
              } else {
                const newSongs = [...prev, songId];
                resolve(true);
                return newSongs;
              }
            });
          });
        },
        isLiked: (songId: string): boolean => {
          return likedSongs.includes(songId);
        },
        setIsLiveMode: (isLive: boolean) => {
          setIsLiveMode(isLive);
        },
        setPlaybackMode: (mode: 'sequence' | 'shuffle' | 'repeat') => {
          setPlayMode(mode);
          setIsShuffled(mode === 'shuffle');
          setIsRepeating(mode === 'repeat');
        },
        playLikedSongs: () => {
          // Play liked songs without notification
        },
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
          toast.success("Play history reset!");
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

