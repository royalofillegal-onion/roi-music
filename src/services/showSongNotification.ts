
import { isAndroidWebView, showAndroidNotification } from './androidNotification';
import { showNotification, isMobileDevice } from './NotificationService'; // Add this import

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string
): Notification | null => {
  if (isAndroidWebView()) {
    // Use Android native notification instead of web Notification API
    showAndroidNotification(`Now Playing: ${title}`, `By ${artist}`);
    return null; // We can't return a Notification object from Android native
  }

  return showNotification(`Now Playing: ${title}`, {
    body: `By ${artist}`,
    icon: imageUrl,
    silent: !isMobileDevice(),
    tag: 'now-playing',
    requireInteraction: isMobileDevice(),
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined,
  });
};
