
import { isAndroidWebView, showAndroidNotification } from './androidNotification'; 
import { showNotification, isMobileDevice } from './NotificationService';

export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying: boolean = true
): Notification | null => {
  if (isAndroidWebView()) {
    // Use Android native notification with rich media info
    showAndroidNotification(
      `Now Playing: ${title}`, 
      `By ${artist}`, 
      imageUrl, 
      isPlaying
    );
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
