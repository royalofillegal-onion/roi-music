import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, ListMusic, Maximize2, Minimize2, ChevronUp, ChevronDown, Mic, Info, Heart, Share2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/PlayerContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  showSongNotification, 
  preNotifyNextSong, 
  supportsContinuousPlayback, 
  signalSongEnding,
  signalSongTransition,
  forceNextSong
} from '../services/NotificationService';

const sampleLyrics = {
  "song1": "This is where the lyrics would go\nVerse 1 lyrics here\nMore lyrics for the first verse\n\nChorus\nThis is the chorus\nMore chorus lyrics\n\nVerse 2\nSecond verse lyrics here\nContinuing the second verse",
  "song2": "Different song lyrics\nThis is another song's verse\nWith different words\n\nChorus\nAnother chorus here\nWith its own lyrics\n\nBridge\nThis song has a bridge\nWith unique lyrics",
  // More sample lyrics can be added as needed
};

const EnhancedPlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    playMode,
    togglePlayPause,
    previousSong,
    nextSong,
    setVolume,
    seekTo,
    setPlaybackMode,
    queue,
    circularQueue,
    toggleLikeSong,
    isLiked
  } = usePlayer();
  
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showQueueTooltip, setShowQueueTooltip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [swipeDirectionX, setSwipeDirectionX] = useState(0);
  const prevTimeRef = useRef(currentTime);
  const songEndingRef = useRef(false);
  const nextSongTriggerLock = useRef(false);
  
  const [supportsContinuous, setSupportsContinuous] = useState(true);
  const continuousPlaybackCheckRef = useRef(false);
  const nextSongPrefetchedRef = useRef(false);
  const songTransitionInProgressRef = useRef(false);
  
  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  // Volume icon based on volume level
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  // Run after component mounts to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    setLocalCurrentTime(currentTime);
    
    // Check for continuous playback support
    if (!continuousPlaybackCheckRef.current) {
      continuousPlaybackCheckRef.current = true;
      setSupportsContinuous(supportsContinuousPlayback());
    }
    
    // Super aggressive end detection with multiple layers of redundancy
    const enableContinuousPlayback = () => {
      if (!currentSong || songEndingRef.current || songTransitionInProgressRef.current) {
        return;
      }
      
      const endThreshold = supportsContinuous ? 1.5 : 1.0; // Slightly more aggressive
      
      if (duration > 0 && currentTime > 0 && currentTime >= duration - endThreshold) {
        console.log("Player component forcing next song due to end detection");
        songEndingRef.current = true;
        songTransitionInProgressRef.current = true;
        
        // Signal to service worker that song is ending
        if (queue.length > 0) {
          const nextQueueSong = queue[0];
          signalSongEnding(nextQueueSong);
          
          // Pre-notify for imminent transition
          preNotifyNextSong(
            nextQueueSong.title, 
            nextQueueSong.artist, 
            nextQueueSong.imageUrl,
            nextQueueSong.id
          );
          
          // Signal song transition to Android
          if (currentSong) {
            signalSongTransition(currentSong.id, nextQueueSong.id);
          }
        }
        
        // Force next song with a slight delay to allow notifications to register
        setTimeout(() => {
          nextSong();
          
          // Reset flags after a delay
          setTimeout(() => {
            songEndingRef.current = false;
            songTransitionInProgressRef.current = false;
          }, 500);
        }, 150);
      }
    };
    
    // Check more frequently for end of song to ensure continuous playback
    const playbackCheckInterval = setInterval(enableContinuousPlayback, supportsContinuous ? 200 : 100); // More frequent checks
    
    // Set up a backup interval for checking if song needs to progress
    const backupProgressInterval = setInterval(() => {
      // If a song has been playing but progress has stalled
      if (currentSong && isPlaying && prevTimeRef.current === currentTime && 
          currentTime > 0 && currentTime < duration - 2 && duration > 0) {
        console.log("Detected stalled playback, attempting to resume");
        // Try to nudge playback
        seekTo(currentTime + 0.1);
      }
      
      // Pre-fetch next song when approaching end
      const prefetchThreshold = supportsContinuous ? 15 : 10;
      if (currentSong && isPlaying && duration > 0 && 
          currentTime > 0 && duration - currentTime <= prefetchThreshold &&
          !nextSongPrefetchedRef.current && queue.length > 0) {
        // Pre-notify for next song when we're approaching the end
        const nextQueueSong = queue[0];
        preNotifyNextSong(
          nextQueueSong.title, 
          nextQueueSong.artist, 
          nextQueueSong.imageUrl,
          nextQueueSong.id
        );
        nextSongPrefetchedRef.current = true;
      }
    }, 2000);
    
    return () => {
      clearInterval(playbackCheckInterval);
      clearInterval(backupProgressInterval);
    };
  }, []);
  
  // Update local time when currentTime changes from context
  useEffect(() => {
    setLocalCurrentTime(currentTime);
    prevTimeRef.current = currentTime;
  }, [currentTime, duration]);
  
  // Track duration changes to detect song end - with better debouncing
  useEffect(() => {
    const endThreshold = supportsContinuous ? 0.8 : 1.2;
    
    if (duration > 0 && currentTime > 0 && 
        (duration - currentTime <= endThreshold) && 
        !songEndingRef.current &&
        !songTransitionInProgressRef.current) {
      console.log("End detection in Player component - triggering next song");
      songEndingRef.current = true;
      songTransitionInProgressRef.current = true;
      
      // Pre-notify for next song if in queue
      if (queue.length > 0) {
        const nextQueueSong = queue[0];
        // Signal song ending to service worker
        signalSongEnding(nextQueueSong);
        
        preNotifyNextSong(
          nextQueueSong.title, 
          nextQueueSong.artist, 
          nextQueueSong.imageUrl,
          nextQueueSong.id
        );
        
        // Signal song transition to Android
        if (currentSong) {
          signalSongTransition(currentSong.id, nextQueueSong.id);
        }
      }
      
      // Force next song with a slight delay to allow notifications to register
      setTimeout(() => {
        nextSong();
      }, 100);
    }
  }, [currentTime, duration, nextSong, queue, currentSong]);
  
  // Reset locks when song changes
  useEffect(() => {
    if (currentSong) {
      songEndingRef.current = false;
      nextSongPrefetchedRef.current = false;
      songTransitionInProgressRef.current = false;
      
      // Show notification for new song with enhanced Android support
      if (isPlaying) {
        showSongNotification(
          currentSong.title,
          currentSong.artist,
          currentSong.imageUrl,
          currentSong.id,
          currentSong.duration,
          isPlaying,
        );
      }
    }
  }, [currentSong, isPlaying]);
  
  // Add this effect to pre-notify when songs change
  useEffect(() => {
    // Wait a bit after song changes to pre-notify for next song
    if (currentSong && isPlaying && queue.length > 0) {
      // Delay to avoid too many notifications at once
      const notifyDelay = 1500;
      const notifyTimeout = setTimeout(() => {
        const nextQueueSong = queue[0];
        if (nextQueueSong) {
          preNotifyNextSong(
            nextQueueSong.title, 
            nextQueueSong.artist, 
            nextQueueSong.imageUrl,
            nextQueueSong.id
          );
        }
      }, notifyDelay);
      
      return () => clearTimeout(notifyTimeout);
    }
  }, [currentSong, isPlaying, queue]);
  
  // Special effect for isPlaying changes
  useEffect(() => {
    if (currentSong && isPlaying) {
      // When playback starts or resumes, ensure Android knows about it
      showSongNotification(
        currentSong.title,
        currentSong.artist,
        currentSong.imageUrl,
        currentSong.id,
        currentSong.duration,
        true,
      );
    }
  }, [isPlaying]);
  
  // Handle seeking in the track
  const handleSeek = (value: number[]) => {
    setLocalCurrentTime(value[0]);
    seekTo(value[0]);
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  
  // Handle playback mode change
  const handlePlayModeChange = () => {
    if (playMode === 'sequence') {
      setPlaybackMode('shuffle');
    } else if (playMode === 'shuffle') {
      setPlaybackMode('repeat');
    } else {
      setPlaybackMode('sequence');
    }
  };

  const getPlayModeLabel = () => {
    switch (playMode) {
      case 'shuffle': return 'Shuffle';
      case 'repeat': return 'Repeat';
      default: return 'Sequence';
    }
  };
  
  // Toggle fullscreen player
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowLyrics(false);
    setShowDetails(false);
  };
  
  // Toggle lyrics display
  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
    setShowDetails(false);
  };
  
  // Toggle details display
  const toggleDetails = () => {
    setShowDetails(!showDetails);
    setShowLyrics(false);
  };
  
  // Get lyrics for the current song
  const getLyrics = () => {
    if (!currentSong) return "No lyrics available";
    // In a real implementation, this would fetch lyrics from an API or database
    return sampleLyrics[currentSong.id] || "No lyrics available for this song";
  };
  
  // Enhanced swipe gestures with better detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStartY(e.touches[0].clientY);
    setSwipeStartX(e.touches[0].clientX);
    setSwipeDistance(0);
    setSwipeDirectionX(0);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const distanceY = swipeStartY - currentY;
    const distanceX = currentX - swipeStartX;
    setSwipeDistance(distanceY);
    setSwipeDirectionX(distanceX);
  };
  
  const handleTouchEnd = () => {
    const swipeThreshold = 80;
    
    // Vertical swipes
    if (Math.abs(swipeDistance) > Math.abs(swipeDirectionX)) {
      // Swipe up (positive distance) to go to next song
      if (swipeDistance > swipeThreshold) {
        handleNextSong();
      }
      // Swipe down (negative distance) to go to previous song or exit fullscreen
      else if (swipeDistance < -swipeThreshold) {
        if (Math.abs(swipeDistance) > 150) {
          setIsFullscreen(false);
        } else {
          handlePreviousSong();
        }
      }
    }
    // Horizontal swipes
    else if (Math.abs(swipeDirectionX) > swipeThreshold) {
      // Swipe right to show details
      if (swipeDirectionX > swipeThreshold) {
        setShowDetails(true);
        setShowLyrics(false);
      }
      // Swipe left to show lyrics
      else if (swipeDirectionX < -swipeThreshold) {
        setShowLyrics(true);
        setShowDetails(false);
      }
    }
    
    setSwipeDistance(0);
    setSwipeDirectionX(0);
  };
  
  // Manual next song handler with proper debugging
  const handleNextSong = () => {
    console.log('Next button clicked');
    console.log('Queue length:', queue.length);
    console.log('Circular queue length:', circularQueue.length);
    
    if (!songTransitionInProgressRef.current) {
      songTransitionInProgressRef.current = true;
      
      // Pre-notify for next song if in queue
      if (queue.length > 0) {
        const nextQueueSong = queue[0];
        signalSongEnding(nextQueueSong);
        
        preNotifyNextSong(
          nextQueueSong.title, 
          nextQueueSong.artist, 
          nextQueueSong.imageUrl,
          nextQueueSong.id
        );
        
        // Signal song transition to Android
        if (currentSong) {
          signalSongTransition(currentSong.id, nextQueueSong.id);
        }
      }
      
      // Call next song function
      nextSong();
      
      // Reset transition flag after a delay
      setTimeout(() => {
        songTransitionInProgressRef.current = false;
      }, 1000);
    }
  };
  
  // Manual previous song handler with proper debugging
  const handlePreviousSong = () => {
    console.log('Previous button clicked');
    console.log('Current time:', currentTime);
    
    if (!songTransitionInProgressRef.current) {
      songTransitionInProgressRef.current = true;
      previousSong();
      
      // Reset transition flag after a delay
      setTimeout(() => {
        songTransitionInProgressRef.current = false;
      }, 1000);
    }
  };
  
  // If no song is playing, render minimal player
  if (!currentSong) {
    return (
      <div className="fixed bottom-16 left-0 right-0 md:bottom-0 md:left-16 glass-effect h-16 flex items-center px-4">
        <div className="w-full text-center text-sm text-gray-400">
          Select a song to play
        </div>
      </div>
    );
  }
  
  // Render fullscreen player if active
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-gradient-to-b from-black to-gray-900 flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-between items-center p-4 flex-shrink-0">
          <div className="text-sm text-gray-400">
            {showLyrics ? "Lyrics" : showDetails ? "Song Details" : "Now Playing"}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleLikeSong(currentSong.id)}
              className={cn(
                "text-gray-400 hover:text-white",
                isLiked(currentSong.id) && "text-red-500"
              )}
              aria-label={isLiked(currentSong.id) ? "Unlike song" : "Like song"}
            >
              <Heart className={cn("h-5 w-5", isLiked(currentSong.id) && "fill-current")} />
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: currentSong.title,
                    text: `Listen to ${currentSong.title} by ${currentSong.artist}`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(`${currentSong.title} by ${currentSong.artist} - ${window.location.href}`);
                }
              }}
              className="text-gray-400 hover:text-white"
              aria-label="Share song"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleDetails}
              className={cn(
                "text-gray-400 hover:text-white",
                showDetails && "text-music-accent"
              )}
              aria-label="Show song details"
            >
              <Info className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="text-gray-400 hover:text-white"
              aria-label="Exit fullscreen"
            >
              <Minimize2 className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {showLyrics ? (
          <div className="flex-1 px-4 py-2 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="whitespace-pre-line text-lg leading-relaxed">
                {getLyrics()}
              </div>
            </ScrollArea>
          </div>
        ) : showDetails ? (
          <div className="flex-1 px-4 py-2 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <div className="text-center">
                  <img 
                    src={currentSong.imageUrl} 
                    alt={currentSong.title}
                    className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover"
                  />
                  <h2 className="text-2xl font-bold mb-2">{currentSong.title}</h2>
                  <p className="text-lg text-gray-400 mb-4">{currentSong.artist}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Song Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <p className="font-medium">{formatTime(duration)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Progress:</span>
                        <p className="font-medium">{Math.round((currentTime / duration) * 100) || 0}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Playback</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Mode:</span>
                        <p className="font-medium">{getPlayModeLabel()}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Volume:</span>
                        <p className="font-medium">{Math.round(volume * 100)}%</p>
                      </div>
                    </div>
                  </div>
                  
                  {queue.length > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">Up Next</h3>
                      <ScrollArea className="h-40">
                        <div className="space-y-2 pr-4">
                          {queue.slice(0, 10).map((song, index) => (
                            <div key={song.id} className="flex items-center gap-3">
                              <img 
                                src={song.imageUrl} 
                                alt={song.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{song.title}</p>
                                <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                              </div>
                            </div>
                          ))}
                          {queue.length > 10 && (
                            <p className="text-gray-400 text-sm">+{queue.length - 10} more songs</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md mb-8">
              <AspectRatio ratio={1/1} className="bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src={currentSong.imageUrl} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            
            <div className="w-full max-w-md space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold">{currentSong.title}</h2>
                <p className="text-gray-400">{currentSong.artist}</p>
              </div>
            </div>
            
            {/* Swipe hints */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Swipe up/down for next/previous • Swipe left for lyrics • Swipe right for details
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4 pb-6 flex-shrink-0">
          {isMounted && (
            <div className="w-full flex items-center space-x-3 mb-4">
              <span className="text-xs text-gray-400">
                {formatTime(localCurrentTime)}
              </span>
              
              <Slider
                value={[localCurrentTime]}
                min={0}
                max={duration || 1}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              
              <span className="text-xs text-gray-400">
                {formatTime(duration)}
              </span>
            </div>
          )}
          
          <div className="flex justify-center items-center space-x-8 mb-4">
            <button
              onClick={handlePreviousSong}
              className="text-white"
              aria-label="Previous song"
            >
              <SkipBack className="h-8 w-8" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="bg-white text-black rounded-full p-4 hover:bg-gray-200 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </button>
            
            <button
              onClick={handleNextSong}
              className="text-white"
              aria-label="Next song"
            >
              <SkipForward className="h-8 w-8" />
            </button>
          </div>
          
          <div className="flex justify-center items-center space-x-6">
            <button 
              onClick={handlePlayModeChange} 
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                (playMode !== 'sequence') && "text-music-accent"
              )}
              aria-label={`Change playback mode: ${getPlayModeLabel()}`}
            >
              {playMode === 'shuffle' ? (
                <Shuffle className="h-5 w-5" />
              ) : playMode === 'repeat' ? (
                <Repeat className="h-5 w-5" />
              ) : (
                <ListMusic className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={toggleLyrics}
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                showLyrics && "text-music-accent"
              )}
              aria-label={showLyrics ? "Hide lyrics" : "Show lyrics"}
            >
              <Mic className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Volume control"
              >
                <VolumeIcon />
              </button>
              
              {showVolumeControl && isMounted && (
                <div 
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded p-2 w-24"
                  onMouseLeave={() => setShowVolumeControl(false)}
                >
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    orientation="vertical"
                    className="h-20"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="h-1 w-20 bg-gray-700 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular player UI
  return (
    <div className="fixed bottom-16 left-0 right-0 md:bottom-0 md:left-16 glass-effect border-t border-gray-800 h-16 md:h-20 z-40">
      <div className="flex items-center h-full px-3 md:px-6">
        {/* Song info with fullscreen toggle */}
        <div className="flex items-center flex-1 min-w-0 md:w-1/3">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={toggleFullscreen}
          >
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-10 h-10 rounded md:w-14 md:h-14"
            />
            <div className="ml-3 truncate">
              <div className="font-medium truncate">{currentSong.title}</div>
              <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
            </div>
          </div>
          
          <button 
            onClick={toggleFullscreen}
            className="ml-2 text-gray-400 hover:text-white hidden md:block"
            aria-label="Expand player"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        
        {/* Player controls - visible on all screens */}
        <div className="flex items-center justify-center flex-1 md:w-1/3">
          <button
            onClick={handlePreviousSong}
            className="text-gray-400 hover:text-white mr-2 md:mr-6 transition-colors"
            aria-label="Previous song"
            disabled={songTransitionInProgressRef.current}
          >
            <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="bg-white text-black rounded-full p-1 hover:bg-gray-200 transition mx-2"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <Play className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
          
          <button
            onClick={handleNextSong}
            className="text-gray-400 hover:text-white ml-2 md:ml-6 transition-colors"
            aria-label="Next song"
            disabled={songTransitionInProgressRef.current}
          >
            <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handlePlayModeChange} 
                className={cn(
                  "text-gray-400 hover:text-white ml-2 md:ml-6 hidden md:block",
                  (playMode !== 'sequence') && "text-music-accent"
                )}
                aria-label={`Change playback mode: ${getPlayModeLabel()}`}
              >
                {playMode === 'shuffle' ? (
                  <Shuffle className="h-4 w-4 md:h-5 md:w-5" />
                ) : playMode === 'repeat' ? (
                  <Repeat className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <ListMusic className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Playback mode: {getPlayModeLabel()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Progress bar and volume - adjusts for screen size */}
        <div className="hidden md:flex items-center justify-end flex-1 md:w-1/3">
          {isMounted && (
            <>
              <span className="text-xs text-gray-400 mr-2 w-10">
                {formatTime(localCurrentTime)}
              </span>
              
              <div className="w-full max-w-xs mx-2">
                <Slider
                  value={[localCurrentTime]}
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
              </div>
              
              <span className="text-xs text-gray-400 ml-2 w-10">
                {formatTime(duration)}
              </span>
            </>
          )}
          
          <div className="ml-4 relative">
            <button
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              className="text-gray-400 hover:text-white"
              aria-label="Volume control"
            >
              <VolumeIcon />
            </button>
            
            {showVolumeControl && isMounted && (
              <div 
                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded p-2 w-24"
                onMouseLeave={() => setShowVolumeControl(false)}
              >
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  orientation="vertical"
                  className="h-20"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile progress bar */}
      {isMounted && (
        <div className="md:hidden absolute bottom-0 left-0 right-0">
          <Slider
            value={[localCurrentTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full h-1"
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedPlayer;
