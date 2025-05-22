
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
      const delays = [100, 300, 800, 1500];
      delays.forEach(delay => {
        setTimeout(() => {
          initContinuousPlayback();
          startForegroundService();
          if (isPlaying) {
            keepDeviceAwake();
            updateAndroidPlaybackState(true);
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
      const delays = [100, 300, 800, 1500, 3000];
      delays.forEach(delay => {
        setTimeout(() => {
          window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
          if (isPlaying) {
            initContinuousPlayback();
            requestBackgroundPlayback();
            startForegroundService();
            keepDeviceAwake();
          }
        }, delay);
      });
    } catch (e) {
      console.error('Error updating playback state:', e);
      
      // Attempt recovery
      try {
        if (isPlaying) {
          startForegroundService();
          initContinuousPlayback();
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

// Restart playback with enhanced reliability
export const restartAndroidPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.restartPlayback) {
    try {
      console.log("🔄 RESTARTING ANDROID PLAYBACK");
      
      // First ensure full initialization
      startForegroundService();
      initContinuousPlayback();
      requestBackgroundPlayback();
      keepDeviceAwake();
      
      // Then restart playback with multiple attempts
      window.AndroidInterface.restartPlayback();
      
      // Make multiple attempts with delays
      const delays = [200, 500, 1000, 2000];
      delays.forEach(delay => {
        setTimeout(() => {
          startForegroundService();
          window.AndroidInterface?.restartPlayback();
          keepDeviceAwake();
        }, delay);
      });
      
      // Also send a broadcast event to notify MainActivity
      setTimeout(() => {
        const restartIntent = new CustomEvent('android-media-control', { 
          detail: { action: 'restart_playback' } 
        });
        document.dispatchEvent(restartIntent);
      }, 300);
    } catch (e) {
      console.error('Error restarting playback:', e);
    }
  }
};

// Notify song completed with super aggressive reliability
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      console.log("🎵 SONG COMPLETED - NOTIFYING ANDROID");
      
      // First ensure continuous playback is initialized
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
      keepDeviceAwake();
      
      // Then notify song completed with multiple attempts
      window.AndroidInterface?.onSongCompleted();
      
      // Make multiple attempts with increasing delays
      const delays = [100, 300, 800, 1500];
      delays.forEach(delay => {
        setTimeout(() => {
          initContinuousPlayback();
          window.AndroidInterface?.onSongCompleted();
          startForegroundService();
        }, delay);
      });
      
      // Also broadcast events to ensure next song plays
      const nextIntent = new CustomEvent('android-media-control', { 
        detail: { action: 'next' } 
      });
      document.dispatchEvent(nextIntent);
      
      // Send additional event with delay to improve reliability
      setTimeout(() => {
        const nextIntent2 = new CustomEvent('media-control', { 
          detail: { action: 'next' } 
        });
        document.dispatchEvent(nextIntent2);
      }, 500);
      
      // Force restart playback after song completed for better continuity
      setTimeout(() => {
        restartAndroidPlayback();
      }, 800);
      
      // Send app restart event as backup
      setTimeout(() => {
        const appRestartIntent = new CustomEvent('app-background-restart', {});
        document.dispatchEvent(appRestartIntent);
      }, 1200);
    } catch (e) {
      console.error('Error notifying song completion:', e);
      
      // Recovery attempt
      try {
        // Try basic next song event
        const nextIntent = new CustomEvent('media-control', { 
          detail: { action: 'next' } 
        });
        document.dispatchEvent(nextIntent);
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
