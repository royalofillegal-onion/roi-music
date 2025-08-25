import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, ListMusic, Maximize2, Minimize2, Plus, User } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import AddToPlaylist from "@/components/AddToPlaylist";
import { uniqueSongs } from "@/data/allSongs";
import { Song } from "@/data/songs";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    queue,
    playSong
  } = usePlayer();
  
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showQueueTooltip, setShowQueueTooltip] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [showArtistSongs, setShowArtistSongs] = useState(false);
  
  // Enhanced mobile detection
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
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
  }, []);
  
  // Update local time when currentTime changes from context
  useEffect(() => {
    setLocalCurrentTime(currentTime);
  }, [currentTime, duration]);
  
  // Handle seeking in the track with debouncing
  const handleSeek = (value: number[]) => {
    setLocalCurrentTime(value[0]);
    seekTo(value[0]);
  };

  // Handle seeking with progress bar clicks
  const handleProgressSeek = (percentage: number) => {
    if (duration > 0) {
      const newTime = (percentage / 100) * duration;
      setLocalCurrentTime(newTime);
      seekTo(newTime);
    }
  };

  // Get artist songs for current song with duplicate filtering
  const getArtistSongs = (): Song[] => {
    if (!currentSong) return [];
    
    // Import uniqueSongs and filter by artist, removing duplicates by title and artist
    return uniqueSongs
      .filter(song => song.artist === currentSong.artist)
      .filter((song, index, self) => 
        index === self.findIndex(s => 
          s.title.toLowerCase().trim() === song.title.toLowerCase().trim() &&
          s.artist.toLowerCase().trim() === song.artist.toLowerCase().trim()
        )
      );
  };

  // Play selected artist song
  const playArtistSong = (song: Song) => {
    playSong(song);
    setShowArtistSongs(false);
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
                
                <div className="flex-1">
                  <Progress 
                    value={(localCurrentTime / (duration || 1)) * 100}
                    onSeek={handleProgressSeek}
                    className="h-2 cursor-pointer"
                  />
                </div>
                
                <span className="text-xs text-gray-400">
                  {formatTime(duration)}
                </span>
              </div>
            )}
            
            <div className="flex justify-center items-center space-x-8">
              <button
                onClick={previousSong}
                className="text-white hover:text-gray-300 rounded-full p-2 hover:bg-white/10 transition-all duration-200"
                aria-label="Previous song"
              >
                <SkipBack className="h-8 w-8" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="bg-white text-black rounded-full p-5 hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10" />
                ) : (
                  <Play className="h-10 w-10 pl-1" />
                )}
              </button>
              
              <button
                onClick={nextSong}
                className="text-white hover:text-gray-300 rounded-full p-2 hover:bg-white/10 transition-all duration-200"
                aria-label="Next song"
              >
                <SkipForward className="h-8 w-8" />
              </button>
            </div>
            
            <div className="flex justify-center items-center space-x-6">
              <AddToPlaylist 
                song={currentSong}
                trigger={
                  <button className="text-gray-400 hover:text-white rounded-full p-2 hover:bg-white/10 transition-all duration-200">
                    <Plus className="h-5 w-5" />
                  </button>
                }
              />

              <Sheet open={showArtistSongs} onOpenChange={setShowArtistSongs}>
                <SheetTrigger asChild>
                  <button className="text-gray-400 hover:text-white rounded-full p-2 hover:bg-white/10 transition-all duration-200">
                    <User className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-gray-900 border-gray-800 text-white h-[70vh]">
                  <SheetHeader>
                    <SheetTitle className="text-white">More from {currentSong.artist}</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full mt-4">
                    <div className="space-y-2">
                      {getArtistSongs().map((song, index) => (
                        <div
                          key={song.id}
                          className="flex items-center p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          onClick={() => playArtistSong(song)}
                        >
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="w-12 h-12 rounded object-cover mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{song.title}</div>
                            <div className="text-gray-400 text-sm truncate">{song.artist}</div>
                          </div>
                          <div className="text-gray-400 text-sm">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              <button 
                onClick={handlePlayModeChange} 
                className={cn(
                  "text-gray-400 hover:text-white rounded-full p-2 hover:bg-white/10 transition-all duration-200",
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
                  className="text-gray-400 hover:text-white rounded-full p-2 hover:bg-white/10 transition-all duration-200"
                  aria-label="Volume control"
                >
                  <VolumeIcon />
                </button>
                
                {showVolumeControl && isMounted && (
                  <div 
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded p-2 w-24 z-50"
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
          <button
            onClick={previousSong}
            className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200 mr-2 md:mr-4"
            aria-label="Previous song"
          >
            <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="bg-white text-black rounded-full p-2 md:p-3 hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 mx-2"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 md:h-7 md:w-7" />
            ) : (
              <Play className="h-6 w-6 md:h-7 md:w-7 pl-0.5" />
            )}
          </button>
          
          <button
            onClick={nextSong}
            className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200 ml-2 md:ml-4"
            aria-label="Next song"
          >
            <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <AddToPlaylist 
            song={currentSong}
            trigger={
              <button className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200 ml-2 md:ml-4 md:hidden">
                <Plus className="h-4 w-4" />
              </button>
            }
          />
          
          {/* Temporarily disabled tooltip to fix HMR issue */}
          <button 
            onClick={handlePlayModeChange} 
            className={cn(
              "text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200 ml-2 md:ml-4 hidden md:block",
              (playMode !== 'sequence') && "text-music-accent"
            )}
            aria-label={`Change playback mode: ${getPlayModeLabel()}`}
            title={`Playback mode: ${getPlayModeLabel()}`}
          >
            {playMode === 'shuffle' ? (
              <Shuffle className="h-4 w-4 md:h-5 md:w-5" />
            ) : playMode === 'repeat' ? (
              <Repeat className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <ListMusic className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
        </div>
        
        {/* Progress bar and volume - adjusts for screen size */}
        <div className="hidden md:flex items-center justify-end flex-1 md:w-1/3">
          {isMounted && (
            <>
              <span className="text-xs text-gray-400 mr-2 w-10">
                {formatTime(localCurrentTime)}
              </span>
              
               <div className="w-full max-w-xs mx-2">
                 <Progress
                   value={(localCurrentTime / (duration || 1)) * 100}
                   onSeek={handleProgressSeek}
                   className="h-2 cursor-pointer"
                 />
               </div>
              
              <span className="text-xs text-gray-400 ml-2 w-10">
                {formatTime(duration)}
              </span>
            </>
          )}
          
           <div className="ml-4 relative">
             <AddToPlaylist 
               song={currentSong}
               trigger={
                 <button className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200 mr-3">
                   <Plus className="h-4 w-4" />
                 </button>
               }
             />

             <button
               onClick={() => setShowVolumeControl(!showVolumeControl)}
               className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200"
               aria-label="Volume control"
             >
               <VolumeIcon />
             </button>
             
             {showVolumeControl && isMounted && (
               <div 
                 className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded p-2 w-24 z-50"
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
           <Progress
             value={(localCurrentTime / (duration || 1)) * 100}
             onSeek={handleProgressSeek}
             className="h-1 cursor-pointer"
           />
         </div>
       )}
    </div>
  );
};

export default Player;
