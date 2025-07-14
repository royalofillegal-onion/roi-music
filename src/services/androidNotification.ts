
// Android-specific notification and media session handling

export interface MediaSessionData {
  title: string;
  artist: string;
  imageUrl?: string;
  duration?: number; // Changed from string to number
  id: string;
}

export const showAndroidNotification = (title: string, message: string) => {
  try {
    // For Android WebView or PWA
    if ('Android' in window) {
      // @ts-ignore - Android interface
      window.Android.showNotification(title, message);
    } else if ('webkit' in window && 'messageHandlers' in (window as any).webkit) {
      // For iOS WebView
      // @ts-ignore - WebKit interface
      window.webkit.messageHandlers.notification.postMessage({
        title,
        message
      });
    } else {
      // Fallback to web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon-192.png'
        });
      }
    }
    
    console.log('Android notification:', title, message);
  } catch (error) {
    console.log('Android notification failed:', error);
  }
};

export const signalContinuousPlayback = () => {
  try {
    if ('Android' in window) {
      // @ts-ignore - Android interface
      window.Android.enableContinuousPlayback();
    }
    
    console.log('Continuous playback signaled');
  } catch (error) {
    console.log('Continuous playback signal failed:', error);
  }
};

export const enableContinuousPlayback = () => {
  try {
    // Signal to Android that we want continuous playback
    if ('Android' in window) {
      // @ts-ignore - Android interface
      window.Android.setContinuousPlayback(true);
    }
    
    // Set up media session for better control
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
    
    console.log('Continuous playback enabled');
  } catch (error) {
    console.log('Enable continuous playback failed:', error);
  }
};

export const registerMediaSession = (data: MediaSessionData) => {
  try {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: data.title,
        artist: data.artist,
        album: 'RoyalStar Music',
        artwork: [
          { src: data.imageUrl || '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: data.imageUrl || '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
      
      navigator.mediaSession.playbackState = 'playing';
    }
    
    // Signal to Android
    if ('Android' in window) {
      // @ts-ignore - Android interface
      window.Android.updateMediaSession(JSON.stringify({
        title: data.title,
        artist: data.artist,
        imageUrl: data.imageUrl,
        duration: data.duration,
        id: data.id
      }));
    }
    
    console.log('Media session registered:', data.title);
  } catch (error) {
    console.log('Media session registration failed:', error);
  }
};
