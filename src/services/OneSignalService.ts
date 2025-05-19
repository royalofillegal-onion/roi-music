
import { initializeOneSignal, sendOneSignalNotification } from './androidNotification';

// OneSignal App ID
const ONE_SIGNAL_APP_ID = '6b789b89-eb87-40b6-839f-70b6e79d3a48';

/**
 * Initialize OneSignal notification service
 * @returns boolean indicating if initialization was successful
 */
export const setupOneSignal = (): boolean => {
  console.log('Setting up OneSignal with app ID:', ONE_SIGNAL_APP_ID);
  return initializeOneSignal(ONE_SIGNAL_APP_ID);
};

/**
 * Show song notification using OneSignal
 * @param title - Song title
 * @param artist - Artist name
 * @param imageUrl - Album art URL
 * @param isPlaying - Whether the song is currently playing
 * @returns boolean indicating if the notification was sent successfully
 */
export const showOneSignalSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string,
  isPlaying?: boolean
): boolean => {
  const notificationTitle = isPlaying ? 'Now Playing' : 'Paused';
  const message = `${title} by ${artist}`;
  
  return sendOneSignalNotification(notificationTitle, message, imageUrl);
};
