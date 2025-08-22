import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Heart, Share2, ChevronUp, ChevronDown, Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat, Music2, Radio, Filter, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { allSongs } from '@/data/allSongs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import ShareSong from '@/components/ShareSong';
import { enhanceAllSongs } from '@/utils/songEnhancer';

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
    seek,
    volume,
    setVolume,
    addToQueue,
    playMode,
    setPlaybackMode,
    playOnceMode,
    setPlayOnceMode,
    resetPlayHistory,
    playedSongsHistory
  } = usePlayer();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [continuousPlayback, setContinuousPlayback] = useState(true);
  const [autoPlayArtist, setAutoPlayArtist] = useState(true);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [completedSyncs, setCompletedSyncs] = useState<Set<string>>(new Set());
  const [artistFilterEnabled, setArtistFilterEnabled] = useState(false);
  
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(true);

  // Auto-play next song when current ends
  useEffect(() => {
    if (currentSong && continuousPlayback && currentTime > 0 && duration > 0 && Math.abs(currentTime - duration) < 1) {
      setTimeout(() => handleAutoNext(), 500);
    }
  }, [currentTime, duration, continuousPlayback, currentSong]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const enhancedSongs = enhanceAllSongs(allSongs);
  
  const currentSyncSongs = enhancedSongs.filter(song => song.sync === currentSong.sync);
  const currentArtistSongs = enhancedSongs.filter(song => song.artist === currentSong.artist);

  const handleAutoNext = () => {
    if (artistFilterEnabled && currentArtistSongs.length > 1) {
      const currentIndex = currentArtistSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % currentArtistSongs.length;
      const nextSong = currentArtistSongs[nextIndex];
      playSong(nextSong);
      return;
    }

    if (autoPlayArtist && currentArtistSongs.length > 1 && !artistFilterEnabled) {
      const currentIndex = currentArtistSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % currentArtistSongs.length;
      const nextSong = currentArtistSongs[nextIndex];
      playSong(nextSong);
    } else if (currentSong.sync && currentSyncSongs.length > 1 && !artistFilterEnabled) {
      const currentIndex = currentSyncSongs.findIndex(song => song.id === currentSong.id);
      const isLastInSync = currentIndex === currentSyncSongs.length - 1;
      
      if (isLastInSync && !completedSyncs.has(currentSong.sync)) {
        setCompletedSyncs(prev => new Set([...prev, currentSong.sync!]));
        
        const availableSyncs = ['sad', 'love', 'happy', 'devotional', 'dance', 'action', 'romantic', 'party', 'classical', 'folk'];
        const nextSync = availableSyncs.find(sync => !completedSyncs.has(sync) && sync !== currentSong.sync);
        
        if (nextSync) {
          const nextSyncSongs = enhancedSongs.filter(song => song.sync === nextSync);
          if (nextSyncSongs.length > 0) {
            playSong(nextSyncSongs[0]);
            return;
          }
        }
      }
      
      const nextIndex = (currentIndex + 1) % currentSyncSongs.length;
      const nextSong = currentSyncSongs[nextIndex];
      playSong(nextSong);
    } else if (!artistFilterEnabled) {
      const currentIndex = enhancedSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % enhancedSongs.length;
      const nextSong = enhancedSongs[nextIndex];
      playSong(nextSong);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      duration: 1500,
    });
  };

  const handleSongSelect = (song: any) => {
    playSong(song);
  };

  const addArtistSongsToQueue = () => {
    const songsToAdd = currentArtistSongs.filter(song => song.id !== currentSong.id);
    songsToAdd.forEach(song => addToQueue(song));
    toast(`Added ${songsToAdd.length} songs to queue`, {
      duration: 2000,
    });
  };

  // Minimized view - sleek circular controller
  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed ${isMobile ? 'bottom-36 right-4' : 'bottom-20 right-4'} z-30`}
      >
        <div 
          className="relative w-16 h-16 bg-black/90 backdrop-blur-lg border-2 border-red-500/20 rounded-full cursor-pointer overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-red-500/20"
          onClick={() => setIsMinimized(false)}
        >
          {/* Album art with overlay */}
          <div className="absolute inset-2 rounded-full overflow-hidden">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-red-500"
                >
                  <Music2 className="h-5 w-5" />
                </motion.div>
              ) : (
                <Play className="h-5 w-5 text-red-500 fill-red-500" />
              )}
            </div>
          </div>
          
          {/* Outer progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="32" cy="32" r="30"
              stroke="rgba(239, 68, 68, 0.2)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="32" cy="32" r="30"
              stroke="#ef4444"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
              className="transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))'
              }}
            />
          </svg>
          
          {/* Pulsing glow effect */}
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-red-500/10 rounded-full"
            />
          )}
        </div>
      </motion.div>
    );
  }

  // Expanded player view with all features
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: isMobile ? 0 : 100, y: isMobile ? 100 : 0, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: isMobile ? 0 : 100, y: isMobile ? 100 : 0, opacity: 0 }}
        className={`fixed ${isMobile ? 'bottom-32 left-2 right-2' : 'bottom-20 right-4 w-80'} z-30`}
        style={{
          maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto',
        }}
      >
        <div className="bg-card backdrop-blur-lg border border-border rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4">
            {/* Header with ROI MUSIC badge and controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-2 py-1 rounded-full text-xs font-bold tracking-wider">
                  ROI MUSIC
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {currentSong.artist}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Current Song Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                {isPlaying && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate text-sm">
                  {currentSong.title}
                </h4>
                <p className="text-muted-foreground truncate text-xs">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={previousSong}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={nextSong}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Seekable Progress Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => {
                    const newTime = (value[0] / 100) * duration;
                    seek(newTime);
                  }}
                  max={100}
                  step={0.1}
                  className="w-full [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-2 [&_[role=slider]]:border-background [&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform [&_[role=slider]:hover]:scale-110 [&_.slider-track]:h-1 [&_.slider-range]:bg-primary"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Expanded Features */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-4" style={{ maxHeight: isMobile ? '60vh' : 'auto', overflowY: isMobile ? 'auto' : 'visible' }}>
                  
                  {/* Action Buttons Row 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleLike}
                        className={`text-muted-foreground hover:text-foreground ${isLiked ? 'text-primary' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      <ShareSong song={currentSong} />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={addArtistSongsToQueue}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Radio className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setArtistFilterEnabled(!artistFilterEnabled)}
                        className={`text-muted-foreground hover:text-foreground ${artistFilterEnabled ? 'text-primary' : ''}`}
                        title={artistFilterEnabled ? 'Disable artist filter' : 'Enable artist filter'}
                      >
                        {artistFilterEnabled ? <Filter className="h-4 w-4" /> : <FilterX className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Playback Mode Controls */}
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPlayOnceMode(!playOnceMode)}
                      className={`text-muted-foreground hover:text-foreground ${playOnceMode ? 'text-primary' : ''}`}
                      title={playOnceMode ? 'Play Once Mode: ON' : 'Play Once Mode: OFF'}
                    >
                      <span className="text-xs font-bold">1x</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPlaybackMode(playMode === 'shuffle' ? 'sequence' : 'shuffle')}
                      className={`text-muted-foreground hover:text-foreground ${playMode === 'shuffle' ? 'text-primary' : ''}`}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPlaybackMode(playMode === 'repeat' ? 'sequence' : 'repeat')}
                      className={`text-muted-foreground hover:text-foreground ${playMode === 'repeat' ? 'text-primary' : ''}`}
                    >
                      <Repeat className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetPlayHistory}
                      className="text-muted-foreground hover:text-foreground"
                      title="Reset play history"
                    >
                      <span className="text-xs">↻</span>
                    </Button>
                  </div>

                  <Separator />

                  {/* Volume Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Volume</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowVolumeControl(!showVolumeControl)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {showVolumeControl && (
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          value={[volume]}
                          onValueChange={(value) => setVolume(value[0])}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-8">{volume}%</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Artist Songs List */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-foreground">More by {currentSong.artist}</h5>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {currentArtistSongs.slice(0, 10).map((song) => (
                          <div
                            key={song.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                              song.id === currentSong.id 
                                ? 'bg-primary/20 text-primary' 
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                            onClick={() => handleSongSelect(song)}
                          >
                            <img
                              src={song.imageUrl}
                              alt={song.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{song.title}</p>
                              <p className="text-xs truncate opacity-60">{song.artist}</p>
                            </div>
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