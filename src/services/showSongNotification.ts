
import { isAndroidWebView, showAndroidNotification } from './androidNotification';
import { showNotification, isMobileDevice } from './NotificationService';
import { showOneSignalSongNotification } from './OneSignalService';

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying?: boolean
): Notification | null => {
  // For Android WebView, use native notifications
  if (isAndroidWebView()) {
    console.log('Using Android native notification for playback:', isPlaying ? 'playing' : 'paused');
    showAndroidNotification(title, artist, imageUrl, isPlaying);
    return null;
  }

  // For OneSignal if available
  if (typeof window !== 'undefined' && typeof window.OneSignal !== 'undefined') {
    console.log('Using OneSignal notification for playback control');
    showOneSignalSongNotification(title, artist, imageUrl, isPlaying);
    return null;
  }

  // Fall back to web notification
  return showNotification(`Now Playing: ${title}`, {
    body: `By ${artist}`,
    icon: imageUrl,
    silent: false,
    tag: 'now-playing',
    requireInteraction: true,
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined
  });
};
