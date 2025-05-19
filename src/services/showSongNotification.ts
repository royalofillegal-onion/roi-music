
import { isAndroidWebView, showAndroidNotification, isOneSignalAvailable } from './androidNotification';
import { showNotification, isMobileDevice } from './NotificationService';
import { showOneSignalSongNotification } from './OneSignalService';

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying?: boolean
): Notification | null => {
  // Try OneSignal first if available
  if (isOneSignalAvailable()) {
    showOneSignalSongNotification(title, artist, imageUrl, isPlaying);
    return null;
  }
  
  // Fall back to Android native notification
  if (isAndroidWebView()) {
    // Use Android native notification with rich media info
    showAndroidNotification(title, artist, imageUrl, isPlaying);
    return null; // We can't return a Notification object from Android native
  }

  // Fall back to web notification
  return showNotification(title, {
    body: artist,
    icon: imageUrl,
    silent: !isMobileDevice(),
    tag: 'now-playing',
    requireInteraction: isMobileDevice(),
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined,
  });
};
