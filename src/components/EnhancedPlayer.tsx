
import React, { useEffect } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  requestBackgroundPlayback, 
  initContinuousPlayback,
  startForegroundService,
  keepDeviceAwake,
  restartAndroidPlayback
} from '@/services/androidNotification';

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, currentSong, nextSong } = usePlayer();

  // Super aggressive initialization of background playback
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('➡️ INITIALIZING AGGRESSIVE CONTINUOUS PLAYBACK SYSTEM ⬅️');
      
      // First wave - immediate initialization
      initContinuousPlayback();
      startForegroundService();
      requestBackgroundPlayback();
      keepDeviceAwake();
      
      // Multiple waves of initialization attempts at different intervals
      const intervals = [300, 800, 2000, 5000, 10000, 30000];
      intervals.forEach(delay => {
        setTimeout(() => {
          console.log(`Aggressive initialization attempt at ${delay}ms`);
          initContinuousPlayback();
          startForegroundService();
          requestBackgroundPlayback();
          keepDeviceAwake();
          
          // Force restart playback if playing
          if (isPlaying && currentSong) {
            restartAndroidPlayback();
            updateAndroidPlaybackState(true);
          }
        }, delay);
      });
      
      // Set up periodic checks to ensure playback continues
      const checkInterval = setInterval(() => {
        console.log("Periodic playback check");
        if (isPlaying && currentSong) {
          initContinuousPlayback();
          startForegroundService();
          keepDeviceAwake();
          updateAndroidPlaybackState(true);
        }
      }, 20000); // Every 20 seconds
      
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Update Android notification when play state or song changes with improved reliability
  useEffect(() => {
    if (currentSong && typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('Song or playback state changed, updating Android', isPlaying ? 'PLAYING' : 'PAUSED');
      
      // Ensure continuous playback is initialized
      initContinuousPlayback();
      startForegroundService();
      updateAndroidPlaybackState(isPlaying);
      
      // Make an additional attempt to update state for better reliability
      setTimeout(() => {
        updateAndroidPlaybackState(isPlaying);
      }, 300);
      
      // Ensure we keep device awake when playing
      if (isPlaying) {
        keepDeviceAwake();
        
        // Multiple attempts to ensure wake lock is acquired
        setTimeout(() => {
          keepDeviceAwake();
          updateAndroidPlaybackState(true);
          startForegroundService();
        }, 500);
        
        setTimeout(() => {
          keepDeviceAwake();
          updateAndroidPlaybackState(true);
        }, 2000);
      }
      
      // Restart playback if playing to ensure it's active
      if (isPlaying) {
        setTimeout(() => {
          restartAndroidPlayback();
        }, 200);
      }
    }
  }, [isPlaying, currentSong]);

  // Enhanced media control listener with improved reliability
  useEffect(() => {
    const handleMediaControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action) {
        console.log('📱 Received media control:', customEvent.detail.action);
        
        switch (customEvent.detail.action) {
          case 'play':
            if (!isPlaying) togglePlayPause();
            break;
          case 'pause':
            if (isPlaying) togglePlayPause();
            break;
          case 'next':
            nextSong();
            // Force ensure next song plays
            setTimeout(() => {
              if (!isPlaying && currentSong) {
                togglePlayPause();
              }
            }, 500);
            break;
          case 'previous':
            document.dispatchEvent(new CustomEvent('media-control', { 
              detail: { action: 'previous' } 
            }));
            break;
          case 'check_playback':
            // Respond to Android service check
            if (isPlaying && currentSong) {
              console.log('Responding to playback check - PLAYING STATE');
              updateAndroidPlaybackState(true);
              
              // Make multiple attempts to ensure the service knows we're playing
              setTimeout(() => {
                updateAndroidPlaybackState(true);
                keepDeviceAwake();
              }, 300);
            }
            break;
          case 'restart_playback':
            // Force restart playback
            if (currentSong) {
              console.log('Force restarting playback');
              if (!isPlaying) {
                togglePlayPause();
              } else {
                // Force update state with Android
                updateAndroidPlaybackState(true);
                restartAndroidPlayback();
              }
            }
            break;
        }
      }
    };

    // Listen for Android media control events with multiple event types for better reliability
    document.addEventListener('android-media-control', handleMediaControl);
    document.addEventListener('media-control', handleMediaControl);
    
    // Listen for app background restart events with enhanced recovery
    const handleBackgroundRestart = () => {
      console.log('🔄 Received background restart signal');
      if (currentSong) {
        console.log('Restarting playback after background restart');
        
        // Initialize all background systems
        startForegroundService();
        initContinuousPlayback();
        requestBackgroundPlayback();
        keepDeviceAwake();
        
        // Force playback to continue
        if (!isPlaying) {
          togglePlayPause();
        } else {
          // Force update state and restart playback
          updateAndroidPlaybackState(true);
          restartAndroidPlayback();
        }
        
        // Make multiple attempts to ensure playback continues
        setTimeout(() => {
          if (!isPlaying) togglePlayPause();
          else {
            updateAndroidPlaybackState(true);
            restartAndroidPlayback();
          }
        }, 1000);
      }
    };
    
    document.addEventListener('app-background-restart', handleBackgroundRestart);

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      document.removeEventListener('app-background-restart', handleBackgroundRestart);
    };
  }, [isPlaying, togglePlayPause, currentSong, nextSong]);

  // Restore initial play state if provided with improved reliability
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      console.log('Restoring initial play state:', initialPlayState);
      togglePlayPause();
      
      // Make multiple attempts to ensure state is restored
      if (initialPlayState && currentSong) {
        setTimeout(() => {
          if (!isPlaying && currentSong) {
            console.log('Additional attempt to restore play state');
            togglePlayPause();
            
            // Also ensure Android state is updated
            if (typeof window !== 'undefined' && window.AndroidInterface) {
              updateAndroidPlaybackState(true);
              keepDeviceAwake();
            }
          }
        }, 1000);
      }
    }
  }, [initialPlayState]);

  return <Player />;
};

export default EnhancedPlayer;
