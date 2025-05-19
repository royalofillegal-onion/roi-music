import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Song } from '@/data/songs';
import { supabase } from '@/integrations/supabase/client';
import { 
  requestNotificationPermission
} from '@/services/NotificationService';
import { 
  isAndroidWebView, 
  notifySongCompleted, 
  updateAndroidPlaybackState,
  getBackgroundPlaybackEnabled,
  requestBackgroundPlayback
} from '@/services/androidNotification';
import { showSongNotification } from '@/services/showSongNotification';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  recentlyPlayed: Song[];
  likedSongs: string[];
  playMode: 'sequence' | 'shuffle' | 'repeat';
  notificationsEnabled: boolean;
  backgroundPlaybackEnabled: boolean;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  previousSong: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToQueue: (song: Song) => void;
  addToPlaylist: (song: Song, playlistId: string) => void;
  toggleLikeSong: (songId: string) => Promise<boolean>;
  isLiked: (songId: string) => boolean;
  setPlaybackMode: (mode: 'sequence' | 'shuffle' | 'repeat') => void;
  enableNotifications: () => Promise<boolean>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [playMode, setPlayMode] = useState<'sequence' | 'shuffle' | 'repeat'>('sequence');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [songEndedByUser, setSongEndedByUser] = useState(false);
  const [forceNextSong, setForceNextSong] = useState(false);
  const [backgroundPlaybackEnabled, setBackgroundPlaybackEnabled] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [appInBackground, setAppInBackground] = useState(false);
  
  // Add timeUpdateInterval for smoother time updates
  const timeUpdateIntervalRef = useRef<number | null>(null);
  
  // Reference to track if a song transition is in progress
  const transitionInProgressRef = useRef(false);

  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element and load songs
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    // Set up event listeners with enhanced end detection
    audioRef.current.addEventListener('timeupdate', updateCurrentTime);
    audioRef.current.addEventListener('loadedmetadata', updateDuration);
    audioRef.current.addEventListener('ended', handleSongEnd);
    
    // Use canplaythrough event to start playing as soon as enough data is available
    audioRef.current.addEventListener('canplaythrough', () => {
      if (isPlaying && audioRef.current) {
        console.log("Audio can play through, starting playback");
        audioRef.current.play().catch(error => {
          console.error("Playback error after canplaythrough:", error);
        });
      }
    });
    
    // Add error handler for better debugging
    audioRef.current.addEventListener('error', (e) => {
      console.error("Audio playback error:", e);
      // Try to recover and move to next song
      if (!transitionInProgressRef.current) {
        console.log("Error recovery - trying next song");
        nextSong();
      }
    });
    
    // More precise time updating with setInterval
    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        
        // Force check for song end for continuous playback
        if (audioRef.current.duration > 0 && 
            audioRef.current.currentTime > 0 && 
            audioRef.current.duration - audioRef.current.currentTime <= 0.3 &&
            !songEndedByUser && 
            !transitionInProgressRef.current) {
          console.log("Force checking song end for continuous playback");
          setForceNextSong(true);
        }
      }
    }, 200);

    // Add visibility change listener for Android background detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for Android background playback status
    if (isAndroidWebView()) {
      const bgEnabled = getBackgroundPlaybackEnabled();
      setBackgroundPlaybackEnabled(bgEnabled);
      if (!bgEnabled) {
        requestBackgroundPlayback();
      }
    }

    // Import songs from the database
    import('@/data/songs').then(module => {
      setAvailableSongs(module.songs);
    });
    
    // Clean up
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateCurrentTime);
        audioRef.current.removeEventListener('loadedmetadata', updateDuration);
        audioRef.current.removeEventListener('ended', handleSongEnd);
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
      
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle visibility change for Android background detection
  const handleVisibilityChange = () => {
    const isHidden = document.hidden;
    console.log("Visibility changed, hidden:", isHidden);
    setAppInBackground(isHidden);
    
    if (isHidden) {
      // App going to background
      if (isPlaying && currentSong) {
        // Update notification with current playback state
        showSongNotification(
          `Now Playing: ${currentSong.title}`,
          `By ${currentSong.artist}`,
          currentSong.imageUrl,
          true
        );
      }
    }
  };

  // Force next song when forceNextSong is true
  useEffect(() => {
    if (forceNextSong && !transitionInProgressRef.current) {
      console.log("Forcing next song due to time detection");
      transitionInProgressRef.current = true;
      handleSongEnd();
      setForceNextSong(false);
    }
  }, [forceNextSong]);

  // Load user's liked songs
  useEffect(() => {
    fetchLikedSongs();
  }, []);
  
  // Enhanced update audio element when song changes with improved duration detection
  useEffect(() => {
    if (currentSong && audioRef.current) {
      console.log("Setting up new song:", currentSong.title);
      transitionInProgressRef.current = false;
      
      // Set audio source
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      
      // Reset time tracking variables
      setCurrentTime(0);
      setSongEndedByUser(false);
      
      // Wait for metadata to load to get accurate duration
      audioRef.current.onloadedmetadata = () => {
        console.log('Audio metadata loaded, duration:', audioRef.current?.duration);
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      if (isPlaying) {
        console.log("Attempting to play new song");
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Playback error:', error);
            setIsPlaying(false);
          });
        }
        
        // Show notification with song info and playing state
        if (notificationsEnabled && currentSong) {
          showSongNotification(
            currentSong.title,
            currentSong.artist,
            currentSong.imageUrl,
            isPlaying
          );
        }
      }
    }
  }, [currentSong]);
  
  // Update audio element when play state changes with notification update
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Playback error:', error);
            setIsPlaying(false);
          });
        }
        
        // Update Android notification with playing state
        if (currentSong && isAndroidWebView()) {
          updateAndroidPlaybackState(true);
        }
      } else {
        audioRef.current.pause();
        
        // Update Android notification with paused state
        if (currentSong && isAndroidWebView()) {
          updateAndroidPlaybackState(false);
        }
      }
      
      // Update notification if song is playing when background state changes
      if (currentSong && appInBackground && isPlaying) {
        showSongNotification(
          currentSong.title,
          currentSong.artist,
          currentSong.imageUrl,
          isPlaying
        );
      }
    }
  }, [isPlaying, appInBackground]);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Fetch liked songs from Supabase
  const fetchLikedSongs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data, error } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', session.user.id);
        
      if (!error && data) {
        const songIds = data.map(item => item.song_id);
        setLikedSongs(songIds);
      }
    }
  };
  
  // Enhanced update current time when playing with improved song transition
  const updateCurrentTime = () => {
    if (audioRef.current) {
      const currentAudioTime = audioRef.current.currentTime;
      const audioDuration = audioRef.current.duration;
      
      setCurrentTime(currentAudioTime);
      
      // Enhanced song ending detection for better transition
      // Using a very small threshold to catch the ending precisely
      if (audioDuration > 0 && 
          currentAudioTime > 0 &&
          audioDuration - currentAudioTime <= 0.2 &&
          !songEndedByUser &&
          !transitionInProgressRef.current) {
        console.log("Enhanced song end detection triggered, duration:", audioDuration, "current:", currentAudioTime);
        setSongEndedByUser(true);
        transitionInProgressRef.current = true;
        // Immediately prepare next song for seamless transition
        handleSongEnd();
      }
    }
  };
  
  // Update duration when audio metadata is loaded
  const updateDuration = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      console.log('Duration updated from metadata:', audioDuration);
      setDuration(audioDuration);
      
      // If the song metadata has a different duration than what's in our data, log it
      if (currentSong && Math.abs(currentSong.duration - audioDuration) > 5) {
        console.log('Duration mismatch:', currentSong.title, 'Metadata:', audioDuration, 'Data:', currentSong.duration);
      }
    }
  };
  
  // Enhanced handleSongEnd function for improved continuous playback
  const handleSongEnd = () => {
    console.log('Song ended, playback mode:', playMode);
    setSongEndedByUser(false);
    
    // Notify Android that song completed (for background handling)
    if (isAndroidWebView()) {
      notifySongCompleted();
    }
    
    if (transitionInProgressRef.current) {
      console.log("Transition already in progress, skipping duplicate handleSongEnd");
      return;
    }
    
    transitionInProgressRef.current = true;
    setLastInteractionTime(Date.now());
    
    if (playMode === 'repeat' && currentSong) {
      // Repeat current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        transitionInProgressRef.current = false;
        audioRef.current.play().catch(error => {
          console.error('Error in repeat mode playback:', error);
          setIsPlaying(false);
          transitionInProgressRef.current = false;
        });
      }
      return;
    }
    
    if (queue.length > 0) {
      // Play next song in queue
      const nextQueueSong = queue[0];
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      
      // Add current song to recently played if it exists
      if (currentSong) {
        const newRecentlyPlayed = [
          currentSong, 
          ...recentlyPlayed.filter(s => s.id !== currentSong.id)
        ].slice(0, 10);
        setRecentlyPlayed(newRecentlyPlayed);
      }
      
      console.log("Playing next song from queue:", nextQueueSong.title);
      setCurrentSong(nextQueueSong);
      setIsPlaying(true);
      return;
    }
    
    // Get the next song in circular linked list style when queue is empty
    if (availableSongs.length > 0 && currentSong) {
      // Find current index in available songs
      const currentIndex = availableSongs.findIndex(song => song.id === currentSong.id);
      
      // Add current song to recently played
      const newRecentlyPlayed = [
        currentSong, 
        ...recentlyPlayed.filter(s => s.id !== currentSong.id)
      ].slice(0, 10);
      setRecentlyPlayed(newRecentlyPlayed);
      
      if (playMode === 'shuffle') {
        // Play a random song that's not the current one
        let availableForShuffle = [...availableSongs];
        if (availableForShuffle.length > 1) {
          availableForShuffle = availableForShuffle.filter(song => song.id !== currentSong.id);
        }
        const randomIndex = Math.floor(Math.random() * availableForShuffle.length);
        const nextSong = availableForShuffle[randomIndex];
        console.log('Playing random song next:', nextSong.title);
        setCurrentSong(nextSong);
        setIsPlaying(true);
      } else if (playMode === 'sequence') {
        // Sequence mode uses circular linked list structure
        let nextIndex = (currentIndex + 1) % availableSongs.length;
        const nextSong = availableSongs[nextIndex];
        console.log('Playing next song in sequence:', nextSong.title);
        setCurrentSong(nextSong);
        setIsPlaying(true);
      }
    }
  };
  
  // Play a specific song
  const playSong = (song: Song) => {
    // Add current song to recently played if it exists
    if (currentSong) {
      const newRecentlyPlayed = [
        currentSong, 
        ...recentlyPlayed.filter(s => s.id !== currentSong.id)
      ].slice(0, 10);
      setRecentlyPlayed(newRecentlyPlayed);
    }
    
    console.log("Play song called for:", song.title);
    setCurrentSong(song);
    setIsPlaying(true);
    setSongEndedByUser(false);
    transitionInProgressRef.current = false;
  };
  
  // Pause current song
  const pauseSong = () => {
    setIsPlaying(false);
  };
  
  // Toggle play/pause with notification update
  const togglePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    // Update Android notification with new playing state
    if (currentSong && isAndroidWebView()) {
      updateAndroidPlaybackState(newPlayingState);
    }
  };
  
  // Enhanced nextSong function for circular linked list approach
  const nextSong = () => {
    if (transitionInProgressRef.current) {
      console.log("Song transition already in progress, ignoring nextSong request");
      return;
    }
    
    console.log("Next song manual trigger");
    setSongEndedByUser(true);
    transitionInProgressRef.current = true;
    
    if (queue.length > 0) {
      // Play from queue first
      const nextQueueSong = queue[0];
      const newQueue = queue.slice(1);
      setQueue(newQueue);
      playSong(nextQueueSong);
    } else if (currentSong && availableSongs.length > 0) {
      const currentIndex = availableSongs.findIndex(song => song.id === currentSong.id);
      
      if (playMode === 'shuffle') {
        // Play a random song that's not the current one
        let availableForShuffle = [...availableSongs];
        if (availableForShuffle.length > 1) {
          availableForShuffle = availableForShuffle.filter(song => song.id !== currentSong.id);
        }
        const randomIndex = Math.floor(Math.random() * availableForShuffle.length);
        playSong(availableForShuffle[randomIndex]);
      } else {
        // Circular linked list approach - play next song with wraparound
        const nextIndex = (currentIndex + 1) % availableSongs.length;
        playSong(availableSongs[nextIndex]);
      }
    }
  };
  
  // Enhanced previousSong function for circular linked list approach
  const previousSong = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If current song has played for more than 3 seconds, restart it
      audioRef.current.currentTime = 0;
      setSongEndedByUser(false);
    } else if (recentlyPlayed.length > 0) {
      // Play the most recent song
      const prevSong = recentlyPlayed[0];
      playSong(prevSong);
      setRecentlyPlayed(recentlyPlayed.slice(1));
    } else if (currentSong && availableSongs.length > 0) {
      // Find current song in available songs
      const currentIndex = availableSongs.findIndex(song => song.id === currentSong.id);
      
      if (playMode === 'shuffle') {
        // Play a random song
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        playSong(availableSongs[randomIndex]);
      } else {
        // Circular linked list approach - play previous song with wraparound
        const prevIndex = (currentIndex - 1 + availableSongs.length) % availableSongs.length;
        playSong(availableSongs[prevIndex]);
      }
    }
  };
  
  // Set volume
  const setVolumeHandler = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  // Seek to specific time
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      
      // Reset song ended flag if user seeks back
      if (time < duration - 1) {
        setSongEndedByUser(false);
      }
    }
  };
  
  // Add song to queue
  const addToQueue = (song: Song) => {
    setQueue([...queue, song]);
  };
  
  // Add song to playlist
  const addToPlaylist = (song: Song, playlistId: string) => {
    // Implementation will be added later
    console.log(`Add ${song.title} to playlist ${playlistId}`);
  };
  
  // Toggle like/unlike song
  const toggleLikeSong = async (songId: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // User is not logged in
      return false;
    }
    
    const userId = session.user.id;
    
    // Check if song is already liked
    const isCurrentlyLiked = likedSongs.includes(songId);
    
    if (isCurrentlyLiked) {
      // Unlike song
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId);
        
      if (!error) {
        setLikedSongs(likedSongs.filter(id => id !== songId));
        return false;
      }
    } else {
      // Like song
      const { error } = await supabase
        .from('liked_songs')
        .insert({
          user_id: userId,
          song_id: songId
        });
        
      if (!error) {
        setLikedSongs([...likedSongs, songId]);
        return true;
      }
    }
    
    return isCurrentlyLiked;
  };
  
  // Check if song is liked
  const isLiked = (songId: string): boolean => {
    return likedSongs.includes(songId);
  };
  
  // Set playback mode
  const setPlaybackMode = (mode: 'sequence' | 'shuffle' | 'repeat') => {
    setPlayMode(mode);
  };
  
  // Enable notifications
  const enableNotifications = async (): Promise<boolean> => {
    const permission = await requestNotificationPermission();
    const enabled = permission === 'granted';
    setNotificationsEnabled(enabled);
    return enabled;
  };
  
  const value = {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    recentlyPlayed,
    likedSongs,
    playMode,
    notificationsEnabled,
    backgroundPlaybackEnabled,
    playSong,
    pauseSong,
    togglePlayPause,
    nextSong,
    previousSong,
    setVolume: setVolumeHandler,
    seekTo,
    addToQueue,
    addToPlaylist,
    toggleLikeSong,
    isLiked,
    setPlaybackMode,
    enableNotifications
  };
  
  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
