
import React, { useEffect, useRef } from 'react';
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
  const checkIntervalRef = useRef<number | null>(null);

  // Super reliable Android playback state synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('⚡ OPTIMIZING PLAYBACK STATE:', isPlaying ? 'PLAYING' : 'PAUSED');
      
      // Make multiple attempts to update state for maximum reliability
      updateAndroidPlaybackState(isPlaying);
      
      // Initialize continuous playback if playing
      if (isPlaying) {
        // Apply full initialization sequence
        initContinuousPlayback();
        startForegroundService();
        keepDeviceAwake();
        
        // Force restart playback to ensure active state
        if (currentSong) {
          restartAndroidPlayback();
        }
        
        // Clear any existing interval
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        
        // Setup aggressive continuous playback checker
        checkIntervalRef.current = window.setInterval(() => {
          if (isPlaying && currentSong) {
            console.log("🔁 ENSURING CONTINUOUS PLAYBACK IS ACTIVE");
            updateAndroidPlaybackState(true);
            initContinuousPlayback();
            startForegroundService();
            keepDeviceAwake();
            
            // Force restart playback every 20 seconds to ensure it's active
            restartAndroidPlayback();
          }
        }, 20000); // Check every 20 seconds - crucial for background playback
      } else {
        // Clear interval when paused
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
      
      // Additional attempts with delays for better reliability
      const delays = [100, 300, 800, 2000, 5000];
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
    }
    
    // Cleanup interval on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isPlaying, currentSong]);

  // Enhanced media control listener for continuous playback
  useEffect(() => {
    const handleContinuousPlayback = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action === 'ensure_continuous_playback' && isPlaying) {
        console.log("🔥 RECEIVED CONTINUOUS PLAYBACK SIGNAL");
        // Force ensure playback is active with multiple retries
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          // Apply the full restart sequence for maximum reliability
          updateAndroidPlaybackState(true);
          startForegroundService();
          keepDeviceAwake();
          restartAndroidPlayback();
          
          // Additional attempts with delays
          setTimeout(() => {
            updateAndroidPlaybackState(true);
            restartAndroidPlayback();
          }, 300);
          
          setTimeout(() => {
            updateAndroidPlaybackState(true);
            restartAndroidPlayback();
          }, 1500);
        }
      }
    };
    
    document.addEventListener('media-control', handleContinuousPlayback);
    
    // Also listen for background restart events
    const handleBackgroundRestart = () => {
      console.log("🔄 RECEIVED BACKGROUND RESTART SIGNAL");
      if (isPlaying && currentSong && typeof window !== 'undefined' && window.AndroidInterface) {
        // Apply the full restart sequence with multiple retries
        updateAndroidPlaybackState(true);
        startForegroundService();
        keepDeviceAwake();
        restartAndroidPlayback();
        
        // Multiple attempts with delays for reliability
        setTimeout(() => {
          updateAndroidPlaybackState(true);
          restartAndroidPlayback();
        }, 500);
        
        setTimeout(() => {
          updateAndroidPlaybackState(true);
          restartAndroidPlayback();
        }, 2000);
      }
    };
    
    document.addEventListener('app-background-restart', handleBackgroundRestart);
    
    return () => {
      document.removeEventListener('media-control', handleContinuousPlayback);
      document.removeEventListener('app-background-restart', handleBackgroundRestart);
    };
  }, [isPlaying, currentSong]);

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
        
        // Setup aggressive continuous playback checker
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        
        checkIntervalRef.current = window.setInterval(() => {
          if (newPlayState && currentSong) {
            console.log("🔁 ENSURING CONTINUOUS PLAYBACK IS ACTIVE");
            updateAndroidPlaybackState(true);
            initContinuousPlayback();
            startForegroundService();
            keepDeviceAwake();
            restartAndroidPlayback();
          }
        }, 20000);
      } else {
        // Clear interval when paused
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
      
      // Additional attempts with delays
      const delays = [200, 800, 2000, 5000];
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
