
// Extend Window interface for OneSignal
declare global {
  interface Window {
    OneSignal: any[] & {
      push: (callback: () => void) => void;
      init?: (options: any) => void;
      sendSelfNotification?: (title: string, message: string, url: string, icon: string, data: any) => void;
    };
  }
}

// OneSignal App ID
const ONE_SIGNAL_APP_ID = '6b789b89-eb87-40b6-839f-70b6e79d3a48';

/**
 * Initialize OneSignal notification service by making sure the script is loaded
 * @returns boolean indicating if initialization was successful
 */
export const setupOneSignal = (): boolean => {
  console.log('Setting up OneSignal with app ID:', ONE_SIGNAL_APP_ID);
  
  // Check if OneSignal is already defined
  if (typeof window !== 'undefined' && window.OneSignal) {
    try {
      window.OneSignal.push(() => {
        if (window.OneSignal.init) {
          window.OneSignal.init({
            appId: ONE_SIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
            serviceWorkerParam: { scope: '/push/' },
            serviceWorkerPath: '/OneSignalSDKWorker.js',
          });
        } else {
          console.warn('OneSignal.init is not available yet');
        }
      });
      return true;
    } catch (e) {
      console.error('Error initializing OneSignal:', e);
      return false;
    }
  } else {
    console.warn('OneSignal not loaded yet');
    return false;
  }
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
  
  // Check if OneSignal is available
  if (typeof window !== 'undefined' && window.OneSignal && window.OneSignal.sendSelfNotification) {
    try {
      // Send notification to current user
      window.OneSignal.sendSelfNotification(
        notificationTitle,
        message,
        window.location.href,
        imageUrl || '',
        { mediaUrl: imageUrl }
      );
      
      console.log('OneSignal notification sent');
      return true;
    } catch (e) {
      console.error('Error sending OneSignal notification:', e);
      return false;
    }
  }
  return false;
};

/**
 * Check if OneSignal is available
 * @returns boolean indicating if OneSignal is available
 */
export const isOneSignalAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.OneSignal !== 'undefined' && 
    typeof window.OneSignal.sendSelfNotification === 'function';
};
