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

// Show Android notification with playback controls - with enhanced background setup
export const showAndroidNotification = (title: string, body?: string, imageUrl?: string, isPlaying?: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Initialize aggressive continuous playback sequence
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
      
      // Make additional attempts for better reliability
      setTimeout(() => {
        startForegroundService();
        if (isPlaying) {
          updateAndroidPlaybackState(true);
        }
      }, 500);
      
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

// Update notification playback state with enhanced background services
export const updateAndroidPlaybackState = (isPlaying: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Always ensure foreground service is running
      startForegroundService();
      
      // Keep device awake if playing
      if (isPlaying) {
        keepDeviceAwake();
        
        // Make multiple attempts to ensure continuous playback
        initContinuousPlayback();
        requestBackgroundPlayback();
      }
      
      // Update playback state in notification
      window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
      
      // Make a second attempt after a short delay for better reliability
      setTimeout(() => {
        window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
      }, 300);
      
    } catch (e) {
      console.error('Error updating playback state:', e);
    }
  }
};

// Initialize continuous playback with multiple reliability safeguards
export const initContinuousPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.initContinuousPlayback) {
    try {
      console.log("Initializing continuous playback");
      window.AndroidInterface.initContinuousPlayback();
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
    } catch (e) {
      console.error('Error starting foreground service:', e);
    }
  }
};

// Restart playback with enhanced reliability
export const restartAndroidPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.restartPlayback) {
    try {
      console.log("Restarting playback");
      // Attempt to start foreground service first
      startForegroundService();
      // Then restart playback
      window.AndroidInterface.restartPlayback();
    } catch (e) {
      console.error('Error restarting playback:', e);
    }
  }
};

// Notify song completed with enhanced reliability
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      console.log("Song completed, notifying Android");
      // First ensure continuous playback is initialized
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
      
      // Then notify song completed
      window.AndroidInterface?.onSongCompleted();
      
      // Make a second attempt after a short delay
      setTimeout(() => {
        window.AndroidInterface?.onSongCompleted();
      }, 200);
    } catch (e) {
      console.error('Error notifying song completion:', e);
    }
  }
};

// Request background playback permission with enhanced reliability
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      console.log("Requesting background playback permission");
      window.AndroidInterface?.requestBackgroundPlayback();
      
      // Make a second attempt after a short delay
      setTimeout(() => {
        window.AndroidInterface?.requestBackgroundPlayback();
      }, 300);
      
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
      console.log("Keeping device awake for playback");
      window.AndroidInterface.keepAwake();
      
      // Make a second attempt after a short delay
      setTimeout(() => {
        window.AndroidInterface?.keepAwake();
      }, 300);
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
