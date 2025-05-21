
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

// Call Android native to show notification
export const showAndroidNotification = (title: string, body?: string, imageUrl?: string, isPlaying?: boolean) => {
  if (isAndroidWebView()) {
    try {
      // First ensure background playback is enabled with more aggressive approach
      initContinuousPlayback();
      requestBackgroundPlayback();
      
      // Start foreground service to ensure playback continues
      startForegroundService();
      
      // Pass image URL and playing state to Android for rich notifications
      window.AndroidInterface?.showNotification(
        title, 
        body || '', 
        imageUrl || '',
        isPlaying === true ? 1 : 0
      );
      console.log('Android native notification sent with media info', { title, isPlaying });
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
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

// Update notification playback state (play/pause) without recreating notification
export const updateAndroidPlaybackState = (isPlaying: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Always ensure continuous playback is initialized
      initContinuousPlayback();
      
      // Always request background playback regardless of playing state
      // to ensure continuous playback capability
      requestBackgroundPlayback();
      
      // Start foreground service if playing
      if (isPlaying) {
        startForegroundService();
        keepDeviceAwake();
      }
      
      window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
      console.log('Android playback state updated:', isPlaying);
    } catch (e) {
      console.error('Error updating Android playback state:', e);
    }
  }
};

// Initialize continuous playback service
export const initContinuousPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.initContinuousPlayback) {
    try {
      window.AndroidInterface.initContinuousPlayback();
      console.log('Continuous playback initialized');
      
      // Additional redundant call to ensure it's properly initialized
      setTimeout(() => {
        if (window.AndroidInterface?.initContinuousPlayback) {
          window.AndroidInterface.initContinuousPlayback();
        }
      }, 500);
    } catch (e) {
      console.error('Error initializing continuous playback:', e);
    }
  }
};

// Start foreground service for persistent playback
export const startForegroundService = () => {
  if (isAndroidWebView() && window.AndroidInterface?.startForegroundService) {
    try {
      window.AndroidInterface.startForegroundService();
      console.log('Foreground service started');
    } catch (e) {
      console.error('Error starting foreground service:', e);
    }
  }
};

// Notify Android that a song has completed (for background handling)
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      // Always ensure background playback is enabled for continuous playback
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
      
      window.AndroidInterface?.onSongCompleted();
      console.log('Android notified of song completion');
    } catch (e) {
      console.error('Error notifying song completion:', e);
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

// Request background playback permission with even more aggressive approach
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.requestBackgroundPlayback();
      console.log('Background playback requested from Android');
      
      // Force multiple requests with different timing to ensure it's registered
      const requestTimes = [100, 500, 1500, 5000];
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

// Keep device awake during playback - more aggressive approach
export const keepDeviceAwake = () => {
  if (isAndroidWebView() && window.AndroidInterface?.keepAwake) {
    try {
      window.AndroidInterface.keepAwake();
      console.log('Requested device to stay awake during playback');
      
      // Re-request wake lock very frequently to ensure it stays active
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
      }, 15000); // Refresh every 15 seconds
      
      return wakeInterval;
    } catch (e) {
      console.error('Error keeping device awake:', e);
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
