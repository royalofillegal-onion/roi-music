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
    
    // Immediate first notification to ensure quick response
    showAndroidNotification(title, artist, imageUrl, isPlaying);
    
    // Use multiple immediate timeouts for maximum reliability with different timing
    // Each with slightly different timing to maximize chances of success
    const delays = [10, 50, 200, 600, 1500, 5000];
    delays.forEach(delay => {
      setTimeout(() => {
        showAndroidNotification(title, artist, imageUrl, isPlaying);
      }, delay);
    });
    
    // Set up recurring notification updates to ensure service stays active
    // This is crucial for keeping playback alive in the background
    if (isPlaying) {
      const intervalId = setInterval(() => {
        console.log("Refreshing notification to maintain playback");
        showAndroidNotification(title, artist, imageUrl, true);
      }, 25000); // Every 25 seconds
      
      // Clear interval after 6 hours to prevent memory leaks
      setTimeout(() => clearInterval(intervalId), 6 * 60 * 60 * 1000);
    }
    
    // Add extra continuous playback support even after notification
    setTimeout(() => {
      if (isPlaying) {
        // Send extra signal to ensure continuous playback
        const playEvent = new CustomEvent('media-control', { 
          detail: { action: 'ensure_continuous_playback' } 
        });
        document.dispatchEvent(playEvent);
        
        // Also dispatch a playback restart event
        const restartEvent = new CustomEvent('app-background-restart', {});
        document.dispatchEvent(restartEvent);
      }
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
