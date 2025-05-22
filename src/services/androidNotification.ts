
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
      // Initialize super aggressive continuous playback sequence
      initContinuousPlayback();
      startForegroundService();
      requestBackgroundPlayback();
      
      // Keep device awake if playing
      if (isPlaying) {
        keepDeviceAwake();
      }
      
      // Show notification
      const playingValue = isPlaying === true ? 1 : 0;
      window.AndroidInterface?.showNotification(
        title, 
        body || '', 
        imageUrl || '',
        playingValue
      );
      
      // Also update playback state
      updateAndroidPlaybackState(isPlaying === true);
      
      // Make multiple aggressive attempts for better reliability
      setTimeout(() => {
        initContinuousPlayback();
        startForegroundService();
        if (isPlaying) {
          keepDeviceAwake();
          updateAndroidPlaybackState(true);
        }
      }, 300);
      
      setTimeout(() => {
        initContinuousPlayback();
        startForegroundService();
        if (isPlaying) {
          keepDeviceAwake();
          updateAndroidPlaybackState(true);
        }
      }, 1000);
      
    } catch (e) {
      console.error('Error showing Android notification:', e);
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
      setTimeout(() => {
        window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
        if (isPlaying) {
          initContinuousPlayback();
          requestBackgroundPlayback();
        }
      }, 200);
      
      setTimeout(() => {
        window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
        if (isPlaying) {
          initContinuousPlayback();
          startForegroundService();
        }
      }, 800);
      
    } catch (e) {
      console.error('Error updating playback state:', e);
    }
  }
};

// Initialize continuous playback with multiple reliability safeguards
export const initContinuousPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.initContinuousPlayback) {
    try {
      console.log("Initializing continuous playback with super aggressive mode");
      window.AndroidInterface.initContinuousPlayback();
      
      // Make multiple attempts for better reliability
      setTimeout(() => {
        window.AndroidInterface?.initContinuousPlayback();
      }, 300);
      
      setTimeout(() => {
        window.AndroidInterface?.initContinuousPlayback();
      }, 1500);
    } catch (e) {
      console.error('Error initializing continuous playback:', e);
    }
  }
};

// Start foreground service with enhanced reliability
export const startForegroundService = () => {
  if (isAndroidWebView() && window.AndroidInterface?.startForegroundService) {
    try {
      console.log("Starting foreground service for continuous playback");
      window.AndroidInterface.startForegroundService();
      
      // Make multiple attempts for better reliability
      setTimeout(() => {
        window.AndroidInterface?.startForegroundService();
      }, 500);
    } catch (e) {
      console.error('Error starting foreground service:', e);
    }
  }
};

// Restart playback with enhanced reliability
export const restartAndroidPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.restartPlayback) {
    try {
      console.log("Restarting playback with super aggressive mode");
      // Attempt to start foreground service first
      startForegroundService();
      
      // Initialize continuous playback
      initContinuousPlayback();
      
      // Request background playback
      requestBackgroundPlayback();
      
      // Then restart playback
      window.AndroidInterface.restartPlayback();
      
      // Make a second attempt after a short delay
      setTimeout(() => {
        startForegroundService();
        window.AndroidInterface?.restartPlayback();
      }, 500);
    } catch (e) {
      console.error('Error restarting playback:', e);
    }
  }
};

// Notify song completed with super aggressive reliability
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      console.log("Song completed, notifying Android with super aggressive mode");
      // First ensure continuous playback is initialized
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
      
      // Then notify song completed
      window.AndroidInterface?.onSongCompleted();
      
      // Make multiple attempts after delays for better reliability
      setTimeout(() => {
        initContinuousPlayback();
        window.AndroidInterface?.onSongCompleted();
      }, 200);
      
      setTimeout(() => {
        startForegroundService();
        window.AndroidInterface?.onSongCompleted();
      }, 600);
      
      // Force restart playback after song completed for better continuity
      setTimeout(() => {
        restartAndroidPlayback();
      }, 1000);
    } catch (e) {
      console.error('Error notifying song completion:', e);
    }
  }
};

// Request background playback permission with enhanced reliability
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      console.log("Requesting background playback permission with super aggressive mode");
      window.AndroidInterface?.requestBackgroundPlayback();
      
      // Make multiple attempts after delays for better reliability
      setTimeout(() => {
        window.AndroidInterface?.requestBackgroundPlayback();
      }, 300);
      
      setTimeout(() => {
        window.AndroidInterface?.requestBackgroundPlayback();
      }, 1000);
      
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
      console.log("Keeping device awake for playback with super aggressive mode");
      window.AndroidInterface.keepAwake();
      
      // Make multiple attempts for better reliability
      setTimeout(() => {
        window.AndroidInterface?.keepAwake();
      }, 300);
      
      setTimeout(() => {
        window.AndroidInterface?.keepAwake();
      }, 1500);
    } catch (e) {
      console.error('Error keeping device awake:', e);
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
