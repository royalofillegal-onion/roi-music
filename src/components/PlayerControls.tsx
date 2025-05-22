
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  initContinuousPlayback, 
  startForegroundService,
  keepDeviceAwake,
  restartAndroidPlayback
} from '@/services/androidNotification';

export const PlayerControls = () => {
  const { isPlaying, togglePlayPause, nextSong, previousSong, currentSong } = usePlayer();

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
        
        // Also restart playback to ensure it's active
        if (currentSong) {
          restartAndroidPlayback();
        }
      }
      
      // Additional attempts with delays for better reliability
      const delays = [200, 500, 1500, 3000, 7000];
      delays.forEach(delay => {
        setTimeout(() => {
          updateAndroidPlaybackState(isPlaying);
          if (isPlaying) {
            keepDeviceAwake();
            startForegroundService();
            if (currentSong && delay > 1000) {
              // For longer delays, ensure playback is still active
              restartAndroidPlayback();
            }
          }
        }, delay);
      });
      
      // Setup recurring check to ensure playback continues
      const playbackCheckInterval = setInterval(() => {
        if (isPlaying && currentSong) {
          console.log("Ensuring continuous playback is active");
          updateAndroidPlaybackState(true);
          initContinuousPlayback();
          startForegroundService();
          keepDeviceAwake();
          
          // Every 30 seconds, force restart playback to ensure it's active
          restartAndroidPlayback();
        }
      }, 30000);
      
      return () => clearInterval(playbackCheckInterval);
    }
  }, [isPlaying, currentSong]);

  // Enhanced media control listener
  useEffect(() => {
    const handleContinuousPlayback = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action === 'ensure_continuous_playback' && isPlaying) {
        console.log("🔥 Received ensure_continuous_playback signal");
        // Force ensure playback is active
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          updateAndroidPlaybackState(true);
          startForegroundService();
          keepDeviceAwake();
          restartAndroidPlayback();
        }
      }
    };
    
    document.addEventListener('media-control', handleContinuousPlayback);
    
    return () => {
      document.removeEventListener('media-control', handleContinuousPlayback);
    };
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
        // Also restart playback to ensure it's active
        restartAndroidPlayback();
      }
      
      // Additional attempts with delays
      const delays = [300, 1000, 3000];
      delays.forEach(delay => {
        setTimeout(() => {
          updateAndroidPlaybackState(newPlayState);
          if (newPlayState) {
            keepDeviceAwake();
            startForegroundService();
            restartAndroidPlayback();
          }
        }, delay);
      });
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
