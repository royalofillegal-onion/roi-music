
import { 
  showAndroidNotification, 
  isAndroidWebView, 
  cancelAndroidNotification,
  signalContinuousPlayback,
  preBufferNextSong,
  checkContinuousPlaybackSupport,
  signalBackgroundAudioActive,
  acquireWakeLock,
  forceNextSongPlayback,
  registerMediaSession,
  requestAudioFocus,
  updateServiceWorkerAudioState
} from './androidNotification';

// Check if notifications are supported in this browser
export const areNotificationsSupported = (): boolean => {
  return 'Notification' in window;
};

// Check if the device is mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!areNotificationsSupported()) {
    console.log('Notifications not supported in this browser');
    return 'denied';
  }
  
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Show a notification for the current song with enhanced Android support
export const showSongNotification = (
  title: string, 
  artist: string, 
  imageUrl?: string,
  songId?: string,
  duration?: number
): void => {
  try {
    // First try Android native notification for APK with enhanced support
    if (isAndroidWebView()) {
      // Show persistent notification for the current song with app name
      showAndroidNotification(title, `${artist} - RoyalStar Music`);
      
      // Signal to Android that we need background continuous playback
      signalContinuousPlayback();
      
      // Also signal that background audio is active for when app is closed
      signalBackgroundAudioActive(undefined, duration);
      
      // Acquire wake lock to prevent CPU from sleeping during playback
      acquireWakeLock();
      
      // Register with Android's media session
      registerMediaSession({
        title,
        artist,
        imageUrl,
        duration,
        id: songId
      });
      
      // Request audio focus
      requestAudioFocus();
      
      // Update service worker about current song
      updateServiceWorkerAudioState({
        isPlaying: true,
        currentSong: {
          title,
          artist,
          imageUrl,
          id: songId,
          duration
        }
      });
      
      return;
    }
    
    // Fall back to web notification with proper app name
    if (areNotificationsSupported() && Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: `${artist} - RoyalStar Music`,
        icon: imageUrl || '/icon-192.png',
        badge: '/icon-192.png',
        silent: true, // Don't play notification sound during music playback
        tag: 'now-playing', // Replace previous notifications
        requireInteraction: isMobileDevice(),
        data: {
          title,
          artist,
          songId,
          action: 'music-control'
        }
      };
      
      const notification = new Notification(title, options);
      
      // Add click handler for notification
      notification.onclick = () => {
        // Focus the app window if it exists
        if (typeof window !== 'undefined') {
          window.focus();
        }
        notification.close();
      };
      
      // Auto close after 5 seconds
      setTimeout(() => {
        try {
          notification.close();
        } catch (e) {
          // Ignore errors when closing notification
        }
      }, 5000);
    }
  } catch (error) {
    console.error('Error showing notification:', error);
    // Continue without notification
  }
};

// Pre-notify for upcoming song to improve transitions (especially for Android)
export const preNotifyNextSong = (title: string, artist: string, imageUrl?: string, songId?: string): void => {
  try {
    if (isAndroidWebView()) {
      // Pre-buffer notification for next song to ensure smooth transition
      preBufferNextSong(title, artist, songId, imageUrl);
      
      // Also ensure continuous playback is signaled
      signalContinuousPlayback();
      
      // Signal that audio should continue in background
      signalBackgroundAudioActive();
      
      // Update service worker about next song
      updateServiceWorkerAudioState({
        nextSong: {
          title,
          artist,
          imageUrl,
          id: songId
        }
      });
    }
  } catch (error) {
    console.error('Error pre-notifying next song:', error);
    // Continue without pre-notification
  }
};

// Force next song to play - useful when stuck
export const forceNextSong = (songId?: string, title?: string, artist?: string): boolean => {
  try {
    return forceNextSongPlayback(songId, title, artist);
  } catch (error) {
    console.error('Error forcing next song:', error);
    return false;
  }
};

// Cancel any active notifications
export const cancelNotifications = (): void => {
  try {
    if (isAndroidWebView()) {
      cancelAndroidNotification();
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
    // Continue even if cancellation fails
  }
};

// Check if the device supports continuous playback
export const supportsContinuousPlayback = (): boolean => {
  try {
    return checkContinuousPlaybackSupport();
  } catch (error) {
    console.error('Error checking continuous playback support:', error);
    return false;
  }
};

// Register service worker for push notifications and background audio
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Properly check and type for background sync
      if ('sync' in registration && 
          typeof registration.sync !== 'undefined' && 
          registration.sync !== null) {
        
        // Safely check if sync.register exists and is a function
        if (typeof registration.sync === 'object' && 
            'register' in registration.sync && 
            typeof registration.sync.register === 'function') {
          try {
            // Use shorter tag names to avoid errors with tags that are too long
            await registration.sync.register('music-cont');
            console.log('Registered background sync for music continuation');
            
            // Also register for next song auto-transition with shorter name
            await registration.sync.register('next-song');
          } catch (e) {
            console.error('Error registering background sync:', e);
          }
        }
      }
      
      // Properly check and type for periodic sync
      if ('periodicSync' in registration && 
          registration.periodicSync && 
          typeof registration.periodicSync === 'object' && 
          'register' in registration.periodicSync && 
          typeof registration.periodicSync.register === 'function') {
        try {
          const status = await (navigator as any).permissions.query({
            name: 'periodic-background-sync',
          });
          
          if (status.state === 'granted') {
            await registration.periodicSync.register('audio-check', {
              minInterval: 15 * 60 * 1000, // 15 minutes
            });
            console.log('Registered periodic sync for audio playback check');
          }
        } catch (e) {
          console.error('Error registering periodic sync:', e);
        }
      }
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return undefined;
    }
  }
  return undefined;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const options = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      ),
    };
    
    return await registration.pushManager.subscribe(options);
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
};

// Helper function to convert base64 to Uint8Array for VAPID keys
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

// Initialize service worker and notification support
export const initializeNotifications = async (): Promise<void> => {
  try {
    // Register service worker first
    const registration = await registerServiceWorker();
    
    // Then check for notification permission
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted' && registration) {
      // Subscribe to push notifications
      await subscribeToPushNotifications(registration);
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

// Signal to the service worker that a song is about to end
export const signalSongEnding = (nextSong?: {
  id?: string;
  title?: string;
  artist?: string;
  imageUrl?: string;
}): void => {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Update service worker about impending song end
      navigator.serviceWorker.controller.postMessage({
        type: 'AUDIO_STATE_UPDATE',
        state: {
          songEnding: true,
          nextSong: nextSong || null
        }
      });
    }
  } catch (error) {
    console.error('Error signaling song ending:', error);
  }
};

// Signal song transition happening to help Android prepare
export const signalSongTransition = (
  fromSongId?: string, 
  toSongId?: string
): void => {
  try {
    if (isAndroidWebView()) {
      const androidInterface = (window as any).AndroidInterface;
      if (androidInterface && typeof androidInterface.onSongTransition === 'function') {
        console.log('Signaling song transition to Android');
        androidInterface.onSongTransition(fromSongId || '', toSongId || '');
      }
    }
  } catch (error) {
    console.error('Error signaling song transition:', error);
  }
};
