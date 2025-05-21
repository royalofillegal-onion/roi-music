
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, ListMusic, Maximize2, Minimize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/PlayerContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

const Player = () => {
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
    queue
  } = usePlayer();
  
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showQueueTooltip, setShowQueueTooltip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const prevTimeRef = useRef(currentTime);
  const songEndingRef = useRef(false);
  
  // Format time in MM:SS format
  const formatTime = (time: number) => {
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
    
    // Force enable continuous playback - more aggressive check
    const enableContinuousPlayback = () => {
      if (duration > 0 && currentTime >= duration - 1) {
        console.log("Player component forcing next song due to end detection");
        if (!songEndingRef.current) {
          songEndingRef.current = true;
          nextSong();
        }
      } else {
        songEndingRef.current = false;
      }
    };
    
    // Check more frequently for end of song to ensure continuous playback
    const playbackCheckInterval = setInterval(enableContinuousPlayback, 250);
    
    return () => {
      clearInterval(playbackCheckInterval);
    };
  }, []);
  
  // Update local time when currentTime changes from context
  useEffect(() => {
    setLocalCurrentTime(currentTime);
    prevTimeRef.current = currentTime;
    
    // Enhanced song end detection to force continuous playback
    if (duration > 0 && currentTime > 0 && duration - currentTime <= 1) {
      console.log("Song is about to end, preparing for next song");
    }
  }, [currentTime, duration]);
  
  // Track duration changes to detect song end
  useEffect(() => {
    if (duration > 0 && currentTime > 0 && (duration - currentTime <= 0.5) && !songEndingRef.current) {
      console.log("End detection in Player component - triggering next song");
      songEndingRef.current = true;
      nextSong();
    }
  }, [currentTime, duration, nextSong]);
  
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
  };
  
  // Handle swipe down to close fullscreen (for mobile)
  const handleTouchStart = React.useRef<number>(0);
  const handleTouchMove = React.useRef<number>(0);
  const handleTouchEnd = React.useRef<() => void>(() => {});
  
  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.touches[0].clientY;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    handleTouchMove.current = e.touches[0].clientY;
  };
  
  const onTouchEnd = () => {
    if (handleTouchMove.current - handleTouchStart.current > 100) {
      // Swipe down detected
      setIsFullscreen(false);
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
        className="fixed inset-0 z-50 bg-gradient-to-b from-black to-gray-900 flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-end p-4">
          <button 
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
            aria-label="Exit fullscreen"
          >
            <Minimize2 className="h-6 w-6" />
          </button>
        </div>
        
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
            
            {isMounted && (
              <div className="w-full flex items-center space-x-3">
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
            
            <div className="flex justify-center items-center space-x-8">
              <Button
                onClick={previousSong}
                variant="ghost"
                className="text-white"
                aria-label="Previous song"
              >
                <SkipBack className="h-8 w-8" />
              </Button>
              
              <Button
                onClick={togglePlayPause}
                variant="playerControl"
                size="playerIcon"
                className="p-4"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
              
              <Button
                onClick={nextSong}
                variant="ghost"
                className="text-white"
                aria-label="Next song"
              >
                <SkipForward className="h-8 w-8" />
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-6">
              <button 
                onClick={handlePlayModeChange} 
                className={cn(
                  "text-gray-400 hover:text-white",
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
              
              <div className="relative">
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
          <Button
            onClick={previousSong}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white mr-2 md:mr-6"
            aria-label="Previous song"
          >
            <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            variant="playerControl"
            size="playerIcon"
            className="mx-2"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <Play className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </Button>
          
          <Button
            onClick={nextSong}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white ml-2 md:ml-6"
            aria-label="Next song"
          >
            <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
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

export default Player;
