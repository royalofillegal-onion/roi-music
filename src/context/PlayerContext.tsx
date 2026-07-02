import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Song } from "@/data/Song";
import { uniqueSongs } from "@/data/allSongs";
import { PlaybackQueue } from "@/lib/algorithms/playbackQueue";
import { NoRepeatShuffler, fisherYatesShuffle } from "@/lib/algorithms/fisherYatesShuffle";
import { getHybridRecommendations } from "@/lib/algorithms/recommendations";
import { mediaSessionManager } from "@/services/MediaSessionService";
import { recordPlay as trackRecordPlay, getDeviceId } from "@/lib/deviceTracker";
import { useWakeLock } from "@/hooks/useWakeLock";

const offlineCacheService = { initialize: async () => {}, cacheSong: async (_: any) => {}, getCachedSong: async (_: any) => null, getCacheStats: async () => ({ count: 0, totalSize: 0 }) } as any;
const userPreferenceLearner = {
  recordPlay: (_s: any, _d?: number) => {},
  recordLike: (_s: any) => {},
  recordUnlike: (_s: any) => {},
  getRecommendations: (_: any) => [] as any[],
  getPersonalizedSongs: (_pool: any[], _n?: number) => [] as any[],
} as any;

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
  continuousPlay: boolean;
  toggleContinuousPlay: () => void;
  continuousUntil: number | null; // epoch ms when the current 1h window expires
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
  const [continuousPlay, setContinuousPlay] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("continuousPlay");
      return v === null ? true : v === "1";
    } catch { return true; }
  });
  const [continuousUntil, setContinuousUntil] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadTokenRef = useRef(0);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to always hold latest callbacks (avoids stale closures in Media Session)
  const callbackRefs = useRef({
    resumeSong: () => {},
    pauseSong: () => {},
    nextSong: () => {},
    previousSong: () => {},
    seek: (time: number) => {},
  });

  // Algorithm instances
  const playbackQueueRef = useRef(new PlaybackQueue());
  const shufflerRef = useRef(new NoRepeatShuffler(uniqueSongs));

  // Expose queue as array for UI
  const queue = playbackQueueRef.current.getAll();

  // Keep the device awake while playing so audio continues with screen off.
  useWakeLock(isPlaying);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      // Keep audio playing in background / lock screen
      audioRef.current.preload = "auto";
      (audioRef.current as any).playsInline = true;
      audioRef.current.setAttribute("playsinline", "true");
      audioRef.current.setAttribute("webkit-playsinline", "true");
      audioRef.current.setAttribute("x-webkit-airplay", "allow");
      audioRef.current.crossOrigin = "anonymous";
      // Attach to DOM — required on some mobile browsers for the Media
      // Session notification + transport controls to appear reliably.
      audioRef.current.style.display = "none";
      try { document.body.appendChild(audioRef.current); } catch { /* ignore */ }
    }

    // Register Media Session handlers that delegate to refs (never stale).
    // The notification PLAY / PAUSE / NEXT / PREV / SEEK buttons fire these.
    mediaSessionManager.registerHandlers({
      onPlay: () => callbackRefs.current.resumeSong(),
      onPause: () => callbackRefs.current.pauseSong(),
      onNextTrack: () => callbackRefs.current.nextSong(),
      onPreviousTrack: () => callbackRefs.current.previousSong(),
      onSeekTo: (time) => callbackRefs.current.seek(time),
      onSeekForward: (offset) => {
        if (audioRef.current) callbackRefs.current.seek(audioRef.current.currentTime + offset);
      },
      onSeekBackward: (offset) => {
        if (audioRef.current) callbackRefs.current.seek(Math.max(0, audioRef.current.currentTime - offset));
      },
    });

    // Intentionally NO cleanup — handlers must outlive React StrictMode
    // double-mount so the OS notification controls keep working.
  }, []);

  // Defensive re-register on every song change in case any other code
  // (background services, third-party libs) overwrote the action handlers.
  useEffect(() => {
    if (!currentSong) return;
    mediaSessionManager.registerHandlers({
      onPlay: () => callbackRefs.current.resumeSong(),
      onPause: () => callbackRefs.current.pauseSong(),
      onNextTrack: () => callbackRefs.current.nextSong(),
      onPreviousTrack: () => callbackRefs.current.previousSong(),
      onSeekTo: (time) => callbackRefs.current.seek(time),
      onSeekForward: (offset) => {
        if (audioRef.current) callbackRefs.current.seek(audioRef.current.currentTime + offset);
      },
      onSeekBackward: (offset) => {
        if (audioRef.current) callbackRefs.current.seek(Math.max(0, audioRef.current.currentTime - offset));
      },
    });
  }, [currentSong?.id]);


  // Audio event listeners
  // Audio event listeners — attach ONCE. Use refs for handlers so they
  // never go stale and we don't tear down/recreate listeners on every
  // play/pause toggle (which was causing the "ended" event to be missed
  // and songs to stop instead of advancing to the next track).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        mediaSessionManager.updatePositionState(audio.currentTime, audio.duration);
      }
    };
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if ((callbackRefs.current as any).isRepeating?.()) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      callbackRefs.current.nextSong();
    };
    const handlePlay = () => {
      setIsPlaying(true);
      mediaSessionManager.updatePlaybackState(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      mediaSessionManager.updatePlaybackState(false);
    };
    // If a track errors out, auto-skip so playback never gets stuck.
    const handleError = () => callbackRefs.current.nextSong();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, []);


  // Keep callback refs always pointing to the latest functions so the
  // notification (Media Session) prev / next / play / pause buttons always
  // invoke the SAME handlers the in-app Player UI uses.
  useEffect(() => {
    callbackRefs.current.resumeSong = resumeSong;
    callbackRefs.current.pauseSong = pauseSong;
    callbackRefs.current.nextSong = nextSong;
    callbackRefs.current.previousSong = previousSong;
    callbackRefs.current.seek = seek;
    (callbackRefs.current as any).isRepeating = () => isRepeating;
  });

  // Mirror player state to the system notification at all times.
  // Any place that flips isPlaying / currentSong (UI buttons, queue auto-advance,
  // toggles, etc.) will now also update the notification icon + metadata.
  useEffect(() => {
    if (!currentSong) return;
    mediaSessionManager.updateMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album || currentSong.artist,
      imageUrl: currentSong.imageUrl,
      duration: audioRef.current?.duration,
    });
  }, [currentSong]);

  useEffect(() => {
    mediaSessionManager.updatePlaybackState(isPlaying);
    if (isPlaying && audioRef.current) {
      mediaSessionManager.startPositionTracking(audioRef.current);
    } else {
      mediaSessionManager.stopPositionTracking();
    }
  }, [isPlaying]);

  // When the real duration becomes available, push it to the lock-screen
  // seek bar so users immediately see the correct total time.
  useEffect(() => {
    if (!currentSong || !duration || !isFinite(duration)) return;
    mediaSessionManager.updatePositionState(currentTime, duration);
  }, [duration, currentSong?.id]);



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
      // Combine algorithm-based + preference-learner recommendations
      const hybridRecs = getHybridRecommendations(currentSong, recentlyPlayed, uniqueSongs, 20);
      const learnedRecs = userPreferenceLearner.getPersonalizedSongs(uniqueSongs, 20);
      
      // Merge: interleave learned and hybrid, deduplicate
      const seen = new Set<string>();
      const merged: typeof hybridRecs = [];
      const maxLen = Math.max(hybridRecs.length, learnedRecs.length);
      for (let i = 0; i < maxLen && merged.length < 25; i++) {
        if (i < learnedRecs.length && !seen.has(learnedRecs[i].id)) {
          seen.add(learnedRecs[i].id);
          merged.push(learnedRecs[i]);
        }
        if (i < hybridRecs.length && !seen.has(hybridRecs[i].id)) {
          seen.add(hybridRecs[i].id);
          merged.push(hybridRecs[i]);
        }
      }
      setRecommendations(merged.slice(0, 25));
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

  const playSong = useCallback((song: Song) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Record preference for the PREVIOUS song before switching
    if (currentSong) {
      userPreferenceLearner.recordPlay(currentSong, audio.currentTime);
    }

    setCurrentSong(song);
    addToRecentlyPlayed(song);
    try { getDeviceId(); trackRecordPlay(song); } catch { /* ignore */ }

    // Push metadata to the notification IMMEDIATELY (before load) so the
    // lock-screen / notification shade updates with no perceptible delay.
    mediaSessionManager.updateMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || song.artist,
      imageUrl: song.imageUrl,
    });
    mediaSessionManager.updatePlaybackState(true);

    // Guard against the "play() interrupted by a new load request" race that
    // happens when the user switches songs quickly (causes stuck playback and
    // a perceptible delay). Each call gets a token; only the latest token is
    // allowed to flip state / retry. We also clear any pending watchdog.
    const token = ++loadTokenRef.current;
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    const attemptPlay = () => {
      if (token !== loadTokenRef.current) return; // a newer song took over
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            if (token !== loadTokenRef.current) return;
            if (watchdogRef.current) {
              clearTimeout(watchdogRef.current);
              watchdogRef.current = null;
            }
            setIsPlaying(true);
            mediaSessionManager.startPositionTracking(audio);
          })
          .catch((error) => {
            if (token !== loadTokenRef.current) return;
            // AbortError = interrupted by a newer load; ignore (latest wins).
            if (error && error.name === "AbortError") return;
            console.error("Error playing song:", error);
            setIsPlaying(false);
          });
      }
    };

    // Swap source and start playing. Wait for the element to be ready before
    // calling play() to avoid the interruption race on rapid track changes.
    audio.src = song.audioUrl;
    audio.load();

    const onCanPlay = () => {
      audio.removeEventListener("canplay", onCanPlay);
      attemptPlay();
    };
    audio.addEventListener("canplay", onCanPlay);
    // Try immediately too — if already buffered this starts with no delay.
    attemptPlay();

    // Watchdog: if nothing is playing shortly after load (stuck track), skip.
    watchdogRef.current = setTimeout(() => {
      if (token !== loadTokenRef.current) return;
      if (audio.paused && audio.readyState < 2) {
        callbackRefs.current.nextSong();
      }
    }, 6000);
  }, [addToRecentlyPlayed, currentSong]);

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
    const song = uniqueSongs.find(s => s.id === songId);
    setLikedSongs(prev => {
      const isCurrentlyLiked = prev.includes(songId);
      if (song) {
        if (isCurrentlyLiked) {
          userPreferenceLearner.recordUnlike(song);
        } else {
          userPreferenceLearner.recordLike(song);
        }
      }
      return isCurrentlyLiked
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
