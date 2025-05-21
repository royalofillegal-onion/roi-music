
import { isAndroidWebView, showAndroidNotification, isOneSignalAvailable } from './androidNotification';
import { showNotification, isMobileDevice } from './NotificationService';
import { showOneSignalSongNotification } from './OneSignalService';

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying?: boolean
): Notification | null => {
  // Try OneSignal first if available - critical for persistent playback
  if (isOneSignalAvailable()) {
    console.log('Using OneSignal notification for robust playback control');
    showOneSignalSongNotification(title, artist, imageUrl, isPlaying);
    return null;
  }
  
  // Fall back to Android native notification with enhanced controls
  if (isAndroidWebView()) {
    // Ensure we always show proper play/pause state in notification
    console.log('Using Android native notification with playback state:', isPlaying);
    
    // Use Android native notification with rich media info
    showAndroidNotification(title, artist, imageUrl, isPlaying);
    
    // Make additional call to ensure play state is correctly registered
    setTimeout(() => {
      if (typeof isPlaying === 'boolean') {
        console.log('Reinforcing Android notification state:', isPlaying);
        showAndroidNotification(title, artist, imageUrl, isPlaying);
      }
    }, 500);
    
    return null; // We can't return a Notification object from Android native
  }

  // Fall back to web notification with enhanced visibility
  return showNotification(`Now Playing: ${title}`, {
    body: `By ${artist}`,
    icon: imageUrl,
    silent: false, // Always play a sound for better visibility
    tag: 'now-playing',
    requireInteraction: true, // Always require interaction for better visibility
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined
  });
};
