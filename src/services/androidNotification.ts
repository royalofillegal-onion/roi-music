
// Detect if running inside Android WebView with native interface
export const isAndroidWebView = (): boolean => {
  return /Android/i.test(navigator.userAgent) && typeof (window as any).AndroidInterface !== 'undefined';
};

// Check if OneSignal is available
export const isOneSignalAvailable = (): boolean => {
  return typeof (window as any).OneSignal !== 'undefined';
};

// Call Android native to show notification
export const showAndroidNotification = (title: string, body?: string, imageUrl?: string, isPlaying?: boolean) => {
  if (isAndroidWebView()) {
    try {
      // Pass image URL and playing state to Android for rich notifications
      (window as any).AndroidInterface.showNotification(
        title, 
        body || '', 
        imageUrl || '',
        isPlaying === true ? 1 : 0
      );
      console.log('Android native notification sent with media info');
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
    }
  }
};

// Call Android native to cancel notification
export const cancelAndroidNotification = () => {
  if (isAndroidWebView()) {
    try {
      (window as any).AndroidInterface.cancelNotification();
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
      (window as any).AndroidInterface.updatePlaybackState(isPlaying ? 1 : 0);
      console.log('Android playback state updated:', isPlaying);
    } catch (e) {
      console.error('Error updating Android playback state:', e);
    }
  }
};

// Notify Android that a song has completed (for background handling)
export const notifySongCompleted = () => {
  if (isAndroidWebView()) {
    try {
      (window as any).AndroidInterface.onSongCompleted();
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
      return (window as any).AndroidInterface.isBackgroundPlaybackEnabled() === 1;
    } catch (e) {
      console.error('Error checking background playback status:', e);
    }
  }
  return true; // Default to true on non-Android platforms
};

// Request background playback permission
export const requestBackgroundPlayback = () => {
  if (isAndroidWebView()) {
    try {
      (window as any).AndroidInterface.requestBackgroundPlayback();
      console.log('Background playback requested from Android');
    } catch (e) {
      console.error('Error requesting background playback:', e);
    }
  }
};
