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
  continuousPlayback: boolean;
  circularQueue: Song[];
  playOnceMode: boolean;
  playedSongsHistory: Set<string>;
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
  playArtistSongs: (artistName: string, allSongs: Song[], startingSong?: Song) => void;
  setContinuousPlayback: (value: boolean) => void;
  setPlayOnceMode: (value: boolean) => void;
  resetPlayHistory: () => void;
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
  const [circularQueue] = useState<Song[]>([]);
  const [playOnceMode, setPlayOnceMode] = useState(false);
  const [playedSongsHistory, setPlayedSongsHistory] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.preload = "auto";
      
      // Enable background playback
      audioRef.current.setAttribute('playsinline', 'true');
      audioRef.current.setAttribute('webkit-playsinline', 'true');
      
      enableContinuousPlayback();
      signalContinuousPlayback();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Update media session position
      if ('mediaSession' in navigator && currentSong) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration || 0,
          playbackRate: audio.playbackRate,
          position: audio.currentTime
        });
      }
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
      
      if (queue.length > 0) {
        console.log('Playing next from queue');
        nextSong();
      } else if (continuousPlayback) {
        console.log('Continuous playback enabled, playing next song');
        setTimeout(() => {
          playNextFromAllSongs();
        }, 500);
      } else {
        console.log('Playback ended');
        setIsPlaying(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    };

    const handleCanPlay = () => {
      signalContinuousPlayback();
    };

    const handleLoadStart = () => {
      console.log('Audio loading started');
    };

    const handleCanPlayThrough = () => {
      console.log('Audio can play through');
      signalContinuousPlayback();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, [queue, isRepeating, currentSong, continuousPlayback]);

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
          const { data: likedSongsData, error } = await supabase
            .from('liked_songs')
            .select('song_id')
            .eq('user_id', session.user.id);
          
          if (!error && likedSongsData) {
            const likedSongIds = likedSongsData.map(item => item.song_id);
            setLikedSongs(likedSongIds);
          }
        } else {
          const saved = localStorage.getItem("likedSongs");
          if (saved) {
            setLikedSongs(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Error loading liked songs:', error);
        const saved = localStorage.getItem("likedSongs");
        if (saved) {
          setLikedSongs(JSON.parse(saved));
        }
      }
    };

    loadLikedSongs();
  }, []);

  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 10);
    });
  };

  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    setCurrentSong(song);
    addToRecentlyPlayed(song);
    audioRef.current.src = song.audioUrl;
    audioRef.current.preload = "auto";
    
    // Ensure background playback settings
    audioRef.current.setAttribute('playsinline', 'true');
    audioRef.current.setAttribute('webkit-playsinline', 'true');
    
    audioRef.current.load();
    
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
        
        showSongNotification(
          song.title,
          song.artist,
          song.imageUrl,
          song.id,
          song.duration
        );
        
        showAndroidNotification(`${song.title}`, `${song.artist} - ROI MUSIC HD`);
        
        registerMediaSession({
          title: song.title,
          artist: song.artist,
          imageUrl: song.imageUrl,
          duration: song.duration,
          id: song.id
        });
        
        signalContinuousPlayback();
        
        // Enable audio focus for background playback
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        
      }).catch(error => {
        console.error("Error playing song:", error);
        // Removed toast error message as requested
      });
    }
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  };

  const resumeSong = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        signalContinuousPlayback();
        
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
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

  const toggleRepeat = () => {
    setIsRepeating(prev => !prev);
  };

  const toggleLike = async (songId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const isCurrentlyLiked = likedSongs.includes(songId);
        
        if (isCurrentlyLiked) {
          const { error } = await supabase
            .from('liked_songs')
            .delete()
            .eq('user_id', session.user.id)
            .eq('song_id', songId);
          
          if (!error) {
            setLikedSongs(prev => prev.filter(id => id !== songId));
          }
        } else {
          const { error } = await supabase
            .from('liked_songs')
            .insert({
              user_id: session.user.id,
              song_id: songId
            });
          
          if (!error) {
            setLikedSongs(prev => [...prev, songId]);
          }
        }
      } else {
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
  };

  const isLiked = (songId: string): boolean => {
    return likedSongs.includes(songId);
  };

  const playLikedSongs = () => {
    // Function for playing liked songs
  };

  const playPlaylist = (songs: Song[]) => {
    if (songs.length === 0) return;
    
    // Clear queue and add all songs to it
    setQueue(songs.slice(1)); // Add all except first song to queue
    playSong(songs[0]); // Play first song immediately
  };

  const playNextFromAllSongs = () => {
    if (!currentSong) return;
    
    // Simple sequential playback - find current song and play next
    const currentIndex = uniqueSongs.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex !== -1) {
      // Play next song in sequence, or loop to first if at end
      const nextIndex = (currentIndex + 1) % uniqueSongs.length;
      const nextSong = uniqueSongs[nextIndex];
      
      console.log('Playing next sequential song:', nextSong.title);
      playSong(nextSong);
    } else {
      // If current song not found, play first song
      const nextSong = uniqueSongs[0];
      if (nextSong) {
        console.log('Playing first song:', nextSong.title);
        playSong(nextSong);
      }
    }
  };

  const playPreviousFromAllSongs = () => {
    if (!currentSong) return;
    
    const currentIndex = uniqueSongs.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? uniqueSongs.length - 1 : currentIndex - 1;
    const prevSong = uniqueSongs[prevIndex];
    
    console.log('Playing previous song from all songs:', prevSong.title);
    playSong(prevSong);
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => !prev);
  };

  const setPlaybackMode = (mode: 'sequence' | 'shuffle' | 'repeat') => {
    setPlayMode(mode);
    setIsShuffled(mode === 'shuffle');
    setIsRepeating(mode === 'repeat');
  };

  const playArtistSongs = (artistName: string, allSongs: Song[], startingSong?: Song) => {
    const artistSongs = allSongs.filter(song => song.artist === artistName);
    if (artistSongs.length > 0) {
      playPlaylist(artistSongs);
    }
  };

  const resetPlayHistory = () => {
    setPlayedSongsHistory(new Set());
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
        continuousPlayback,
        circularQueue,
        playOnceMode,
        playedSongsHistory,
        playSong,
        pauseSong,
        resumeSong,
        togglePlayPause,
        nextSong,
        previousSong,
        seek,
        seekTo,
        setVolume,
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
        playArtistSongs,
        setContinuousPlayback,
        setPlayOnceMode,
        resetPlayHistory,
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