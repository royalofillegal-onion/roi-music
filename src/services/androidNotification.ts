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
      restartPlayback: () => void; // Add new method for restarting playback
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

// Call Android native to show notification with super aggressive approach
export const showAndroidNotification = (title: string, body?: string, imageUrl?: string, isPlaying?: boolean) => {
  if (isAndroidWebView()) {
    try {
      console.log("Android native notification with playback state:", isPlaying);
      
      // First ensure background playback is enabled with more aggressive approach
      initContinuousPlayback();
      
      // Multiple background playback requests to ensure it's registered
      requestBackgroundPlayback();
      setTimeout(() => requestBackgroundPlayback(), 500);
      setTimeout(() => requestBackgroundPlayback(), 1500);
      
      // Start foreground service to ensure playback continues
      startForegroundService();
      setTimeout(() => startForegroundService(), 1000);
      
      // Keep device awake for playback
      keepDeviceAwake();
      
      // Pass image URL and playing state to Android for rich notifications
      // CRITICAL: Make sure isPlaying is properly converted to number (0 or 1)
      const playingValue = isPlaying === true ? 1 : 0;
      console.log("Setting notification play state to:", playingValue);
      
      window.AndroidInterface?.showNotification(
        title, 
        body || '', 
        imageUrl || '',
        playingValue
      );
      
      // Redundant notification call after a delay to ensure it's showing
      setTimeout(() => {
        if (window.AndroidInterface) {
          console.log("Reinforcing notification with play state:", playingValue);
          window.AndroidInterface.showNotification(
            title, 
            body || '', 
            imageUrl || '',
            playingValue
          );
        }
      }, 1000);
      
      // Also update playback state separately to ensure controls are correctly shown
      if (typeof isPlaying === 'boolean') {
        updateAndroidPlaybackState(isPlaying);
      }
      
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
      // Try again after a delay
      setTimeout(() => {
        try {
          if (window.AndroidInterface) {
            initContinuousPlayback();
            requestBackgroundPlayback();
            startForegroundService();
            window.AndroidInterface.showNotification(
              title, 
              body || '', 
              imageUrl || '',
              isPlaying === true ? 1 : 0
            );
          }
        } catch (innerError) {
          console.error('Retry error:', innerError);
        }
      }, 2000);
    }
  }
};

// Call Android native to cancel notification
export const cancelAndroidNotification = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.cancelNotification();
      console.log('Android native notification canceled');
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
    }
  }
};

// Update notification playback state (play/pause) with extreme redundancy
export const updateAndroidPlaybackState = (isPlaying: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Always ensure continuous playback is initialized
      initContinuousPlayback();
      
      // Always request background playback multiple times
      requestBackgroundPlayback();
      setTimeout(() => requestBackgroundPlayback(), 500);
      setTimeout(() => requestBackgroundPlayback(), 1500);
      
      // Start foreground service if playing
      if (isPlaying) {
        startForegroundService();
        setTimeout(() => startForegroundService(), 1000);
        keepDeviceAwake();
      }
      
      console.log("Updating Android playback state to:", isPlaying ? "PLAYING(1)" : "PAUSED(0)");
      window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
      
      // Redundant state updates with logging
      setTimeout(() => {
        if (window.AndroidInterface) {
          console.log("Reinforcing playback state update to:", isPlaying ? "PLAYING(1)" : "PAUSED(0)");
          window.AndroidInterface.updatePlaybackState(isPlaying ? 1 : 0);
        }
      }, 500);
      
      setTimeout(() => {
        if (window.AndroidInterface) {
          console.log("Second reinforcement of playback state:", isPlaying ? "PLAYING(1)" : "PAUSED(0)");
          window.AndroidInterface.updatePlaybackState(isPlaying ? 1 : 0);
        }
      }, 2000);
      
    } catch (e) {
      console.error('Error updating Android playback state:', e);
      // Retry after error
      setTimeout(() => {
        try {
          if (window.AndroidInterface) {
            window.AndroidInterface.updatePlaybackState(isPlaying ? 1 : 0);
          }
        } catch (innerError) {
          console.error('Retry error:', innerError);
        }
      }, 1000);
    }
  }
};

// Initialize continuous playback service with extreme redundancy
export const initContinuousPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.initContinuousPlayback) {
    try {
      window.AndroidInterface.initContinuousPlayback();
      console.log('Continuous playback initialized');
      
      // Additional redundant calls to ensure it's properly initialized
      const initTimes = [100, 300, 500, 1000, 3000, 5000];
      initTimes.forEach(time => {
        setTimeout(() => {
          if (window.AndroidInterface?.initContinuousPlayback) {
            window.AndroidInterface.initContinuousPlayback();
            console.log(`Redundant init after ${time}ms`);
          }
        }, time);
      });
    } catch (e) {
      console.error('Error initializing continuous playback:', e);
      // Retry initialization
      setTimeout(() => {
        if (window.AndroidInterface?.initContinuousPlayback) {
          try {
            window.AndroidInterface.initContinuousPlayback();
          } catch (innerError) {
            console.error('Retry error:', innerError);
          }
        }
      }, 1000);
    }
  }
};

// Start foreground service for persistent playback with redundancy
export const startForegroundService = () => {
  if (isAndroidWebView() && window.AndroidInterface?.startForegroundService) {
    try {
      window.AndroidInterface.startForegroundService();
      console.log('Foreground service started');
      
      // Redundant calls to start foreground service
      setTimeout(() => {
        if (window.AndroidInterface?.startForegroundService) {
          window.AndroidInterface.startForegroundService();
          console.log('Foreground service start reinforced');
        }
      }, 2000);
    } catch (e) {
      console.error('Error starting foreground service:', e);
      // Retry
      setTimeout(() => {
        try {
          if (window.AndroidInterface?.startForegroundService) {
            window.AndroidInterface.startForegroundService();
          }
        } catch (innerError) {
          console.error('Retry error:', innerError);
        }
      }, 1000);
    }
  }
};

// Force restart playback (new helper function)
export const restartAndroidPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.restartPlayback) {
    try {
      console.log('Attempting to restart Android playback');
      window.AndroidInterface.restartPlayback();
    } catch (e) {
      console.error('Error restarting playback:', e);
    }
  }
};

// Notify Android that a song has completed with ultra-redundancy
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      // Always ensure background playback is enabled for continuous playback
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
      keepDeviceAwake();
      
      window.AndroidInterface?.onSongCompleted();
      console.log('Android notified of song completion');
      
      // Redundant notification of song completion
      setTimeout(() => {
        if (window.AndroidInterface) {
          window.AndroidInterface?.onSongCompleted();
          console.log('Song completion notification reinforced');
          
          // Also try to restart playback after completion
          if (window.AndroidInterface.restartPlayback) {
            window.AndroidInterface.restartPlayback();
          }
        }
      }, 500);
    } catch (e) {
      console.error('Error notifying song completion:', e);
      // Retry notification
      setTimeout(() => {
        try {
          if (window.AndroidInterface) {
            window.AndroidInterface.onSongCompleted();
          }
        } catch (innerError) {
          console.error('Retry error:', innerError);
        }
      }, 1000);
    }
  }
};

// Get background playback status from Android
export const getBackgroundPlaybackEnabled = (): boolean => {
  if (isAndroidWebView()) {
    try {
      const isEnabled = window.AndroidInterface?.isBackgroundPlaybackEnabled() === 1;
      console.log('Background playback enabled status:', isEnabled);
      return isEnabled;
    } catch (e) {
      console.error('Error checking background playback status:', e);
    }
  }
  return false; // Default to false on non-Android platforms to ensure explicit enabling
};

// Request background playback permission with ultra-aggressive approach
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.requestBackgroundPlayback();
      console.log('Background playback requested from Android');
      
      // Ultra-aggressive multiple requests with different timing
      const requestTimes = [100, 300, 500, 1000, 1500, 2000, 3000, 5000, 10000];
      requestTimes.forEach(time => {
        setTimeout(() => {
          try {
            if (window.AndroidInterface) {
              window.AndroidInterface.requestBackgroundPlayback();
              console.log(`Background playback re-requested after ${time}ms`);
            }
          } catch (e) {
            console.error(`Error in delayed background playback request (${time}ms):`, e);
          }
        }, time);
      });
      
      return true;
    } catch (e) {
      console.error('Error requesting background playback:', e);
      // Retry request
      setTimeout(() => {
        try {
          if (window.AndroidInterface) {
            window.AndroidInterface.requestBackgroundPlayback();
          }
        } catch (innerError) {
          console.error('Retry error:', innerError);
        }
      }, 1000);
      return false;
    }
  }
  return false;
};

// Disable background playback
export const disableBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.disableBackgroundPlayback();
      console.log('Background playback disabled from Android');
    } catch (e) {
      console.error('Error disabling background playback:', e);
    }
  }
};

// Keep device awake during playback - ultra-aggressive approach
export const keepDeviceAwake = () => {
  if (isAndroidWebView() && window.AndroidInterface?.keepAwake) {
    try {
      window.AndroidInterface.keepAwake();
      console.log('Requested device to stay awake during playback');
      
      // Re-request wake lock ultra frequently to ensure it stays active
      const wakeInterval = setInterval(() => {
        try {
          if (window.AndroidInterface?.keepAwake) {
            window.AndroidInterface.keepAwake();
            console.log('Wake lock refreshed');
          } else {
            clearInterval(wakeInterval);
          }
        } catch (e) {
          console.error('Error refreshing wake lock:', e);
          clearInterval(wakeInterval);
        }
      }, 10000); // Refresh every 10 seconds
      
      // Additional aggressive wake lock requests
      [500, 1000, 5000, 15000].forEach(time => {
        setTimeout(() => {
          try {
            if (window.AndroidInterface?.keepAwake) {
              window.AndroidInterface.keepAwake();
              console.log(`Additional wake lock at ${time}ms`);
            }
          } catch (e) {
            console.error(`Error in delayed wake lock request (${time}ms):`, e);
          }
        }, time);
      });
      
      return wakeInterval;
    } catch (e) {
      console.error('Error keeping device awake:', e);
      // Retry wake lock request
      setTimeout(() => {
        try {
          if (window.AndroidInterface?.keepAwake) {
            window.AndroidInterface.keepAwake();
          }
        } catch (innerError) {
          console.error('Retry error:', innerError);
        }
      }, 1000);
    }
  }
  return null;
};

// Allow device to sleep
export const allowDeviceSleep = () => {
  if (isAndroidWebView() && window.AndroidInterface?.allowSleep) {
    try {
      window.AndroidInterface.allowSleep();
      console.log('Allowing device to sleep');
    } catch (e) {
      console.error('Error allowing device sleep:', e);
    }
  }
};
