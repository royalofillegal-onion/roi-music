import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, ListMusic, Maximize2, Minimize2, Plus, User, ChevronDown, Heart, Share2, Info, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/PlayerContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import AddToPlaylist from "@/components/AddToPlaylist";
import { songsByArtist } from "@/data/allSongs";
import { Song } from "@/data/songs";
import { getSongCredits, SongCredits } from "@/data/songCredits";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SleepTimerButton } from "@/components/SleepTimerButton";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AudioSettingsButton } from "@/components/AudioSettingsButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Player = () => {
  const navigate = useNavigate();
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
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'credits'>('queue');
  const [desktopQueueSearch, setDesktopQueueSearch] = useState('');
  const prevTimeRef = useRef(currentTime);
  
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
    
    // Enable/disable scrolling based on fullscreen state
    if (isFullscreen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isFullscreen]);
  
  // Update local time when currentTime changes from context
  useEffect(() => {
    setLocalCurrentTime(currentTime);
    prevTimeRef.current = currentTime;
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

  // Get remaining songs from queue for display
  const getQueueSongs = (): Song[] => {
    return queue || [];
  };

  // Play selected queue song
  const playQueueSong = (song: Song, index: number) => {
    // Would need to update PlayerContext to support this
    console.log('Play queue song:', song.title, 'at index:', index);
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
  
  // Handle swipe gestures to close fullscreen (down for vertical, left-to-right for horizontal)
  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);
  const touchEndY = React.useRef<number>(0);
  
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };
  
  const onTouchEnd = () => {
    const swipeDistanceX = touchEndX.current - touchStartX.current;
    const swipeDistanceY = touchEndY.current - touchStartY.current;
    
    // Check for horizontal swipe (left to right) - more than 80px and mostly horizontal
    if (swipeDistanceX > 80 && Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
      setIsFullscreen(false);
    }
    // Check for vertical swipe (down) - more than 100px and mostly vertical
    else if (swipeDistanceY > 100 && Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) {
      setIsFullscreen(false);
    }
    
    // Reset values
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
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
  
  // Get song credits
  const songCredits = currentSong ? getSongCredits(currentSong.id) : undefined;

  // Render fullscreen player with queue view and credits
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-background/98 backdrop-blur-xl flex flex-col lg:flex-row"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Left side - Current song and controls */}
        <div className="flex-1 flex flex-col lg:flex-[2] lg:border-r lg:border-border/50">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hover:bg-accent/10"
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
            <h3 className="text-sm font-medium">Now Playing</h3>
            <Button variant="ghost" size="icon" className="hover:bg-accent/10">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Current Song Section - Centered large album art on desktop */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
            {/* Large centered album art */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl mb-6 lg:mb-8">
              <img
                src={currentSong.imageUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Song info centered */}
            <div className="w-full max-w-md text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate animate-in fade-in-50">
                  {currentSong.title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLiked(!liked)}
                  className={`flex-shrink-0 ${liked ? 'text-red-500 hover:text-red-600' : 'hover:text-foreground'}`}
                >
                  <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
                </Button>
              </div>
              <p className="text-sm lg:text-base text-muted-foreground truncate animate-in fade-in-50" style={{ animationDelay: '50ms' }}>
                {songCredits?.movie || currentSong.artist}
              </p>
              {songCredits?.singer && (
                <button 
                  onClick={() => navigate(`/artist/${encodeURIComponent(songCredits.singer)}`)}
                  className="text-sm text-primary hover:underline truncate block mt-1 mx-auto"
                >
                  🎤 {songCredits.singer}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {isMounted && (
              <div className="w-full max-w-md mt-6 lg:mt-8 space-y-2">
                <Progress
                  value={(localCurrentTime / (duration || 1)) * 100}
                  onSeek={handleProgressSeek}
                  className="h-2 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(localCurrentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-6 lg:mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousSong}
                className="hover:bg-accent/10"
              >
                <SkipBack className="w-6 h-6" />
              </Button>
              
              <Button
                size="icon"
                onClick={togglePlayPause}
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-primary hover:bg-primary/90 hover-lift"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 lg:w-8 lg:h-8" />
                ) : (
                  <Play className="w-7 h-7 lg:w-8 lg:h-8 ml-1" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSong}
                className="hover:bg-accent/10"
              >
                <SkipForward className="w-6 h-6" />
              </Button>
            </div>

            {/* Desktop Song Credits - Inline below controls */}
            {songCredits && (
              <div className="hidden lg:block w-full max-w-md mt-6 pt-4 border-t border-border/30">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <span className="text-muted-foreground text-xs">Music Director</span>
                    <button 
                      onClick={() => navigate(`/artist/${encodeURIComponent(songCredits.musicDirector)}`)}
                      className="block text-primary hover:underline text-sm mt-1"
                    >
                      {songCredits.musicDirector}
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-muted-foreground text-xs">Lyricist</span>
                    <span className="block text-sm mt-1">{songCredits.lyricist}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Tabs - Queue & Credits */}
          <div className="flex-1 overflow-hidden flex flex-col lg:hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'queue' | 'credits')} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start px-4 pt-2 bg-transparent">
                <TabsTrigger value="queue" className="flex-1">
                  <ListMusic className="w-4 h-4 mr-2" />
                  Queue
                </TabsTrigger>
                <TabsTrigger value="credits" className="flex-1">
                  <Info className="w-4 h-4 mr-2" />
                  Credits
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="queue" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full px-4">
                  <div className="space-y-1 py-2 pb-6">
                    {getQueueSongs().map((song, index) => (
                      <div
                        key={`${song.id}-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors group"
                        onClick={() => playQueueSong(song, index)}
                      >
                        <span className="text-base font-semibold text-primary w-7 flex-shrink-0 text-center">
                          {index + 1}
                        </span>
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{song.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        </div>
                      </div>
                    ))}
                    {getQueueSongs().length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No songs in queue</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="credits" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full px-4">
                  <div className="py-4 space-y-4 pb-6">
                    {songCredits ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary">
                            <Music className="w-4 h-4" />
                            <span className="font-semibold text-sm">Song Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Singer</p>
                              <button 
                                onClick={() => navigate(`/artist/${encodeURIComponent(songCredits.singer)}`)}
                                className="font-medium text-primary hover:underline"
                              >
                                {songCredits.singer}
                              </button>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Music Director</p>
                              <button 
                                onClick={() => navigate(`/artist/${encodeURIComponent(songCredits.musicDirector)}`)}
                                className="font-medium text-primary hover:underline"
                              >
                                {songCredits.musicDirector}
                              </button>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Lyricist</p>
                              <p className="font-medium">{songCredits.lyricist}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Movie</p>
                              <p className="font-medium">{songCredits.movie}</p>
                            </div>
                          </div>
                        </div>

                        {songCredits.technicalCrew && (
                          <div className="space-y-3 pt-3 border-t border-border/50">
                            <p className="font-semibold text-sm text-primary">Technical Crew</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {songCredits.technicalCrew.director && (
                                <div>
                                  <p className="text-muted-foreground text-xs">Director</p>
                                  <p className="font-medium">{songCredits.technicalCrew.director}</p>
                                </div>
                              )}
                              {songCredits.technicalCrew.producer && (
                                <div>
                                  <p className="text-muted-foreground text-xs">Producer</p>
                                  <p className="font-medium">{songCredits.technicalCrew.producer}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {songCredits.cast && songCredits.cast.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-border/50">
                            <p className="font-semibold text-sm text-primary">Cast</p>
                            <p className="text-sm text-muted-foreground">{songCredits.cast.join(', ')}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No credits available for this song</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right side - Queue & Credits (Desktop only) */}
        <div className="hidden lg:flex flex-1 flex-col">
          {/* Queue Section Header with Search */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold">Up Next</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {getQueueSongs().length} songs in queue
                </p>
              </div>
            </div>
            {/* Queue Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search in queue..."
                value={desktopQueueSearch}
                onChange={(e) => setDesktopQueueSearch(e.target.value)}
                className="w-full bg-accent/20 border border-border/30 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-1 py-2">
              {getQueueSongs()
                .filter(song => 
                  !desktopQueueSearch || 
                  song.title.toLowerCase().includes(desktopQueueSearch.toLowerCase()) ||
                  song.artist.toLowerCase().includes(desktopQueueSearch.toLowerCase())
                )
                .map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors group"
                  onClick={() => playQueueSong(song, index)}
                >
                  <span className="text-base font-semibold text-primary w-7 flex-shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{song.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
              
              {getQueueSongs().length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No songs in queue</p>
                  <p className="text-xs mt-1">Add songs to your queue to see them here</p>
                </div>
              )}
            </div>
          </ScrollArea>

        </div>
      </div>
    );
  }
  
  // Regular player UI
  return (
    <div className="fixed bottom-16 left-0 right-0 md:bottom-0 md:left-16 glass-effect border-t border-gray-800 h-16 md:h-20 z-40">
      <div className="flex items-center h-full px-3 md:px-6">
        {/* Song info - click to go to Now Playing page */}
        <div className="flex items-center flex-1 min-w-0 md:w-1/3">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => navigate('/now-playing')}
          >
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-10 h-10 rounded md:w-14 md:h-14 group-hover:opacity-80 transition-opacity"
            />
            <div className="ml-3 truncate">
              <div className="font-medium truncate group-hover:text-primary transition-colors">{currentSong.title}</div>
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
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={handlePlayModeChange} 
                className={cn(
                  "text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-all duration-200 ml-2 md:ml-4 hidden md:block",
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
