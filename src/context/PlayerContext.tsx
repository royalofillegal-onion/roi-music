import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";
import { showSongNotification } from "@/services/NotificationService";
import { registerMediaSession } from "@/services/androidNotification";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  isRepeating: boolean;
  likedSongs: string[];
  playMode: 'sequence' | 'repeat' | 'shuffle';
  isShuffled: boolean;
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
  clearQueue: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleLike: (songId: string) => void;
  toggleLikeSong: (songId: string) => Promise<boolean>;
  isLiked: (songId: string) => boolean;
  setPlaybackMode: (mode: 'sequence' | 'repeat' | 'shuffle') => void;
  playPlaylist: (songs: Song[]) => void;
  setIsLiveMode: (isLive: boolean) => void;
  playArtistSongs: (artistName: string, allSongs: Song[], startingSong?: Song) => void;
  circularQueue: Song[];
  playOnceMode: boolean;
  setPlayOnceMode: (value: boolean) => void;
  resetPlayHistory: () => void;
  playedSongsHistory: Set<string>;
  autoPlayArtist: boolean;
  setAutoPlayArtist: (value: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [playMode, setPlayMode] = useState<'sequence' | 'repeat' | 'shuffle'>('sequence');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [circularQueue, setCircularQueue] = useState<Song[]>([]);
  const [playOnceMode, setPlayOnceMode] = useState(false);
  const [playedSongsHistory, setPlayedSongsHistory] = useState<Set<string>>(new Set());
  const [autoPlayArtist, setAutoPlayArtist] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle custom notification events
  useEffect(() => {
    const handlePrevious = () => previousSong();
    const handleNext = () => nextSong();
    const handleTogglePlayPause = () => togglePlayPause();

    window.addEventListener('playerPrevious', handlePrevious);
    window.addEventListener('playerNext', handleNext);
    window.addEventListener('playerTogglePlayPause', handleTogglePlayPause);

    return () => {
      window.removeEventListener('playerPrevious', handlePrevious);
      window.removeEventListener('playerNext', handleNext);
      window.removeEventListener('playerTogglePlayPause', handleTogglePlayPause);
    };
  }, []);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (isRepeating) {
        // Repeat current song
        audio.currentTime = 0;
        audio.play();
        return;
      }
      
      if (queue.length > 0) {
        // Play next from queue
        nextSong();
      } else {
        // Play next song from all songs
        playNextFromLibrary();
      }
    };

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false));
      }
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
  }, [queue, isRepeating, isPlaying]);

  // Load liked songs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("likedSongs");
    if (saved) {
      setLikedSongs(JSON.parse(saved));
    }
  }, []);

  // Save liked songs to localStorage
  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Update play mode when repeat/shuffle changes
  useEffect(() => {
    if (isShuffled) {
      setPlayMode('shuffle');
    } else if (isRepeating) {
      setPlayMode('repeat');
    } else {
      setPlayMode('sequence');
    }
  }, [isRepeating, isShuffled]);

  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    setCurrentSong(song);
    audioRef.current.src = song.audioUrl;
    audioRef.current.load();
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      
      // Show notification with song info
      showSongNotification(
        song.title,
        song.artist,
        song.imageUrl,
        song.id,
        audioRef.current?.duration
      );
      
      // Register media session for better mobile experience
      registerMediaSession({
        title: song.title,
        artist: song.artist,
        imageUrl: song.imageUrl,
        duration: audioRef.current?.duration,
        id: song.id
      });
      
    }).catch((error) => {
      console.error("Error playing song:", error);
      setIsPlaying(false);
    });
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      // Update media session on pause
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  };

  const resumeSong = () => {
    if (audioRef.current && currentSong) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        
        // Update media session on resume
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }).catch(() => {
        setIsPlaying(false);
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
    if (queue.length > 0) {
      const nextSong = queue[0];
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      playSong(nextSong);
    } else {
      playNextFromLibrary();
    }
  };

  const previousSong = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If more than 3 seconds into song, restart it
      audioRef.current.currentTime = 0;
      return;
    }
    
    // Otherwise play previous song from library
    playPreviousFromLibrary();
  };

  const playNextFromLibrary = () => {
    if (!currentSong) return;
    
    const currentIndex = uniqueSongs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % uniqueSongs.length;
    const nextSong = uniqueSongs[nextIndex];
    
    playSong(nextSong);
  };

  const playPreviousFromLibrary = () => {
    if (!currentSong) return;
    
    const currentIndex = uniqueSongs.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? uniqueSongs.length - 1 : currentIndex - 1;
    const prevSong = uniqueSongs[prevIndex];
    
    playSong(prevSong);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
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

  const clearQueue = () => {
    setQueue([]);
  };

  const toggleRepeat = () => {
    setIsRepeating(prev => !prev);
  };

  const toggleLike = (songId: string) => {
    setLikedSongs(prev => {
      const isLiked = prev.includes(songId);
      if (isLiked) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const isLiked = (songId: string): boolean => {
    return likedSongs.includes(songId);
  };

  const setPlaybackMode = (mode: 'sequence' | 'repeat' | 'shuffle') => {
    setPlayMode(mode);
    setIsRepeating(mode === 'repeat');
    setIsShuffled(mode === 'shuffle');
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => !prev);
  };

  const seekTo = (time: number) => {
    seek(time);
  };

  const toggleLikeSong = async (songId: string): Promise<boolean> => {
    toggleLike(songId);
    return isLiked(songId);
  };

  const setIsLiveMode = (isLive: boolean) => {
    // Simple implementation - could be extended
    console.log('Live mode:', isLive);
  };

  const playArtistSongs = (artistName: string, allSongs: Song[], startingSong?: Song) => {
    const artistSongs = allSongs.filter(song => 
      song.artist.toLowerCase().includes(artistName.toLowerCase())
    );
    if (artistSongs.length > 0) {
      playPlaylist(artistSongs);
    }
  };

  const resetPlayHistory = () => {
    setPlayedSongsHistory(new Set());
  };

  const playPlaylist = (songs: Song[]) => {
    if (songs.length === 0) return;
    
    // Set queue with remaining songs
    setQueue(songs.slice(1));
    // Play first song
    playSong(songs[0]);
  };

  const value: PlayerContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    isRepeating,
    isShuffled,
    likedSongs,
    playMode,
    recentlyPlayed,
    circularQueue,
    playOnceMode,
    playedSongsHistory,
    autoPlayArtist,
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
    clearQueue,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    toggleLikeSong,
    isLiked,
    setPlaybackMode,
    playPlaylist,
    setIsLiveMode,
    playArtistSongs,
    setPlayOnceMode,
    resetPlayHistory,
    setAutoPlayArtist,
  };

  return (
    <PlayerContext.Provider value={value}>
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
