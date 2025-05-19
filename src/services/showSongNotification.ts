
import { isAndroidWebView, showAndroidNotification } from './androidNotification';
import { showNotification, isMobileDevice } from './NotificationService';

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying?: boolean
): Notification | null => {
  if (isAndroidWebView()) {
    // Use Android native notification with rich media info
    showAndroidNotification(title, artist, imageUrl, isPlaying);
    return null; // We can't return a Notification object from Android native
  }

  return showNotification(title, {
    body: artist,
    icon: imageUrl,
    silent: !isMobileDevice(),
    tag: 'now-playing',
    requireInteraction: isMobileDevice(),
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined,
  });
};
