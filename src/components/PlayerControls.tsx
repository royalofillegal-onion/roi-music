
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  initContinuousPlayback, 
  startForegroundService,
  keepDeviceAwake
} from '@/services/androidNotification';

export const PlayerControls = () => {
  const { isPlaying, togglePlayPause, nextSong, previousSong } = usePlayer();

  // Super reliable Android playback state synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('Synchronizing Android playback state:', isPlaying ? 'PLAYING' : 'PAUSED');
      
      // Make multiple attempts to update state for maximum reliability
      updateAndroidPlaybackState(isPlaying);
      
      // Initialize continuous playback if playing
      if (isPlaying) {
        initContinuousPlayback();
        startForegroundService();
        keepDeviceAwake();
      }
      
      // Additional attempts with delays for better reliability
      const delays = [200, 500, 1500];
      delays.forEach(delay => {
        setTimeout(() => {
          updateAndroidPlaybackState(isPlaying);
          if (isPlaying) {
            keepDeviceAwake();
            startForegroundService();
          }
        }, delay);
      });
    }
  }, [isPlaying]);

  // Handle play/pause with maximum reliability
  const handlePlayPause = () => {
    togglePlayPause();
    
    // Update Android notification with new play state
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      const newPlayState = !isPlaying;
      console.log('Updating Android notification with new state:', newPlayState ? 'PLAYING' : 'PAUSED');
      
      // Make multiple attempts to update state
      initContinuousPlayback();
      startForegroundService();
      updateAndroidPlaybackState(newPlayState);
      
      if (newPlayState) {
        keepDeviceAwake();
      }
      
      // Additional attempts with delays
      setTimeout(() => {
        updateAndroidPlaybackState(newPlayState);
        if (newPlayState) {
          keepDeviceAwake();
          startForegroundService();
        }
      }, 300);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button 
        variant="playerControl" 
        size="playerIcon" 
        onClick={previousSong}
        aria-label="Previous song"
      >
        <SkipBack />
      </Button>

      <Button 
        variant={isPlaying ? "pauseButton" : "playButton"}
        size="playerIcon" 
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="visible opacity-100 z-50 hover:scale-110 transition-transform"
      >
        {isPlaying ? <Pause className="opacity-100" /> : <Play className="opacity-100 ml-0.5" />}
      </Button>

      <Button 
        variant="playerControl" 
        size="playerIcon" 
        onClick={nextSong}
        aria-label="Next song"
      >
        <SkipForward />
      </Button>
      
      <Volume2 className="text-white" />
    </div>
  );
};

export default PlayerControls;
