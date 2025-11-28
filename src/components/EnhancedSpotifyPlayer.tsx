import React, { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle, Heart, ListMusic, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddToPlaylist from "@/components/AddToPlaylist";

const EnhancedSpotifyPlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    playMode,
    queue,
    togglePlayPause,
    previousSong,
    nextSong,
    setVolume,
    seekTo,
    setPlaybackMode,
    isLiked,
    toggleLike,
  } = usePlayer();
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    if (!isDragging) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  const handleSeek = (value: number[]) => {
    setLocalTime(value[0]);
    setIsDragging(true);
  };

  const handleSeekCommit = (value: number[]) => {
    seekTo(value[0]);
    setIsDragging(false);
  };

  const handlePlayModeToggle = () => {
    if (playMode === 'sequence') {
      setPlaybackMode('shuffle');
    } else if (playMode === 'shuffle') {
      setPlaybackMode('repeat');
    } else {
      setPlaybackMode('sequence');
    }
  };
  
  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-24 md:h-20 bg-gradient-to-t from-black via-black/98 to-black/95 border-t border-primary/30 backdrop-blur-xl flex items-center justify-center z-50 shadow-[0_-4px_30px_rgba(30,215,96,0.1)]">
        <div className="flex flex-col items-center gap-2 sm:gap-3 animate-fade-in px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <p className="text-white text-base sm:text-lg md:text-base font-semibold text-center">Select a song to start</p>
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground text-center">Browse and tap any song to play</p>
        </div>
      </div>
    );
  }
  
  const liked = isLiked(currentSong.id);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-24 md:h-20 bg-gradient-to-t from-black via-black/98 to-black/95 border-t border-primary/30 backdrop-blur-xl z-50 shadow-[0_-4px_30px_rgba(30,215,96,0.15)]">
      <div className="h-full flex flex-col md:flex-row items-center justify-between px-4 sm:px-5 md:px-6 gap-2 md:gap-4 py-2 md:py-0">
        {/* Mobile Progress Bar at Top */}
        <div className="flex md:hidden items-center gap-2 w-full order-1">
          <span className="text-xs text-muted-foreground font-mono w-10 text-right">
            {formatTime(localTime)}
          </span>
          <Slider
            value={[localTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            onValueCommit={handleSeekCommit}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Left: Song Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full md:w-[30%] order-2 md:order-1">
          <div className="relative group flex-shrink-0">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-14 md:h-14 rounded-lg shadow-spotify ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all"
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="w-1 h-3 sm:h-4 bg-primary animate-pulse mx-0.5" />
                <div className="w-1 h-4 sm:h-5 bg-primary animate-pulse mx-0.5" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-3 sm:h-4 bg-primary animate-pulse mx-0.5" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white text-sm sm:text-base truncate hover:text-primary transition-colors cursor-pointer">{currentSong.title}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate hover:text-accent transition-colors cursor-pointer">{currentSong.artist}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 transition-all touch-target",
              liked ? "text-primary scale-110" : "text-muted-foreground hover:text-primary hover:scale-110"
            )}
            onClick={() => toggleLike(currentSong.id)}
          >
            <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6", liked && "fill-current")} />
          </Button>
          <AddToPlaylist
            song={currentSong}
            trigger={
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-primary hover:scale-110 transition-all flex-shrink-0 touch-target">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            }
          />
        </div>
        
        {/* Center: Player Controls */}
        <div className="flex items-center w-auto md:w-[40%] max-w-2xl order-3 md:order-2 gap-1 sm:gap-2 md:gap-3">
          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayModeToggle}
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-muted-foreground hover:text-white transition-all hover:scale-110 hidden sm:flex touch-target",
                playMode === 'shuffle' && "text-primary scale-110"
              )}
            >
              <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={previousSong}
              className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 text-white hover:text-primary hover:scale-110 transition-all touch-target"
            >
              <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-12 md:w-12 bg-primary hover:bg-primary/90 text-black rounded-full shadow-spotify hover:scale-110 transition-all touch-target"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 sm:h-7 sm:w-7 md:h-6 md:w-6" />
              ) : (
                <Play className="h-6 w-6 sm:h-7 sm:w-7 md:h-6 md:w-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSong}
              className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 text-white hover:text-primary hover:scale-110 transition-all touch-target"
            >
              <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayModeToggle}
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-muted-foreground hover:text-white transition-all hover:scale-110 hidden sm:flex touch-target",
                playMode === 'repeat' && "text-primary scale-110"
              )}
            >
              <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
        
        {/* Right: Volume & Queue */}
        <div className="hidden md:flex items-center gap-2 justify-end w-[30%] order-4 md:order-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 text-muted-foreground hover:text-primary hover:scale-110 transition-all touch-target">
                <ListMusic className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 bg-black border-l border-primary/20">
              <SheetHeader>
                <SheetTitle className="text-lg font-bold">Queue</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                <div className="space-y-3">
                  <div className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Now Playing</div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <img src={currentSong.imageUrl} alt="" className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate text-white">{currentSong.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{currentSong.artist}</div>
                    </div>
                  </div>
                  
                  {queue.length > 0 && (
                    <>
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-6 mb-3">Next in Queue ({queue.length})</div>
                      {queue.map((song, index) => (
                        <div key={`${song.id}-${index}`} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all">
                          <img src={song.imageUrl} alt="" className="w-12 h-12 rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-white">{song.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <div className="relative hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-accent hover:scale-110 transition-all"
            >
              <VolumeIcon />
            </Button>
            
            {showVolumeSlider && (
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/95 backdrop-blur-xl rounded-lg p-2 w-8 border border-primary/30 shadow-crimson"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(v) => setVolume(v[0])}
                  orientation="vertical"
                  className="h-24"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSpotifyPlayer;
