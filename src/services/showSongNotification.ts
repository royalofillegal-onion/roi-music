
import { isAndroidWebView, showAndroidNotification, signalContinuousPlayback, signalBackgroundAudioActive } from './androidNotification';

// Helper function to check if on mobile
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Show notification with better Android support
export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string
): Notification | null => {
  if (isAndroidWebView()) {
    // Use Android native notification with enhanced background support
    showAndroidNotification(`Now Playing: ${title}`, `By ${artist}`);
    
    // Signal that we need continuous playback
    signalContinuousPlayback();
    
    // Also signal background audio is active
    signalBackgroundAudioActive();
    
    return null; // We can't return a Notification object from Android native
  }

  // Standard web notification for browsers
  return showNotification(`Now Playing: ${title}`, {
    body: `By ${artist}`,
    icon: imageUrl,
    silent: !isMobileDevice(),
    tag: 'now-playing',
    requireInteraction: isMobileDevice(),
    // Remove the vibrate property as it's not in the TypeScript definition
    // but can be added through a type assertion if needed in the future
  });
};

// Helper function to show web notification
const showNotification = (title: string, options?: NotificationOptions): Notification | null => {
  if (!('Notification' in window)) {
    return null; // Notifications not supported
  }
  
  if (Notification.permission === 'granted') {
    return new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        return new Notification(title, options);
      }
    });
  }
  
  return null;
};
