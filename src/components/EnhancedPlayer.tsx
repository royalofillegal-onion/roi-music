import React, { useEffect, useState, useRef } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  requestBackgroundPlayback, 
  getBackgroundPlaybackEnabled, 
  keepDeviceAwake,
  initContinuousPlayback,
  startForegroundService,
  restartAndroidPlayback
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
  const ultraAggressiveTimerRef = useRef<number | null>(null);

  // Initialize and request background playback immediately and ultra-aggressively
  useEffect(() => {
    // Initialize everything necessary for continuous background playback with ultra-aggressive approach
    const initializeBackgroundPlayback = () => {
      if (typeof window !== 'undefined' && window.AndroidInterface) {
        console.log('Initializing continuous playback service with ultra-aggressive approach');
        
        // Initialize continuous playback service with multiple attempts
        initContinuousPlayback();
        continuousPlaybackInitialized.current = true;
        
        // Request background playback permission with ultra-aggressive approach
        requestBackgroundPlayback();
        backgroundPlaybackRequested.current = true;
        
        // Start foreground service multiple times
        startForegroundService();
        setTimeout(() => startForegroundService(), 500);
        setTimeout(() => startForegroundService(), 2000);
        
        // Keep device awake with multiple wake lock requests
        keepDeviceAwake();
        wakeLockRequested.current = true;
        
        // Confirm background playback was enabled and show toast notification
        setTimeout(() => {
          if (getBackgroundPlaybackEnabled()) {
            toast.success("Background playback enabled", {
              duration: 3000,
              description: "Music will continue even when app is closed"
            });
            setBackgroundPlaybackConfirmed(true);
          } else {
            console.warn("Background playback not enabled, retrying ultra-aggressively...");
            
            // Ultra-aggressive retry with many attempts
            [100, 300, 500, 1000, 1500, 2000, 3000, 5000, 10000, 20000].forEach(delay => {
              setTimeout(() => {
                requestBackgroundPlayback();
                console.log(`Ultra-aggressive background playback re-requested after ${delay}ms`);
                
                // Check if it worked after each attempt
                setTimeout(() => {
                  if (getBackgroundPlaybackEnabled()) {
                    toast.success("Background playback enabled", {
                      duration: 3000,
                      description: "Music will continue even when app is closed"
                    });
                    setBackgroundPlaybackConfirmed(true);
                  }
                }, delay + 300);
              }, delay);
            });
          }
        }, 1000);
      }
    };
    
    // Call initialization immediately
    initializeBackgroundPlayback();
    
    // Set up periodic status check and wake lock renewal (every 15 seconds)
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
        startForegroundService();
        
        // Keep device awake
        keepDeviceAwake();
        
        console.log('Periodic aggressive background playback check completed');
      }
    }, 15000);
    
    // Set up even more frequent wake lock renewal when playing (every 10 seconds)
    periodicWakeLockTimerRef.current = window.setInterval(() => {
      if (typeof window !== 'undefined' && window.AndroidInterface && isPlaying) {
        keepDeviceAwake();
        console.log('Periodic wake lock refresh');
      }
    }, 10000);
    
    // Ultra-aggressive periodic playback check (every 5 seconds)
    ultraAggressiveTimerRef.current = window.setInterval(() => {
      if (typeof window !== 'undefined' && window.AndroidInterface && isPlaying) {
        // Try to restart playback if it stopped
        restartAndroidPlayback();
        
        // Update playback state
        updateAndroidPlaybackState(true);
        
        console.log('Ultra-aggressive playback check completed');
      }
    }, 5000);
    
    // Clean up timers on unmount
    return () => {
      if (statusCheckTimerRef.current !== null) {
        clearInterval(statusCheckTimerRef.current);
      }
      if (periodicWakeLockTimerRef.current !== null) {
        clearInterval(periodicWakeLockTimerRef.current);
      }
      if (ultraAggressiveTimerRef.current !== null) {
        clearInterval(ultraAggressiveTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Handle visibility changes with ultra-aggressive background handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = !isInBackground;
      const isVisible = document.visibilityState === 'visible';
      const isHidden = !isVisible;
      
      console.log(`Visibility changed: ${wasVisible ? 'visible' : 'hidden'} -> ${isVisible ? 'visible' : 'hidden'}`);
      setIsInBackground(isHidden);
      
      if (isHidden) {
        // App going to background - ensure background playback with ultra-aggressive approach
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          console.log('App going to background, ultra-aggressive reinforcement of background playback');
          
          // Initialize if not already with multiple attempts
          initContinuousPlayback();
          continuousPlaybackInitialized.current = true;
          
          // Multiple ultra-aggressive background playback requests
          requestBackgroundPlayback();
          
          // Start foreground service multiple times
          startForegroundService();
          setTimeout(() => startForegroundService(), 500);
          
          // Keep device awake if playing with multiple wake lock requests
          if (isPlaying) {
            keepDeviceAwake();
          }
          
          // Schedule multiple follow-up requests with many attempts to ensure it stays enabled
          [100, 300, 500, 1000, 1500, 2000, 3000, 5000, 7000, 10000, 15000, 30000].forEach(delay => {
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.AndroidInterface) {
                requestBackgroundPlayback();
                console.log(`Ultra-aggressive background follow-up request after ${delay}ms`);
                
                if (isPlaying) {
                  keepDeviceAwake();
                  startForegroundService();
                  
                  // Also try to restart playback
                  restartAndroidPlayback();
                  updateAndroidPlaybackState(true);
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
          
          // If not enabled, try to enable it with ultra-aggressive approach
          if (!isEnabled) {
            console.log('Background playback not enabled, requesting again ultra-aggressively');
            initContinuousPlayback();
            continuousPlaybackInitialized.current = true;
            
            // Multiple requests
            requestBackgroundPlayback();
            setTimeout(() => requestBackgroundPlayback(), 500);
            setTimeout(() => requestBackgroundPlayback(), 1000);
          }
          
          // Always update playback state when returning to foreground
          if (currentSong && isPlaying) {
            updateAndroidPlaybackState(isPlaying);
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
  }, [isPlaying, isInBackground, currentSong]);

  // Request background playback again when playback state changes with ultra-aggressive approach
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      // Update Android notification with play state
      if (currentSong) {
        updateAndroidPlaybackState(isPlaying);
      }
      
      if (isPlaying) {
        console.log('Playback started/resumed, ultra-aggressive reinforcement of background playback');
        
        // Initialize if not already with multiple attempts
        initContinuousPlayback();
        continuousPlaybackInitialized.current = true;
        
        // Re-request background playback when playing starts/resumes with multiple attempts
        requestBackgroundPlayback();
        setTimeout(() => requestBackgroundPlayback(), 500);
        
        // Start foreground service multiple times
        startForegroundService();
        setTimeout(() => startForegroundService(), 500);
        
        // Keep device awake when playing with multiple wake lock requests
        keepDeviceAwake();
        wakeLockRequested.current = true;
      }
    }
  }, [isPlaying, currentSong]);

  // Listen for media control events from Android and service worker with improved handling
  useEffect(() => {
    const handleMediaControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action) {
        console.log('Received media control:', customEvent.detail.action);
        
        // Re-request background playback when receiving media controls
        // with ultra-aggressive approach to ensure continuous playback
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          initContinuousPlayback();
          continuousPlaybackInitialized.current = true;
          
          requestBackgroundPlayback();
          setTimeout(() => requestBackgroundPlayback(), 500);
          
          startForegroundService();
          setTimeout(() => startForegroundService(), 500);
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
    
    // Listen for background app restart events with improved handling
    const handleBackgroundRestart = () => {
      console.log('Received background restart signal');
      
      // Ultra-aggressive initialization on restart
      initContinuousPlayback();
      continuousPlaybackInitialized.current = true;
      
      // Multiple background playback requests
      requestBackgroundPlayback();
      setTimeout(() => requestBackgroundPlayback(), 500);
      
      // Multiple foreground service starts
      startForegroundService();
      setTimeout(() => startForegroundService(), 500);
      
      // Try to restart playback
      restartAndroidPlayback();
      
      // Also try to resume playback through player context
      if (!isPlaying && currentSong) {
        setTimeout(() => {
          togglePlayPause();
        }, 1000);
      }
    };
    
    document.addEventListener('app-background-restart', handleBackgroundRestart);

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      document.removeEventListener('app-background-restart', handleBackgroundRestart);
    };
  }, [isPlaying, togglePlayPause, setVolume, currentSong]);

  // Restore initial play state if provided and different from current
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      console.log('Syncing play state with parent component:', initialPlayState);
      togglePlayPause();
    }
  }, [initialPlayState, isPlaying, togglePlayPause]);

  return <Player />;
};

export default EnhancedPlayer;
