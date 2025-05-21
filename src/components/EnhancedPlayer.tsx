import React, { useEffect, useState, useRef } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  requestBackgroundPlayback, 
  getBackgroundPlaybackEnabled, 
  keepDeviceAwake,
  initContinuousPlayback,
  startForegroundService
} from '@/services/androidNotification';
import { toast } from "sonner";

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, setVolume, currentSong } = usePlayer();
  const [backgroundPlaybackConfirmed, setBackgroundPlaybackConfirmed] = useState(false);
  const backgroundPlaybackRequested = useRef(false);
  const wakeLockRequested = useRef(false);
  const continuousPlaybackInitialized = useRef(false);
  
  // Track background state
  const [isInBackground, setIsInBackground] = useState(false);
  
  // Timer for periodic status checks
  const statusCheckTimerRef = useRef<number | null>(null);
  const periodicWakeLockTimerRef = useRef<number | null>(null);

  // Initialize and request background playback immediately and aggressively
  useEffect(() => {
    // Initialize everything necessary for continuous background playback
    const initializeBackgroundPlayback = () => {
      if (typeof window !== 'undefined' && window.AndroidInterface) {
        console.log('Initializing continuous playback service');
        
        // Initialize continuous playback service
        if (!continuousPlaybackInitialized.current) {
          initContinuousPlayback();
          continuousPlaybackInitialized.current = true;
          console.log('Continuous playback service initialized');
        }
        
        // Request background playback permission
        if (!backgroundPlaybackRequested.current) {
          requestBackgroundPlayback();
          console.log('Background playback requested from Android on mount');
          backgroundPlaybackRequested.current = true;
        }
        
        // Start foreground service
        startForegroundService();
        console.log('Foreground service started');
        
        // Keep device awake if playing to ensure continuous playback
        if (isPlaying && !wakeLockRequested.current) {
          keepDeviceAwake();
          wakeLockRequested.current = true;
          console.log('Wake lock requested');
        }
        
        // Confirm background playback was enabled and show toast notification
        setTimeout(() => {
          if (getBackgroundPlaybackEnabled()) {
            toast.success("Background playback enabled", {
              duration: 3000,
              description: "Music will continue even when app is closed"
            });
            setBackgroundPlaybackConfirmed(true);
          } else {
            console.warn("Background playback not enabled, retrying...");
            
            // Retry aggressively with escalating timing
            [100, 500, 1000, 2000, 5000].forEach(delay => {
              setTimeout(() => {
                requestBackgroundPlayback();
                console.log(`Background playback re-requested after ${delay}ms`);
                
                // Check if it worked after a short delay
                if (delay === 5000) {
                  setTimeout(() => {
                    if (getBackgroundPlaybackEnabled()) {
                      toast.success("Background playback enabled", {
                        duration: 3000,
                        description: "Music will continue even when app is closed"
                      });
                      setBackgroundPlaybackConfirmed(true);
                    } else {
                      toast.error("Background playback not enabled", {
                        duration: 5000,
                        description: "Music may stop when app is closed"
                      });
                    }
                  }, 1000);
                }
              }, delay);
            });
          }
        }, 1000);
      }
    };
    
    // Call initialization immediately
    initializeBackgroundPlayback();
    
    // Set up periodic status check and wake lock renewal
    statusCheckTimerRef.current = window.setInterval(() => {
      if (typeof window !== 'undefined' && window.AndroidInterface) {
        // Re-initialize if needed
        if (!continuousPlaybackInitialized.current) {
          initContinuousPlayback();
          continuousPlaybackInitialized.current = true;
        }
        
        // Re-request background playback
        requestBackgroundPlayback();
        
        // Start foreground service
        if (isPlaying) {
          startForegroundService();
        }
        
        console.log('Periodic background playback check completed');
      }
    }, 30000); // Every 30 seconds
    
    // Set up even more frequent wake lock renewal when playing
    periodicWakeLockTimerRef.current = window.setInterval(() => {
      if (typeof window !== 'undefined' && window.AndroidInterface && isPlaying) {
        keepDeviceAwake();
        console.log('Periodic wake lock refresh');
      }
    }, 15000); // Every 15 seconds
    
    // Clean up timers on unmount
    return () => {
      if (statusCheckTimerRef.current !== null) {
        clearInterval(statusCheckTimerRef.current);
      }
      if (periodicWakeLockTimerRef.current !== null) {
        clearInterval(periodicWakeLockTimerRef.current);
      }
    };
  }, []);

  // Handle visibility changes with more aggressive background handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = !isInBackground;
      const isVisible = document.visibilityState === 'visible';
      const isHidden = !isVisible;
      
      console.log(`Visibility changed: ${wasVisible ? 'visible' : 'hidden'} -> ${isVisible ? 'visible' : 'hidden'}`);
      setIsInBackground(isHidden);
      
      if (isHidden) {
        // App going to background - ensure background playback
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          console.log('App going to background, reinforcing background playback');
          
          // Initialize if not already
          if (!continuousPlaybackInitialized.current) {
            initContinuousPlayback();
            continuousPlaybackInitialized.current = true;
          }
          
          // Multiple aggressive background playback requests
          requestBackgroundPlayback();
          
          // Start foreground service
          startForegroundService();
          
          // Keep device awake if playing
          if (isPlaying) {
            keepDeviceAwake();
          }
          
          // Schedule multiple follow-up requests to ensure it stays enabled
          [500, 1500, 3000, 10000].forEach(delay => {
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.AndroidInterface) {
                requestBackgroundPlayback();
                console.log(`Background follow-up request after ${delay}ms`);
                if (isPlaying) {
                  keepDeviceAwake();
                  startForegroundService();
                }
              }
            }, delay);
          });
        }
      } else {
        // App coming to foreground - check background playback status
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          const isEnabled = getBackgroundPlaybackEnabled();
          console.log(`App returning to foreground, background playback enabled: ${isEnabled}`);
          
          // If not enabled, try to enable it
          if (!isEnabled) {
            console.log('Background playback not enabled, requesting again');
            if (!continuousPlaybackInitialized.current) {
              initContinuousPlayback();
              continuousPlaybackInitialized.current = true;
            }
            requestBackgroundPlayback();
          }
        }
      }
    };
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial check
    handleVisibilityChange();
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isInBackground]);

  // Request background playback again when playback state changes to ensure it's maintained
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      // Update Android notification with play state
      if (currentSong) {
        updateAndroidPlaybackState(isPlaying);
      }
      
      if (isPlaying) {
        console.log('Playback started/resumed, reinforcing background playback');
        
        // Initialize if not already
        if (!continuousPlaybackInitialized.current) {
          initContinuousPlayback();
          continuousPlaybackInitialized.current = true;
        }
        
        // Re-request background playback when playing starts/resumes
        requestBackgroundPlayback();
        
        // Start foreground service
        startForegroundService();
        
        // Keep device awake when playing
        if (!wakeLockRequested.current) {
          keepDeviceAwake();
          wakeLockRequested.current = true;
        } else {
          // Refresh wake lock anyway
          keepDeviceAwake();
        }
      }
    }
  }, [isPlaying, currentSong]);

  // Listen for media control events from Android and service worker
  useEffect(() => {
    const handleMediaControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action) {
        console.log('Received media control:', customEvent.detail.action);
        
        // Re-request background playback when receiving media controls
        // to ensure continuous playback
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          if (!continuousPlaybackInitialized.current) {
            initContinuousPlayback();
            continuousPlaybackInitialized.current = true;
          }
          requestBackgroundPlayback();
          startForegroundService();
        }
        
        switch (customEvent.detail.action) {
          case 'play':
            if (!isPlaying) togglePlayPause();
            break;
          case 'pause':
            if (isPlaying) togglePlayPause();
            break;
          case 'next':
            document.dispatchEvent(new CustomEvent('media-control', { 
              detail: { action: 'next' } 
            }));
            break;
          case 'previous':
            document.dispatchEvent(new CustomEvent('media-control', { 
              detail: { action: 'previous' } 
            }));
            break;
          case 'volume-up':
            setVolume(0.75); // Increase volume
            break;
          case 'volume-down':
            setVolume(0.25); // Decrease volume
            break;
        }
      }
    };

    // Listen for Android events, service worker events, and broadcast events
    document.addEventListener('android-media-control', handleMediaControl);
    document.addEventListener('media-control', handleMediaControl);
    
    // Listen for background app restart events (used when app is killed but service continues)
    const handleBackgroundRestart = () => {
      console.log('Received background restart signal');
      if (!continuousPlaybackInitialized.current) {
        initContinuousPlayback();
        continuousPlaybackInitialized.current = true;
      }
      requestBackgroundPlayback();
      startForegroundService();
    };
    
    document.addEventListener('app-background-restart', handleBackgroundRestart);

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      document.removeEventListener('app-background-restart', handleBackgroundRestart);
    };
  }, [isPlaying, togglePlayPause, setVolume]);

  // Restore initial play state if provided and different from current
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      console.log('Syncing play state with parent component:', initialPlayState);
    }
  }, [initialPlayState, isPlaying]);

  return <Player />;
};

export default EnhancedPlayer;
