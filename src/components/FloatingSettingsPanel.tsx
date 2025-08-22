import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Music2, 
  Radio, 
  Filter, 
  FilterX,
  X,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { allSongs } from '@/data/allSongs';
import { useIsMobile } from '@/hooks/use-mobile';
import { enhanceAllSongs } from '@/utils/songEnhancer';
import ShareSong from '@/components/ShareSong';

interface FloatingSettingsPanelProps {
  isVisible: boolean;
  onToggle: (visible: boolean) => void;
}

const FloatingSettingsPanel: React.FC<FloatingSettingsPanelProps> = ({
  isVisible,
  onToggle
}) => {
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
    setPlaybackMode,
    playOnceMode,
    setPlayOnceMode,
    resetPlayHistory,
    playedSongsHistory
  } = usePlayer();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [continuousPlayback, setContinuousPlayback] = useState(true);
  const [autoPlayArtist, setAutoPlayArtist] = useState(true);
  const [artistFilterEnabled, setArtistFilterEnabled] = useState(false);
  const [completedSyncs, setCompletedSyncs] = useState<Set<string>>(new Set());
  
  const isMobile = useIsMobile();

  // Auto-play logic
  useEffect(() => {
    if (currentSong && continuousPlayback && currentTime > 0 && duration > 0 && Math.abs(currentTime - duration) < 1) {
      setTimeout(() => handleAutoNext(), 500);
    }
  }, [currentTime, duration, continuousPlayback, currentSong]);

  if (!isVisible || !currentSong) return null;

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

  const addArtistSongsToQueue = () => {
    const songsToAdd = currentArtistSongs.filter(song => song.id !== currentSong.id);
    songsToAdd.forEach(song => addToQueue(song));
    toast(`Added ${songsToAdd.length} songs to queue`, {
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ x: isMobile ? 0 : 400, y: isMobile ? 400 : 0, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ x: isMobile ? 0 : 400, y: isMobile ? 400 : 0, opacity: 0 }}
      className={`fixed ${isMobile ? 'inset-4' : 'top-4 right-4 w-96'} z-50 max-h-[90vh]`}
    >
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                ROI MUSIC SETTINGS
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggle(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Full-Screen Song Display */}
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-48 h-48 md:w-64 md:h-64">
              <img
                src={currentSong.imageUrl}
                alt={currentSong.title}
                className="w-full h-full rounded-2xl object-cover shadow-2xl"
              />
              {isPlaying && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-t from-green-500/20 to-transparent"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {currentSong.title}
              </h2>
              <p className="text-gray-400 text-lg">
                {currentSong.artist}
              </p>
              <div className="flex justify-center space-x-2">
                {currentSong.sync && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                    {currentSong.sync}
                  </Badge>
                )}
                {currentSong.language && (
                  <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                    {currentSong.language}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <Progress value={progress} className="h-3 bg-gray-700" />
            <div className="flex justify-between text-sm text-gray-400">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Full Settings Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <ScrollArea className="max-h-[50vh]">
                <div className="p-4 space-y-6">
                  {/* Enhanced Playback Controls */}
                  <div className="space-y-4">
                    {/* Main Control Row */}
                    <div className="flex justify-center items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setPlaybackMode(playMode === 'shuffle' ? 'sequence' : 'shuffle')}
                        className={`${playMode === 'shuffle' ? 'text-green-400 bg-green-500/20' : 'text-gray-400'} hover:text-white transition-all duration-300`}
                      >
                        <Shuffle className="h-6 w-6" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={previousSong}
                        className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                      >
                        <SkipBack className="h-7 w-7" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={togglePlayPause}
                        className="text-white hover:text-green-400 bg-white/10 hover:bg-green-600/30 transition-all duration-300 hover:scale-110 w-16 h-16 rounded-full"
                      >
                        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={nextSong}
                        className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                      >
                        <SkipForward className="h-7 w-7" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setPlaybackMode(playMode === 'repeat' ? 'sequence' : 'repeat')}
                        className={`${playMode === 'repeat' ? 'text-green-400 bg-green-500/20' : 'text-gray-400'} hover:text-white transition-all duration-300`}
                      >
                        <Repeat className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex justify-center items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPlayOnceMode(!playOnceMode)}
                        className={`${playOnceMode ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400'} hover:text-white transition-all duration-300`}
                      >
                        <span className="text-sm font-bold">1×</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLike}
                        className={`${isLiked ? 'text-red-500 bg-red-500/20' : 'text-gray-400'} hover:text-white transition-all duration-300`}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <ShareSong song={currentSong} />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addArtistSongsToQueue}
                        className="text-gray-400 hover:text-white transition-all duration-300"
                      >
                        <Radio className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setArtistFilterEnabled(!artistFilterEnabled)}
                        className={`${artistFilterEnabled ? 'text-green-400 bg-green-500/20' : 'text-gray-400'} hover:text-white transition-all duration-300`}
                      >
                        {artistFilterEnabled ? <Filter className="h-5 w-5" /> : <FilterX className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="ghost"
                        onClick={toggleLike}
                        className={`justify-start ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-gray-400'} hover:text-white`}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                      </Button>
                      <div className="flex">
                        <ShareSong song={currentSong} />
                      </div>
                      <Button
                        variant="ghost"
                        onClick={addArtistSongsToQueue}
                        className="justify-start text-gray-400 hover:text-white"
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Add Artist
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setArtistFilterEnabled(!artistFilterEnabled)}
                        className={`justify-start ${artistFilterEnabled ? 'text-green-400 bg-green-500/10' : 'text-gray-400'} hover:text-white`}
                      >
                        {artistFilterEnabled ? <Filter className="h-4 w-4 mr-2" /> : <FilterX className="h-4 w-4 mr-2" />}
                        Artist Filter
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Playback Modes */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Playback Modes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setPlayOnceMode(!playOnceMode)}
                        className={`justify-start ${playOnceMode ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400'} hover:text-white`}
                      >
                        <span className="text-sm font-bold mr-2">1x</span>
                        Play Once
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setPlaybackMode(playMode === 'shuffle' ? 'sequence' : 'shuffle')}
                        className={`justify-start ${playMode === 'shuffle' ? 'text-green-400 bg-green-500/10' : 'text-gray-400'} hover:text-white`}
                      >
                        <Shuffle className="h-4 w-4 mr-2" />
                        Shuffle
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setPlaybackMode(playMode === 'repeat' ? 'sequence' : 'repeat')}
                        className={`justify-start ${playMode === 'repeat' ? 'text-green-400 bg-green-500/10' : 'text-gray-400'} hover:text-white`}
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Repeat
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={resetPlayHistory}
                        className="justify-start text-gray-400 hover:text-white"
                      >
                        <span className="text-sm mr-2">↻</span>
                        Reset History
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Advanced Controls */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Advanced Controls</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="ghost"
                        onClick={resetPlayHistory}
                        className="justify-center text-gray-400 hover:text-white flex-col space-y-1 h-auto py-3"
                      >
                        <span className="text-lg">↻</span>
                        <span className="text-xs">Reset</span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const allSongsArray = enhanceAllSongs(allSongs);
                          const randomSong = allSongsArray[Math.floor(Math.random() * allSongsArray.length)];
                          playSong(randomSong);
                        }}
                        className="justify-center text-gray-400 hover:text-white flex-col space-y-1 h-auto py-3"
                      >
                        <Shuffle className="h-4 w-4" />
                        <span className="text-xs">Random</span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          // Add current song to queue multiple times for extended play
                          for(let i = 0; i < 5; i++) {
                            addToQueue(currentSong);
                          }
                          toast('Added to queue 5 times');
                        }}
                        className="justify-center text-gray-400 hover:text-white flex-col space-y-1 h-auto py-3"
                      >
                        <Repeat className="h-4 w-4" />
                        <span className="text-xs">Loop 5x</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Enhanced Volume Control */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Volume
                      </div>
                      <span className="text-green-400 font-mono text-lg">
                        {Math.round(volume * 100)}%
                      </span>
                    </h4>
                    <div className="space-y-2">
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    {/* Quick volume presets */}
                    <div className="flex justify-center space-x-2">
                      {[0.25, 0.5, 0.75, 1.0].map((preset) => (
                        <Button
                          key={preset}
                          variant="ghost"
                          size="sm"
                          onClick={() => setVolume(preset)}
                          className={`text-xs ${Math.abs(volume - preset) < 0.05 ? 'text-green-400 bg-green-500/20' : 'text-gray-400'} hover:text-white`}
                        >
                          {Math.round(preset * 100)}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Auto-Play Settings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">Auto-Play Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white">Continuous Playback</p>
                          <p className="text-xs text-gray-400">Automatically play next song</p>
                        </div>
                        <Switch
                          checked={continuousPlayback}
                          onCheckedChange={setContinuousPlayback}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white">Auto-Play Artist</p>
                          <p className="text-xs text-gray-400">Continue with same artist</p>
                        </div>
                        <Switch
                          checked={autoPlayArtist}
                          onCheckedChange={setAutoPlayArtist}
                        />
                      </div>
                    </div>
                  </div>

                      {/* Play History */}
                      {playedSongsHistory && Array.isArray(playedSongsHistory) && playedSongsHistory.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-white">
                              Recent History ({playedSongsHistory.length})
                            </h4>
                            <ScrollArea className="h-32">
                              <div className="space-y-2">
                                {playedSongsHistory.slice(0, 5).map((song, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <img
                                  src={song.imageUrl}
                                  alt={song.title}
                                  className="w-6 h-6 rounded object-cover"
                                />
                                <div className="flex-1 truncate">
                                  <p className="text-white truncate">{song.title}</p>
                                  <p className="text-gray-400 truncate">{song.artist}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FloatingSettingsPanel;