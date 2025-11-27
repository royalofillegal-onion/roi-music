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
      <div className="fixed bottom-0 left-0 right-0 h-24 md:h-20 bg-gradient-to-t from-black via-black/95 to-black/90 border-t border-primary/20 backdrop-blur-xl flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-gray-300 text-sm md:text-base font-medium">Select a song to start your journey</p>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
          <p className="text-xs text-gray-500">Browse and tap any song to play</p>
        </div>
      </div>
    );
  }
  
  const liked = isLiked(currentSong.id);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 md:h-20 bg-gradient-to-t from-black via-black/98 to-black/95 border-t border-primary/30 backdrop-blur-xl z-50 shadow-[0_-4px_30px_rgba(var(--primary)/0.15)]">
      <div className="h-full flex items-center justify-between px-3 md:px-4 gap-2 md:gap-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 w-[35%] md:w-[30%]">
          <div className="relative group">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg shadow-crimson ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all"
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-3 bg-primary-glow animate-pulse mx-0.5" />
                <div className="w-1 h-4 bg-primary-glow animate-pulse mx-0.5" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-3 bg-primary-glow animate-pulse mx-0.5" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white text-xs md:text-sm truncate hover:text-primary-glow transition-colors cursor-pointer">{currentSong.title}</div>
            <div className="text-xs text-gray-400 truncate hover:text-accent transition-colors cursor-pointer">{currentSong.artist}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 md:h-8 md:w-8 flex-shrink-0 hidden sm:flex transition-all",
              liked ? "text-primary scale-110" : "text-gray-400 hover:text-primary hover:scale-110"
            )}
            onClick={() => toggleLike(currentSong.id)}
          >
            <Heart className={cn("h-3.5 w-3.5 md:h-4 md:w-4", liked && "fill-current animate-pulse-fire")} />
          </Button>
          <AddToPlaylist
            song={currentSong}
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-accent hover:scale-110 transition-all flex-shrink-0 hidden sm:flex">
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            }
          />
        </div>
        
        {/* Center: Player Controls */}
        <div className="flex flex-col items-center w-[30%] md:w-[40%] max-w-2xl">
          {/* Controls */}
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayModeToggle}
              className={cn(
                "h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-white transition-all hover:scale-110 hidden md:flex",
                playMode === 'shuffle' && "text-primary scale-110"
              )}
            >
              <Shuffle className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={previousSong}
              className="h-8 w-8 md:h-9 md:w-9 text-gray-300 hover:text-white hover:scale-110 transition-all"
            >
              <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-10 w-10 md:h-11 md:w-11 bg-gradient-to-br from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white rounded-full shadow-bloody hover:shadow-fire hover:scale-110 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSong}
              className="h-8 w-8 md:h-9 md:w-9 text-gray-300 hover:text-white hover:scale-110 transition-all"
            >
              <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayModeToggle}
              className={cn(
                "h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-white transition-all hover:scale-110 hidden md:flex",
                playMode === 'repeat' && "text-primary scale-110"
              )}
            >
              <Repeat className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="hidden md:flex items-center gap-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right font-mono">
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
            <span className="text-xs text-gray-400 w-10 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {/* Right: Volume & Queue */}
        <div className="flex items-center gap-1 md:gap-2 justify-end w-[35%] md:w-[30%]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-primary hover:scale-110 transition-all">
                <ListMusic className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background">
              <SheetHeader>
                <SheetTitle>Queue</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Now Playing</div>
                  <div className="flex items-center gap-3 p-2 bg-accent/10 rounded">
                    <img src={currentSong.imageUrl} alt="" className="w-10 h-10 rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{currentSong.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{currentSong.artist}</div>
                    </div>
                  </div>
                  
                  {queue.length > 0 && (
                    <>
                      <div className="text-sm font-semibold text-muted-foreground mt-4 mb-2">Next in Queue</div>
                      {queue.map((song, index) => (
                        <div key={`${song.id}-${index}`} className="flex items-center gap-3 p-2 hover:bg-accent/5 rounded">
                          <img src={song.imageUrl} alt="" className="w-10 h-10 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{song.title}</div>
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
