import React, { useEffect, useRef } from 'react';
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
  const backgroundCheckIntervalRef = useRef<number | null>(null);

  // Super aggressive initialization of background playback
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('➡️ INITIALIZING CONTINUOUS PLAYBACK SYSTEM ⬅️');
      
      // First wave - immediate initialization
      initContinuousPlayback();
      startForegroundService();
      requestBackgroundPlayback();
      keepDeviceAwake();
      
      // Multiple waves of initialization attempts at different intervals
      const intervals = [100, 300, 800, 2000, 5000, 15000];
      intervals.forEach(delay => {
        setTimeout(() => {
          console.log(`Continuous playback initialization at ${delay}ms`);
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
      
      // Set up aggressive periodic checks to ensure playback continues
      if (backgroundCheckIntervalRef.current) {
        clearInterval(backgroundCheckIntervalRef.current);
      }
      
      backgroundCheckIntervalRef.current = window.setInterval(() => {
        console.log("Continuous playback system check");
        if (isPlaying && currentSong) {
          initContinuousPlayback();
          startForegroundService();
          keepDeviceAwake();
          updateAndroidPlaybackState(true);
          restartAndroidPlayback();
        }
      }, 15000); // Check every 15 seconds - critical for background playback
      
      return () => {
        if (backgroundCheckIntervalRef.current) {
          clearInterval(backgroundCheckIntervalRef.current);
          backgroundCheckIntervalRef.current = null;
        }
      };
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
      
      // Make multiple attempts to update state for better reliability
      const delays = [50, 200, 600, 1500, 4000];
      delays.forEach(delay => {
        setTimeout(() => {
          updateAndroidPlaybackState(isPlaying);
          if (isPlaying) {
            keepDeviceAwake();
            startForegroundService();
            
            // For longer delays, also restart playback
            if (delay > 1000) {
              restartAndroidPlayback();
            }
          }
        }, delay);
      });
      
      // Ensure we keep device awake when playing
      if (isPlaying) {
        keepDeviceAwake();
        
        // Restart playback to ensure it's active
        restartAndroidPlayback();
        
        // Setup or reset interval for continuous checks
        if (backgroundCheckIntervalRef.current) {
          clearInterval(backgroundCheckIntervalRef.current);
        }
        
        backgroundCheckIntervalRef.current = window.setInterval(() => {
          if (isPlaying && currentSong) {
            console.log("Continuous playback maintenance check");
            updateAndroidPlaybackState(true);
            keepDeviceAwake();
            startForegroundService();
            restartAndroidPlayback();
          }
        }, 15000);
      } else {
        // Clear interval when paused
        if (backgroundCheckIntervalRef.current) {
          clearInterval(backgroundCheckIntervalRef.current);
          backgroundCheckIntervalRef.current = null;
        }
      }
    }
    
    return () => {
      if (backgroundCheckIntervalRef.current) {
        clearInterval(backgroundCheckIntervalRef.current);
        backgroundCheckIntervalRef.current = null;
      }
    };
  }, [isPlaying, currentSong]);

  // Enhanced media control listener with improved reliability for continuous playback
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
              
              // Also trigger restart for Android
              if (typeof window !== 'undefined' && window.AndroidInterface) {
                updateAndroidPlaybackState(true);
                restartAndroidPlayback();
              }
            }, 300);
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
              
              if (typeof window !== 'undefined' && window.AndroidInterface) {
                updateAndroidPlaybackState(true);
                keepDeviceAwake();
                restartAndroidPlayback();
                
                // Make multiple attempts
                setTimeout(() => {
                  updateAndroidPlaybackState(true);
                  keepDeviceAwake();
                  restartAndroidPlayback();
                }, 200);
              }
            }
            break;
          case 'restart_playback':
            // Force restart playback
            if (currentSong) {
              console.log('Force restarting playback');
              if (!isPlaying) {
                togglePlayPause();
              } else if (typeof window !== 'undefined' && window.AndroidInterface) {
                // Force update state with Android
                updateAndroidPlaybackState(true);
                keepDeviceAwake();
                restartAndroidPlayback();
                
                // Multiple attempts
                setTimeout(() => {
                  updateAndroidPlaybackState(true);
                  restartAndroidPlayback();
                }, 300);
                
                setTimeout(() => {
                  updateAndroidPlaybackState(true);
                  restartAndroidPlayback();
                }, 1000);
                
                setTimeout(() => {
                  updateAndroidPlaybackState(true);
                  restartAndroidPlayback();
                }, 3000);
              }
            }
            break;
        }
      }
    };

    // Listen for media control events with multiple event types for better reliability
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
        } else if (typeof window !== 'undefined' && window.AndroidInterface) {
          // Force update state and restart playback
          updateAndroidPlaybackState(true);
          restartAndroidPlayback();
          
          // Multiple attempts
          setTimeout(() => {
            updateAndroidPlaybackState(true);
            restartAndroidPlayback();
          }, 300);
          
          setTimeout(() => {
            updateAndroidPlaybackState(true);
            restartAndroidPlayback();
          }, 1000);
          
          setTimeout(() => {
            updateAndroidPlaybackState(true);
            restartAndroidPlayback();
          }, 3000);
        }
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
              restartAndroidPlayback();
            }
          }
        }, 500);
        
        setTimeout(() => {
          if (!isPlaying && currentSong) {
            console.log('Final attempt to restore play state');
            togglePlayPause();
            
            if (typeof window !== 'undefined' && window.AndroidInterface) {
              updateAndroidPlaybackState(true);
              keepDeviceAwake();
              restartAndroidPlayback();
            }
          }
        }, 1500);
      }
    }
  }, [initialPlayState]);

  return <Player />;
};

export default EnhancedPlayer;
