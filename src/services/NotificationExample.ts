
import { showSongNotification } from './NotificationService';

// Example function to show how to use the notification service
export const showCurrentSongNotification = (
  title: string, 
  artist: string, 
  imageUrl?: string
): void => {
  // When song changes or playback starts, show a notification
  showSongNotification(title, artist, imageUrl);
};
