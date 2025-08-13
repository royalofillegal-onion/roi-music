import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Heart, Share2, ChevronUp, ChevronDown, Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat, Music2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { songs } from '@/data/songs';
import { songs } from '@/data/additionalSongs';
import { songs } from '@/data/allSongs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import ShareSong from '@/components/ShareSong';

const FloatingMusicInfo = () => {
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    playSong, 
    togglePlayPause, 
    nextSong,
    previousSong,
    volume,
    setVolume,
    addToQueue,
    playMode,
    setPlaybackMode
  } = usePlayer();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [continuousPlayback, setContinuousPlayback] = useState(true);
  const [autoPlayArtist, setAutoPlayArtist] = useState(true);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const isMobile = useIsMobile();

  // Auto-play next song when current ends
  useEffect(() => {
    if (currentSong && continuousPlayback && currentTime > 0 && duration > 0 && Math.abs(currentTime - duration) < 0.5) {
      handleAutoNext();
    }
  }, [currentTime, duration, continuousPlayback, currentSong]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  // Get only current artist songs for better UX
  const currentArtistSongs = songs.filter(song => song.artist === currentSong.artist);

  const handleAutoNext = () => {
    if (autoPlayArtist && currentArtistSongs.length > 1) {
      const currentIndex = currentArtistSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % currentArtistSongs.length;
      const nextSong = currentArtistSongs[nextIndex];
      
      playSong(nextSong);
      toast.success(`Auto-playing: ${nextSong.title}`);
    } else {
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      const nextSong = songs[nextIndex];
      
      playSong(nextSong);
      toast.success(`Auto-playing: ${nextSong.title}`);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentSong.title} - ${currentSong.artist}`,
          text: `Listen to this amazing track on ROI MUSIC!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`Now listening to: ${currentSong.title} by ${currentSong.artist} on ROI MUSIC`);
      toast.success('Track info copied to clipboard!');
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleSongSelect = (song: any) => {
    playSong(song);
    toast.success(`Now playing: ${song.title}`);
  };

  const addArtistSongsToQueue = () => {
    const songsToAdd = currentArtistSongs.filter(song => song.id !== currentSong.id);
    songsToAdd.forEach(song => addToQueue(song));
    toast.success(`Added ${songsToAdd.length} songs by ${currentSong.artist} to queue`);
  };

  // Improved mobile responsive positioning with better height calculation
  const getMobilePosition = () => {
    if (isMobile) {
      return 'bottom-32'; // Higher position above the controller (128px from bottom)
    }
    return 'top-4';
  };

  const getMobileWidth = () => {
    if (isMobile) {
      return 'left-2 right-2'; // Full width on mobile with margin
    }
    return 'right-4 w-80';
  };

  // Enhanced minimized view with better positioning for mobile
  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed ${isMobile ? 'bottom-36 right-4' : 'bottom-20 right-4'} z-30`}
      >
        <div 
          className="w-12 h-12 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl cursor-pointer overflow-hidden"
          onClick={() => setIsMinimized(false)}
        >
          <div className="relative w-full h-full">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-white"
                >
                  <Music2 className="h-3 w-3" />
                </motion.div>
              ) : (
                <Play className="h-3 w-3 text-white" />
              )}
            </div>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="24" cy="24" r="22"
                stroke="rgba(34, 197, 94, 0.3)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="24" cy="24" r="22"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: isMobile ? 0 : 100, y: isMobile ? 100 : 0, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: isMobile ? 0 : 100, y: isMobile ? 100 : 0, opacity: 0 }}
        className={`fixed ${getMobilePosition()} ${getMobileWidth()} z-30`}
        style={{
          maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto', // Better height management on mobile
        }}
      >
        <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          {/* Header with controls */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                ROI MUSIC
              </Badge>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Current Song Info */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate text-sm">
                  {currentSong.title}
                </h4>
                <p className="text-gray-400 truncate text-xs">
                  {currentSong.artist}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={previousSong}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlayPause}
                  className="text-white hover:text-green-400 p-1"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={nextSong}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 space-y-1">
              <Progress value={progress} className="h-1" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Expanded View with improved mobile handling */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-700"
              >
                <div className="p-3 space-y-4" style={{ maxHeight: isMobile ? '60vh' : 'auto', overflowY: isMobile ? 'auto' : 'visible' }}>
                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleLike}
                        className={`text-gray-400 hover:text-white ${isLiked ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      <ShareSong song={currentSong} />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={addArtistSongsToQueue}
                        className="text-gray-400 hover:text-white"
                      >
                        <Radio className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Playback mode buttons */}
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPlaybackMode(playMode === 'shuffle' ? 'sequence' : 'shuffle')}
                        className={`text-gray-400 hover:text-white ${playMode === 'shuffle' ? 'text-green-400' : ''}`}
                      >
                        <Shuffle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPlaybackMode(playMode === 'repeat' ? 'sequence' : 'repeat')}
                        className={`text-gray-400 hover:text-white ${playMode === 'repeat' ? 'text-green-400' : ''}`}
                      >
                        <Repeat className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Volume Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Volume</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowVolumeControl(!showVolumeControl)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {showVolumeControl && (
                      <Slider
                        value={[volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => setVolume(value[0])}
                        className="w-full"
                      />
                    )}
                  </div>

                  <Separator />

                  {/* Enhanced Artist Songs List with better mobile scrolling */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-green-400">
                        {currentSong.artist} Songs ({currentArtistSongs.length})
                      </h5>
                    </div>
                    
                    <ScrollArea 
                      className={isMobile ? 'h-40' : 'h-56'} 
                      style={{ 
                        touchAction: 'pan-y',
                        WebkitOverflowScrolling: 'touch' // Better iOS scrolling
                      }}
                    >
                      <div className="space-y-2 pr-4">
                        {currentArtistSongs.map((song, index) => (
                          <div
                            key={song.id}
                            onClick={() => handleSongSelect(song)}
                            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-700/50 group ${
                              currentSong.id === song.id ? 'bg-green-600/20 border border-green-600/30' : ''
                            }`}
                          >
                            <div className="text-xs text-gray-500 w-6 text-center">
                              {index + 1}
                            </div>
                            <img
                              src={song.imageUrl}
                              alt={song.title}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-medium truncate">
                                {song.title}
                              </p>
                              <p className="text-gray-400 text-xs truncate">
                                {song.artist}
                              </p>
                            </div>
                            {currentSong.id === song.id ? (
                              <div className="flex items-center space-x-1">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="text-green-400"
                                >
                                  <Music2 className="h-3 w-3" />
                                </motion.div>
                                <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                                  Playing
                                </Badge>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingMusicInfo;
