import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";
import { PlaybackQueue } from "@/lib/algorithms/playbackQueue";
import { NoRepeatShuffler, fisherYatesShuffle } from "@/lib/algorithms/fisherYatesShuffle";
import { getHybridRecommendations } from "@/lib/algorithms/recommendations";
import { mediaSessionManager } from "@/services/MediaSessionService";
import { offlineCacheService } from "@/services/OfflineCacheService";

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
  recommendations: Song[];
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const MAX_RECENTLY_PLAYED = 30;

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [playMode, setPlayMode] = useState<'sequence' | 'repeat' | 'shuffle'>('sequence');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [circularQueue, setCircularQueue] = useState<Song[]>([]);
  const [playOnceMode, setPlayOnceMode] = useState(false);
  const [playedSongsHistory, setPlayedSongsHistory] = useState<Set<string>>(new Set());
  const [autoPlayArtist, setAutoPlayArtist] = useState(false);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Algorithm instances
  const playbackQueueRef = useRef(new PlaybackQueue());
  const shufflerRef = useRef(new NoRepeatShuffler(uniqueSongs));

  // Expose queue as array for UI
  const queue = playbackQueueRef.current.getAll();

  // Initialize audio + Media Session handlers
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    // Register Spotify-like Media Session handlers
    mediaSessionManager.registerHandlers({
      onPlay: () => resumeSong(),
      onPause: () => pauseSong(),
      onNextTrack: () => nextSong(),
      onPreviousTrack: () => previousSong(),
      onSeekTo: (time) => seek(time),
      onSeekForward: (offset) => {
        if (audioRef.current) seek(audioRef.current.currentTime + offset);
      },
      onSeekBackward: (offset) => {
        if (audioRef.current) seek(Math.max(0, audioRef.current.currentTime - offset));
      },
    });

    return () => {
      mediaSessionManager.destroy();
    };
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Update lock screen seek bar
      if (audio.duration && isFinite(audio.duration)) {
        mediaSessionManager.updatePositionState(audio.currentTime, audio.duration);
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      nextSong();
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
  }, [isRepeating, isPlaying, isShuffled]);

  // Load liked songs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("likedSongs");
    if (saved) setLikedSongs(JSON.parse(saved));
    
    // Load recently played
    const recentSaved = localStorage.getItem("recentlyPlayed");
    if (recentSaved) {
      try {
        setRecentlyPlayed(JSON.parse(recentSaved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Update play mode when repeat/shuffle changes
  useEffect(() => {
    if (isShuffled) setPlayMode('shuffle');
    else if (isRepeating) setPlayMode('repeat');
    else setPlayMode('sequence');
  }, [isRepeating, isShuffled]);

  // Generate recommendations when current song or recently played changes
  useEffect(() => {
    if (currentSong || recentlyPlayed.length > 0) {
      const recs = getHybridRecommendations(currentSong, recentlyPlayed, uniqueSongs, 20);
      setRecommendations(recs);
    }
  }, [currentSong?.id, recentlyPlayed.length]);

  // Custom notification events (for custom overlay)
  useEffect(() => {
    const handlePrevious = () => previousSong();
    const handleNext = () => nextSong();
    const handleToggle = () => togglePlayPause();

    window.addEventListener('playerPrevious', handlePrevious);
    window.addEventListener('playerNext', handleNext);
    window.addEventListener('playerTogglePlayPause', handleToggle);

    return () => {
      window.removeEventListener('playerPrevious', handlePrevious);
      window.removeEventListener('playerNext', handleNext);
      window.removeEventListener('playerTogglePlayPause', handleToggle);
    };
  }, []);

  const addToRecentlyPlayed = useCallback((song: Song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
      localStorage.setItem("recentlyPlayed", JSON.stringify(updated));
      return updated;
    });
    setPlayedSongsHistory(prev => new Set(prev).add(song.id));
  }, []);

  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;

    setCurrentSong(song);
    addToRecentlyPlayed(song);

    // Try offline cache first
    let audioUrl = song.audioUrl;
    try {
      const offlineUrl = await offlineCacheService.getOfflineAudioUrl(song.id);
      if (offlineUrl) {
        audioUrl = offlineUrl;
      } else if (navigator.onLine) {
        offlineCacheService.cacheSong({
          id: song.id, title: song.title, artist: song.artist,
          audioUrl: song.audioUrl, imageUrl: song.imageUrl
        });
      }
    } catch { /* ignore */ }

    audioRef.current.src = audioUrl;
    audioRef.current.load();

    audioRef.current.play().then(() => {
      setIsPlaying(true);

      // Update Spotify-like Media Session (lock screen notification with rainbow art)
      mediaSessionManager.updateMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || song.artist,
        imageUrl: song.imageUrl,
        duration: audioRef.current?.duration,
      });
      mediaSessionManager.updatePlaybackState(true);

      if (audioRef.current) {
        mediaSessionManager.startPositionTracking(audioRef.current);
      }
    }).catch((error) => {
      console.error("Error playing song:", error);
      setIsPlaying(false);
    });
  }, [addToRecentlyPlayed]);

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      mediaSessionManager.updatePlaybackState(false);
      mediaSessionManager.stopPositionTracking();
    }
  }, []);

  const resumeSong = useCallback(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        mediaSessionManager.updatePlaybackState(true);
        if (audioRef.current) {
          mediaSessionManager.startPositionTracking(audioRef.current);
        }
      }).catch(() => setIsPlaying(false));
    }
  }, [currentSong]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pauseSong();
    else resumeSong();
  }, [isPlaying, pauseSong, resumeSong]);

  const nextSong = useCallback(() => {
    // 1. FIFO Queue — if songs are queued, dequeue next
    const queuedSong = playbackQueueRef.current.dequeue();
    if (queuedSong) {
      playSong(queuedSong);
      return;
    }

    // 2. Shuffle mode — Fisher-Yates no-repeat shuffler
    if (isShuffled) {
      const shuffled = shufflerRef.current.next();
      if (shuffled) {
        playSong(shuffled);
        return;
      }
    }

    // 3. Sequential mode — play next in library order
    if (!currentSong) return;
    const currentIndex = uniqueSongs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % uniqueSongs.length;
    playSong(uniqueSongs[nextIndex]);
  }, [currentSong, isShuffled, playSong]);

  const previousSong = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    // Check history from queue
    const prevFromHistory = playbackQueueRef.current.getPrevious();
    if (prevFromHistory) {
      playSong(prevFromHistory);
      return;
    }

    // Sequential fallback
    if (!currentSong) return;
    const currentIndex = uniqueSongs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? uniqueSongs.length - 1 : currentIndex - 1;
    playSong(uniqueSongs[prevIndex]);
  }, [currentSong, playSong]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  }, []);

  const addToQueue = useCallback((song: Song) => {
    playbackQueueRef.current.enqueue(song);
    // Force re-render
    setCircularQueue([...playbackQueueRef.current.getAll()]);
  }, []);

  const clearQueue = useCallback(() => {
    playbackQueueRef.current.clear();
    setCircularQueue([]);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeating(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      const newVal = !prev;
      if (newVal) {
        // Reset shuffler when enabling shuffle
        shufflerRef.current.reset();
      }
      return newVal;
    });
  }, []);

  const toggleLike = useCallback((songId: string) => {
    setLikedSongs(prev => {
      return prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId];
    });
  }, []);

  const isLiked = useCallback((songId: string): boolean => {
    return likedSongs.includes(songId);
  }, [likedSongs]);

  const setPlaybackMode = useCallback((mode: 'sequence' | 'repeat' | 'shuffle') => {
    setPlayMode(mode);
    setIsRepeating(mode === 'repeat');
    setIsShuffled(mode === 'shuffle');
    if (mode === 'shuffle') shufflerRef.current.reset();
  }, []);

  const seekTo = useCallback((time: number) => seek(time), [seek]);

  const toggleLikeSong = useCallback(async (songId: string): Promise<boolean> => {
    toggleLike(songId);
    return !likedSongs.includes(songId);
  }, [toggleLike, likedSongs]);

  const setIsLiveMode = useCallback((isLive: boolean) => {
    console.log('Live mode:', isLive);
  }, []);

  const playArtistSongs = useCallback((artistName: string, allSongs: Song[], startingSong?: Song) => {
    const artistSongs = allSongs.filter(song =>
      song.artist.toLowerCase().includes(artistName.toLowerCase())
    );
    if (artistSongs.length > 0) {
      playPlaylist(artistSongs);
    }
  }, []);

  const resetPlayHistory = useCallback(() => {
    setPlayedSongsHistory(new Set());
    shufflerRef.current.reset();
  }, []);

  const playPlaylist = useCallback((songs: Song[]) => {
    if (songs.length === 0) return;
    // FIFO: load remaining into the queue
    playbackQueueRef.current.replace(songs.slice(1));
    setCircularQueue([...playbackQueueRef.current.getAll()]);
    playSong(songs[0]);
  }, [playSong]);

  const value: PlayerContextType = useMemo(() => ({
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue: playbackQueueRef.current.getAll(),
    isRepeating,
    isShuffled,
    likedSongs,
    playMode,
    recentlyPlayed,
    circularQueue,
    playOnceMode,
    playedSongsHistory,
    autoPlayArtist,
    recommendations,
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
  }), [
    currentSong, isPlaying, currentTime, duration, volume,
    isRepeating, isShuffled, likedSongs, playMode, recentlyPlayed,
    circularQueue, playOnceMode, playedSongsHistory, autoPlayArtist,
    recommendations, playSong, pauseSong, resumeSong, togglePlayPause,
    nextSong, previousSong, seek, seekTo, setVolume, addToQueue,
    clearQueue, toggleRepeat, toggleShuffle, toggleLike, toggleLikeSong,
    isLiked, setPlaybackMode, playPlaylist, setIsLiveMode,
    playArtistSongs, setPlayOnceMode, resetPlayHistory, setAutoPlayArtist,
  ]);

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
