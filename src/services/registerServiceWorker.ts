
// Register the service worker for PWA capabilities

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registration successful with scope: ', registration.scope);
      
      // Set up any additional PWA features here
      setupPeriodicSync(registration);
      setupOfflineFeatures();
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.log('Service workers are not supported in this browser.');
  }
};

// Request permission for background sync
const setupPeriodicSync = async (registration: ServiceWorkerRegistration) => {
  if ('periodicSync' in registration) {
    try {
      // Check for permission
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as any,
      });
      
      if (status.state === 'granted') {
        // Register periodic sync with a tag and minimum interval
        await (registration as any).periodicSync.register('audio-chk', {
          minInterval: 60 * 60 * 1000, // Once per hour
        });
        console.log('Periodic sync registered');
      }
    } catch (error) {
      console.error('Periodic sync could not be registered:', error);
    }
  }
};

// Setup offline storage and features
const setupOfflineFeatures = () => {
  // Listen to online/offline events
  window.addEventListener('online', handleOnlineStatusChange);
  window.addEventListener('offline', handleOnlineStatusChange);
  
  // Check initial status
  handleOnlineStatusChange();
};

// Handle online/offline status changes
const handleOnlineStatusChange = () => {
  const isOnline = navigator.onLine;
  
  if (isOnline) {
    console.log('Application is online');
    // Sync any data that might have been saved offline
  } else {
    console.log('Application is offline');
    // Activate offline mode features
  }
  
  // Notify service worker about connection status
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CONNECTION_STATUS',
      isOnline
    });
  }
};

// Function to check if app is installed (PWA mode)
export const isPwaInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};
