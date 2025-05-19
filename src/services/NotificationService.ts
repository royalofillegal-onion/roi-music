
// Check if browser supports notifications
const notificationsSupported = 'Notification' in window;

/**
 * Check if running on mobile device
 * @returns boolean indicating if currently on mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Request notification permission
 * @returns Promise that resolves with the permission status
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!notificationsSupported) {
    console.log('Notifications not supported in this browser');
    return 'denied';
  }
  
  // For Android Capacitor apps, provide more context
  if (isMobileDevice() && /Android/i.test(navigator.userAgent)) {
    console.log('Requesting notification permission on Android');
  }
  
  return await Notification.requestPermission();
};

// Define our own notification options that includes vibration
interface CustomNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

/**
 * Show a notification
 * @param title - Title of the notification
 * @param options - Notification options
 * @returns The notification object if successful, null otherwise
 */
export const showNotification = (
  title: string, 
  options?: CustomNotificationOptions
): Notification | null => {
  if (!notificationsSupported) {
    console.log('Notifications not supported');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return null;
  }
  
  try {
    // Create a new object without vibrate property for the Notification constructor
    const { vibrate, ...standardOptions } = options || {};
    
    const notification = new Notification(title, {
      ...standardOptions,
      silent: isMobileDevice() ? false : (options?.silent || false),
      requireInteraction: isMobileDevice() ? true : (options?.requireInteraction || false),
    });
    
    // Add click handler
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    // Manually trigger vibration if supported and specified
    if (isMobileDevice() && vibrate && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(vibrate);
    }
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Show song notification
 * @param title - Song title
 * @param artist - Song artist
 * @param imageUrl - Album art URL
 */
export const showSongNotification = (
  title: string,
  artist: string,
  imageUrl?: string
): Notification | null => {
  return showNotification(`Now Playing: ${title}`, {
    body: `By ${artist}`,
    icon: imageUrl,
    silent: !isMobileDevice(),
    tag: 'now-playing',
    requireInteraction: isMobileDevice(),
    vibrate: isMobileDevice() ? [200, 100, 200] : undefined,
  });
};

// Register service worker for push notifications if supported
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    const publicVapidKey = 'BMqSoZMVPQRfnWB4v4-ZbJKSaRIJlvRWCfgVK4I7jeNZKPsYK2tA_dtXnuSDnQlaKWQqNPMnkn_rBJqBVMM9HGE';
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    
    console.log('Push notification subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Helper function to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
