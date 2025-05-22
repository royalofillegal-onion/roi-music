// Add AndroidInterface to Window interface
declare global {
  interface Window {
    AndroidInterface?: {
      showNotification: (title: string, body: string, imageUrl: string, isPlaying: number) => void;
      cancelNotification: () => void;
      updatePlaybackState: (isPlaying: number) => void;
      onSongCompleted: () => void;
      isBackgroundPlaybackEnabled: () => number;
      requestBackgroundPlayback: () => void;
      disableBackgroundPlayback: () => void;
      keepAwake: () => void;
      allowSleep: () => void;
      startForegroundService: () => void;
      initContinuousPlayback: () => void;
      restartPlayback: () => void;
    };
  }
}

// Detect if running inside Android WebView with native interface
export const isAndroidWebView = (): boolean => {
  return /Android/i.test(navigator.userAgent) && typeof window.AndroidInterface !== 'undefined';
};

// Check if OneSignal is available
export const isOneSignalAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.OneSignal !== 'undefined';
};

// Show Android notification with playback controls - with super aggressive background setup
export const showAndroidNotification = (title: string, body?: string, imageUrl?: string, isPlaying?: boolean) => {
  if (isAndroidWebView()) {
    try {
      console.log('📱 SHOWING ANDROID NOTIFICATION:', title, isPlaying ? 'PLAYING' : 'PAUSED');
      
      // Initialize super aggressive continuous playback sequence
      initContinuousPlayback();
      startForegroundService();
      requestBackgroundPlayback();
      
      // Keep device awake if playing
      if (isPlaying) {
        keepDeviceAwake();
      }
      
      // Show notification with redundant calls for reliability
      const playingValue = isPlaying === true ? 1 : 0;
      window.AndroidInterface?.showNotification(
        title, 
        body || '', 
        imageUrl || '',
        playingValue
      );
      
      // Also update playback state with redundant calls
      updateAndroidPlaybackState(isPlaying === true);
      
      // Make multiple attempts for reliability with staggered timing
      const delays = [100, 300, 800, 1500, 5000, 10000];
      delays.forEach(delay => {
        setTimeout(() => {
          initContinuousPlayback();
          startForegroundService();
          if (isPlaying) {
            keepDeviceAwake();
            updateAndroidPlaybackState(true);
            
            // For longer delays, ensure playback is active by restarting
            if (delay > 3000) {
              restartAndroidPlayback();
            }
          }
          
          // Re-show notification
          window.AndroidInterface?.showNotification(
            title, 
            body || '', 
            imageUrl || '',
            playingValue
          );
        }, delay);
      });
      
      // Create recurring interval to ensure service stays active
      const intervalId = setInterval(() => {
        if (isPlaying) {
          console.log("Periodic notification check to ensure continuous playback");
          initContinuousPlayback();
          startForegroundService();
          keepDeviceAwake();
          restartAndroidPlayback();
        } else {
          clearInterval(intervalId);
        }
      }, 45000); // Every 45 seconds
      
      // Clear interval after 4 hours to prevent memory leaks
      setTimeout(() => clearInterval(intervalId), 4 * 60 * 60 * 1000);
      
    } catch (e) {
      console.error('Error showing Android notification:', e);
      
      // Attempt recovery
      try {
        startForegroundService();
        updateAndroidPlaybackState(isPlaying === true);
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
    }
  }
};

// Cancel Android notification
export const cancelAndroidNotification = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.cancelNotification();
    } catch (e) {
      console.error('Error canceling notification:', e);
    }
  }
};

// Update notification playback state with super aggressive background services
export const updateAndroidPlaybackState = (isPlaying: boolean) => {
  if (isAndroidWebView()) {
    try {
      console.log('📱 UPDATING ANDROID PLAYBACK STATE:', isPlaying ? 'PLAYING' : 'PAUSED');
      
      // Always ensure foreground service is running
      startForegroundService();
      
      // Keep device awake if playing
      if (isPlaying) {
        keepDeviceAwake();
        
        // Make multiple aggressive attempts to ensure continuous playback
        initContinuousPlayback();
        requestBackgroundPlayback();
      }
      
      // Update playback state in notification
      window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
      
      // Make multiple attempts after delays for better reliability
      const delays = [100, 300, 800, 1500, 3000, 8000, 15000];
      delays.forEach(delay => {
        setTimeout(() => {
          window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
          if (isPlaying) {
            initContinuousPlayback();
            requestBackgroundPlayback();
            startForegroundService();
            keepDeviceAwake();
            
            // For longer delays, force restart playback to ensure it's active
            if (delay > 3000) {
              restartAndroidPlayback();
            }
          }
        }, delay);
      });
      
      // Set up a longer interval to keep checking playback state
      if (isPlaying) {
        const intervalId = setInterval(() => {
          console.log("Periodic playback check to maintain active state");
          window.AndroidInterface?.updatePlaybackState(1);
          initContinuousPlayback();
          requestBackgroundPlayback();
          startForegroundService();
          keepDeviceAwake();
          restartAndroidPlayback();
        }, 30000); // Every 30 seconds
        
        // Clear interval after 4 hours to prevent memory leaks
        setTimeout(() => clearInterval(intervalId), 4 * 60 * 60 * 1000);
      }
      
    } catch (e) {
      console.error('Error updating playback state:', e);
      
      // Attempt recovery
      try {
        if (isPlaying) {
          startForegroundService();
          initContinuousPlayback();
          restartAndroidPlayback();
        }
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
    }
  }
};

// Initialize continuous playback with multiple reliability safeguards
export const initContinuousPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.initContinuousPlayback) {
    try {
      console.log("🔄 INITIALIZING CONTINUOUS PLAYBACK SYSTEM");
      window.AndroidInterface.initContinuousPlayback();
      
      // Make multiple attempts for better reliability
      const delays = [200, 500, 1200];
      delays.forEach(delay => {
        setTimeout(() => {
          window.AndroidInterface?.initContinuousPlayback();
        }, delay);
      });
    } catch (e) {
      console.error('Error initializing continuous playback:', e);
      
      // Recovery attempt
      try {
        setTimeout(() => {
          window.AndroidInterface?.initContinuousPlayback();
          startForegroundService();
        }, 500);
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
    }
  }
};

// Start foreground service with enhanced reliability
export const startForegroundService = () => {
  if (isAndroidWebView() && window.AndroidInterface?.startForegroundService) {
    try {
      console.log("🚀 STARTING FOREGROUND SERVICE");
      window.AndroidInterface.startForegroundService();
      
      // Make multiple attempts for better reliability
      setTimeout(() => {
        window.AndroidInterface?.startForegroundService();
      }, 300);
      
      setTimeout(() => {
        window.AndroidInterface?.startForegroundService();
      }, 800);
    } catch (e) {
      console.error('Error starting foreground service:', e);
      
      // Recovery attempt
      try {
        setTimeout(() => {
          window.AndroidInterface?.startForegroundService();
        }, 1000);
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
    }
  }
};

// Restart playback with enhanced reliability for continuous playback
export const restartAndroidPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.restartPlayback) {
    try {
      console.log("🔄 RESTARTING ANDROID PLAYBACK FOR CONTINUOUS PLAYBACK");
      
      // First ensure full initialization
      startForegroundService();
      initContinuousPlayback();
      requestBackgroundPlayback();
      keepDeviceAwake();
      
      // Then restart playback with multiple attempts
      window.AndroidInterface.restartPlayback();
      
      // Make multiple attempts with delays
      const delays = [100, 300, 800, 2000, 5000, 15000];
      delays.forEach(delay => {
        setTimeout(() => {
          // Keep service active
          startForegroundService();
          window.AndroidInterface?.restartPlayback();
          keepDeviceAwake();
          initContinuousPlayback();
          
          // For medium delays, send additional signals
          if (delay >= 800 && delay < 3000) {
            // Also send a broadcast event to notify MainActivity
            const restartIntent = new CustomEvent('android-media-control', { 
              detail: { action: 'restart_playback' } 
            });
            document.dispatchEvent(restartIntent);
          }
          
          // For longer delays, send app restart signal
          if (delay >= 3000) {
            const appRestartIntent = new CustomEvent('app-background-restart', {});
            document.dispatchEvent(appRestartIntent);
          }
        }, delay);
      });
      
      // Set up more frequent restart checks to ensure continuous playback
      const intervalId = setInterval(() => {
        window.AndroidInterface?.restartPlayback();
        startForegroundService();
        keepDeviceAwake();
        
        // Also check playback status
        const checkIntent = new CustomEvent('media-control', { 
          detail: { action: 'check_playback' } 
        });
        document.dispatchEvent(checkIntent);
      }, 30000); // Check every 30 seconds
      
      // Clear interval after 4 hours to prevent memory leaks
      setTimeout(() => clearInterval(intervalId), 4 * 60 * 60 * 1000);
      
    } catch (e) {
      console.error('Error restarting playback:', e);
      
      // Try to recover
      setTimeout(() => {
        try {
          initContinuousPlayback();
          startForegroundService();
          // Send app restart event as last resort
          const appRestartIntent = new CustomEvent('app-background-restart', {});
          document.dispatchEvent(appRestartIntent);
        } catch (error) {
          console.error('Recovery attempt failed:', error);
        }
      }, 500);
    }
  }
};

// Notify song completed with super aggressive reliability
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      console.log("🎵 SONG COMPLETED - TRIGGERING NEXT SONG");
      
      // First ensure continuous playback is initialized
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
      keepDeviceAwake();
      
      // Then notify song completed with multiple attempts
      window.AndroidInterface?.onSongCompleted();
      
      // Fire next song events IMMEDIATELY for maximum responsiveness
      const nextIntent = new CustomEvent('android-media-control', { 
        detail: { action: 'next' } 
      });
      document.dispatchEvent(nextIntent);
      
      // Send additional events for redundancy
      const nextIntent2 = new CustomEvent('media-control', { 
        detail: { action: 'next' } 
      });
      document.dispatchEvent(nextIntent2);
      
      // Make multiple attempts with increasing delays
      const delays = [50, 150, 400, 1000, 2500];
      delays.forEach(delay => {
        setTimeout(() => {
          // Multiple ways to trigger next song
          window.AndroidInterface?.onSongCompleted();
          
          // Fire additional next events for redundancy
          const nextIntent = new CustomEvent('android-media-control', { 
            detail: { action: 'next' } 
          });
          document.dispatchEvent(nextIntent);
          
          // For longer delays, also ensure service is active
          if (delay > 300) {
            initContinuousPlayback();
            startForegroundService();
            keepDeviceAwake();
          }
        }, delay);
      });
      
      // Force restart playback after song completed for better continuity
      setTimeout(() => {
        restartAndroidPlayback();
      }, 500);
      
      // Send app restart event as backup
      setTimeout(() => {
        const appRestartIntent = new CustomEvent('app-background-restart', {});
        document.dispatchEvent(appRestartIntent);
      }, 800);
      
      // Another round of next events for extra reliability
      setTimeout(() => {
        const nextIntent3 = new CustomEvent('media-control', { 
          detail: { action: 'next' } 
        });
        document.dispatchEvent(nextIntent3);
        restartAndroidPlayback();
      }, 1500);
      
      // Final attempt with long delay as safety net
      setTimeout(() => {
        const lastAttemptEvent = new CustomEvent('media-control', { 
          detail: { action: 'next' } 
        });
        document.dispatchEvent(lastAttemptEvent);
        restartAndroidPlayback();
      }, 4000);
      
    } catch (e) {
      console.error('Error notifying song completion:', e);
      
      // Recovery attempt
      try {
        // Try basic next song event
        const nextIntent = new CustomEvent('media-control', { 
          detail: { action: 'next' } 
        });
        document.dispatchEvent(nextIntent);
        
        // Also try to restart playback
        setTimeout(() => {
          restartAndroidPlayback();
        }, 500);
        
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
    }
  }
};

// Request background playback permission with enhanced reliability
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      console.log("🔒 REQUESTING BACKGROUND PLAYBACK PERMISSION");
      window.AndroidInterface?.requestBackgroundPlayback();
      
      // Make multiple attempts with delays
      setTimeout(() => {
        window.AndroidInterface?.requestBackgroundPlayback();
      }, 300);
      
      setTimeout(() => {
        window.AndroidInterface?.requestBackgroundPlayback();
      }, 800);
      
      return true;
    } catch (e) {
      console.error('Error requesting background playback:', e);
      return false;
    }
  }
  return false;
};

// Keep device awake with enhanced reliability
export const keepDeviceAwake = () => {
  if (isAndroidWebView() && window.AndroidInterface?.keepAwake) {
    try {
      console.log("⚡ KEEPING DEVICE AWAKE");
      window.AndroidInterface.keepAwake();
      
      // Make multiple attempts with delays
      setTimeout(() => {
        window.AndroidInterface?.keepAwake();
      }, 300);
      
      setTimeout(() => {
        window.AndroidInterface?.keepAwake();
      }, 1000);
    } catch (e) {
      console.error('Error keeping device awake:', e);
      
      // Recovery attempt
      try {
        setTimeout(() => {
          window.AndroidInterface?.keepAwake();
        }, 500);
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
    }
  }
};

// Allow device to sleep
export const allowDeviceSleep = () => {
  if (isAndroidWebView() && window.AndroidInterface?.allowSleep) {
    try {
      window.AndroidInterface.allowSleep();
    } catch (e) {
      console.error('Error allowing device sleep:', e);
    }
  }
};

// Get background playback status
export const getBackgroundPlaybackEnabled = (): boolean => {
  if (isAndroidWebView()) {
    try {
      return window.AndroidInterface?.isBackgroundPlaybackEnabled() === 1;
    } catch (e) {
      console.error('Error checking background playback status:', e);
    }
  }
  return false;
};

// Disable background playback
export const disableBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.disableBackgroundPlayback();
    } catch (e) {
      console.error('Error disabling background playback:', e);
    }
  }
};
