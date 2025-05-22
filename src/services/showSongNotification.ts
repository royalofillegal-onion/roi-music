
import { isAndroidWebView, showAndroidNotification } from './androidNotification';
import { showNotification, isMobileDevice } from './NotificationService';
import { showOneSignalSongNotification } from './OneSignalService';

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying?: boolean
): Notification | null => {
  // For Android WebView, use native notifications with super aggressive background playback
  if (isAndroidWebView()) {
    console.log('Using Android native notification for playback:', isPlaying ? 'playing' : 'paused');
    
    // Use multiple immediate timeouts to ensure this runs even if the JS thread is blocked
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 0);
    
    // Make a second attempt for better reliability
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 300);
    
    // Make a third attempt after a longer delay
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 1000);
    
    return null;
  }

  // For OneSignal if available
  if (typeof window !== 'undefined' && typeof window.OneSignal !== 'undefined') {
    console.log('Using OneSignal notification for playback control');
    showOneSignalSongNotification(title, artist, imageUrl, isPlaying);
    return null;
  }

  // Fall back to web notification with improved visibility
  return showNotification(`Now Playing: ${title}`, {
    body: `By ${artist}`,
    icon: imageUrl,
    silent: false,
    tag: 'now-playing',
    requireInteraction: true,
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined
  });
};
