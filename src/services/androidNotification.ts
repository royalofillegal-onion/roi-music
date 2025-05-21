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

// Show Android notification with playback controls
export const showAndroidNotification = (title: string, body?: string, imageUrl?: string, isPlaying?: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Initialize continuous playback service
      initContinuousPlayback();
      
      // Request background playback
      requestBackgroundPlayback();
      
      // Start foreground service
      startForegroundService();
      
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

// Update notification playback state
export const updateAndroidPlaybackState = (isPlaying: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Update foreground service if needed
      if (isPlaying) {
        startForegroundService();
        keepDeviceAwake();
      }
      
      window.AndroidInterface?.updatePlaybackState(isPlaying ? 1 : 0);
    } catch (e) {
      console.error('Error updating playback state:', e);
    }
  }
};

// Initialize continuous playback
export const initContinuousPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.initContinuousPlayback) {
    try {
      window.AndroidInterface.initContinuousPlayback();
    } catch (e) {
      console.error('Error initializing continuous playback:', e);
    }
  }
};

// Start foreground service
export const startForegroundService = () => {
  if (isAndroidWebView() && window.AndroidInterface?.startForegroundService) {
    try {
      window.AndroidInterface.startForegroundService();
    } catch (e) {
      console.error('Error starting foreground service:', e);
    }
  }
};

// Restart playback
export const restartAndroidPlayback = () => {
  if (isAndroidWebView() && window.AndroidInterface?.restartPlayback) {
    try {
      window.AndroidInterface.restartPlayback();
    } catch (e) {
      console.error('Error restarting playback:', e);
    }
  }
};

// Notify song completed
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.onSongCompleted();
      
      // Ensure continuous playback
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
    } catch (e) {
      console.error('Error notifying song completion:', e);
    }
  }
};

// Request background playback permission
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      window.AndroidInterface?.requestBackgroundPlayback();
      return true;
    } catch (e) {
      console.error('Error requesting background playback:', e);
      return false;
    }
  }
  return false;
};

// Keep device awake
export const keepDeviceAwake = () => {
  if (isAndroidWebView() && window.AndroidInterface?.keepAwake) {
    try {
      window.AndroidInterface.keepAwake();
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
