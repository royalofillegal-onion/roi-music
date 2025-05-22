
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
    
    // Use multiple immediate timeouts for maximum reliability with different timing
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 0);
    
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 100);
    
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 500);
    
    // Make additional attempts to ensure notification service stays active
    setTimeout(() => {
      showAndroidNotification(title, artist, imageUrl, isPlaying);
    }, 1500);
    
    // Add extra continuous playback support even after notification
    setTimeout(() => {
      if (isPlaying) {
        // Send extra signal to ensure continuous playback
        const playEvent = new CustomEvent('media-control', { 
          detail: { action: 'ensure_continuous_playback' } 
        });
        document.dispatchEvent(playEvent);
      }
    }, 2000);
    
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
