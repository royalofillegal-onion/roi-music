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
      <div className="fixed bottom-0 left-0 right-0 md:left-64 h-20 bg-black border-t border-white/10 flex items-center justify-center z-50">
        <p className="text-gray-400 text-sm">Select a song to play</p>
      </div>
    );
  }
  
  const liked = isLiked(currentSong.id);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-64 h-20 bg-black border-t border-white/10 z-50">
      <div className="h-full flex items-center justify-between px-4 gap-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-3 min-w-0 w-[30%]">
          <img
            src={currentSong.imageUrl}
            alt={currentSong.title}
            className="w-14 h-14 rounded"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-white text-sm truncate">{currentSong.title}</div>
            <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 flex-shrink-0",
              liked ? "text-primary" : "text-gray-400 hover:text-white"
            )}
            onClick={() => toggleLike(currentSong.id)}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </Button>
          <AddToPlaylist
            song={currentSong}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white flex-shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
        
        {/* Center: Player Controls */}
        <div className="flex flex-col items-center w-[40%] max-w-2xl">
          {/* Controls */}
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayModeToggle}
              className={cn(
                "h-8 w-8 text-gray-400 hover:text-white",
                playMode === 'shuffle' && "text-primary"
              )}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={previousSong}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="h-9 w-9 bg-white hover:bg-white/90 text-black rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSong}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayModeToggle}
              className={cn(
                "h-8 w-8 text-gray-400 hover:text-white",
                playMode === 'repeat' && "text-primary"
              )}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-400 w-10 text-right">
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
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {/* Right: Volume & Queue */}
        <div className="flex items-center gap-2 justify-end w-[30%]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <ListMusic className="h-4 w-4" />
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
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              <VolumeIcon />
            </Button>
            
            {showVolumeSlider && (
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-lg p-2 w-8 border border-border"
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
