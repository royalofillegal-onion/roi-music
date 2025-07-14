import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Song } from "@/data/songs";
import { songs } from "@/data/songs";
import { toast } from "sonner";
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
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      if (queue.length > 0 || circularQueue.length > 0) {
        nextSong();
      } else if (isRepeating && currentSong) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        playNextFromAllSongs();
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
        album: 'RoyalStar Music',
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
    const saved = localStorage.getItem("likedSongs");
    if (saved) {
      setLikedSongs(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
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

    setCurrentSong(song);
    addToRecentlyPlayed(song);
    audioRef.current.src = song.audioUrl;
    audioRef.current.load();
    
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      
      showSongNotification(
        song.title,
        song.artist,
        song.imageUrl,
        song.id,
        song.duration
      );
      
      showAndroidNotification(`${song.title}`, `${song.artist} - RoyalStar Music`);
      
      registerMediaSession({
        title: song.title,
        artist: song.artist,
        imageUrl: song.imageUrl,
        duration: song.duration,
        id: song.id
      });
      
      signalContinuousPlayback();
      
      toast.success(`Now playing: ${song.title}`);
    }).catch(error => {
      console.error("Error playing song:", error);
      toast.error("Failed to play song");
    });
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
    setIsShuffled(prev => !prev);
    if (!isShuffled && queue.length > 0) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      toast.success("Shuffle enabled");
    } else {
      toast.success("Shuffle disabled");
    }
  };

  const toggleRepeat = () => {
    setIsRepeating(prev => !prev);
    toast.success(isRepeating ? "Repeat disabled" : "Repeat enabled");
  };

  const toggleLike = (songId: string) => {
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
    if (songs.length > 0) {
      const [firstSong, ...restSongs] = songs;
      createCircularQueue(songs, firstSong);
      playSong(firstSong);
      setQueue(restSongs);
      toast.success(`Playing playlist with ${songs.length} songs`);
    }
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
    if (!currentSong) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    
    console.log('Playing next song from all songs:', nextSong.title);
    playSong(nextSong);
  };

  const playPreviousFromAllSongs = () => {
    if (!currentSong) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    const prevSong = songs[prevIndex];
    
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
        seekTo: (time: number) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        },
        setVolume: (newVolume: number) => {
          if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolumeState(newVolume);
          }
        },
        addToQueue: (song: Song) => {
          setQueue(prev => [...prev, song]);
          toast.success(`Added "${song.title}" to queue`);
        },
        removeFromQueue: (index: number) => {
          setQueue(prev => prev.filter((_, i) => i !== index));
        },
        clearQueue: () => {
          setQueue([]);
          toast.success("Queue cleared");
        },
        toggleShuffle: () => {
          setIsShuffled(prev => !prev);
          if (!isShuffled && queue.length > 0) {
            const shuffled = [...queue].sort(() => Math.random() - 0.5);
            setQueue(shuffled);
            toast.success("Shuffle enabled");
          } else {
            toast.success("Shuffle disabled");
          }
        },
        toggleRepeat: () => {
          setIsRepeating(prev => !prev);
          toast.success(isRepeating ? "Repeat disabled" : "Repeat enabled");
        },
        toggleLike: (songId: string) => {
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
        },
        toggleLikeSong: async (songId: string): Promise<boolean> => {
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
          toast.success("Playing liked songs");
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
