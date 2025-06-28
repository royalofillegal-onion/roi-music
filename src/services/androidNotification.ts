// Detect if running inside Android WebView with native interface
export const isAndroidWebView = (): boolean => {
  return /Android/i.test(navigator.userAgent) && typeof (window as any).AndroidInterface !== 'undefined';
};

// Call Android native to show notification with more reliable handling
export const showAndroidNotification = (title: string, body?: string) => {
  if (isAndroidWebView()) {
    try {
      console.log('Showing Android native notification:', title, body || '');
      (window as any).AndroidInterface.showNotification(title, body || '');
      return true;
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
      return false;
    }
  }
  return false;
};

// Call Android native to cancel notification
export const cancelAndroidNotification = () => {
  if (isAndroidWebView()) {
    try {
      (window as any).AndroidInterface.cancelNotification();
      console.log('Android native notification canceled');
      return true;
    } catch (e) {
      console.error('Error calling AndroidInterface:', e);
      return false;
    }
  }
  return false;
};

// Special method to signal Android that audio should continue in background
// Enhanced with forced audio continuation
export const signalContinuousPlayback = () => {
  if (isAndroidWebView()) {
    try {
      console.log('Signaling continuous playback to Android');
      if (typeof (window as any).AndroidInterface.signalContinuousPlayback !== 'undefined') {
        (window as any).AndroidInterface.signalContinuousPlayback();
        
        // Also use the foreground service API if available (added in newer APK versions)
        if (typeof (window as any).AndroidInterface.startForegroundAudioService !== 'undefined') {
          (window as any).AndroidInterface.startForegroundAudioService();
          console.log('Started foreground audio service for reliable playback');
        }
        
        return true;
      } else {
        // Fallback if the method doesn't exist
        (window as any).AndroidInterface.showNotification("Continuing playback", "Music continues in background");
        return true;
      }
    } catch (e) {
      console.error('Error signaling continuous playback to Android:', e);
      return false;
    }
  }
  return false;
};

// Pre-buffer next song notification - helps with smoother transitions
export const preBufferNextSong = (title: string, artist: string, songId?: string, imageUrl?: string) => {
  if (isAndroidWebView()) {
    try {
      if (typeof (window as any).AndroidInterface.preBufferNextSong !== 'undefined') {
        console.log('Pre-buffering next song information for Android');
        (window as any).AndroidInterface.preBufferNextSong(title, artist, songId || '', imageUrl || '');
        
        // If we have the enhanced APK with auto-transition support
        if (typeof (window as any).AndroidInterface.prepareNextSongTransition !== 'undefined') {
          (window as any).AndroidInterface.prepareNextSongTransition(title, artist, songId || '', imageUrl || '');
          console.log('Prepared next song transition with enhanced APK support');
        }
        
        return true;
      }
    } catch (e) {
      console.error('Error pre-buffering next song for Android:', e);
    }
  }
  return false;
};

// Signal to Android service that a background task (audio) is active
// Enhanced with auto-continuation feature
export const signalBackgroundAudioActive = (currentTime?: number, duration?: number) => {
  if (isAndroidWebView()) {
    try {
      if (typeof (window as any).AndroidInterface.signalBackgroundAudioActive !== 'undefined') {
        console.log('Signaling background audio active to Android');
        (window as any).AndroidInterface.signalBackgroundAudioActive();
        
        // If we have current playback position, send it too (for enhanced APKs)
        if (typeof (window as any).AndroidInterface.updatePlaybackPosition !== 'undefined' && 
            currentTime !== undefined && duration !== undefined) {
          (window as any).AndroidInterface.updatePlaybackPosition(currentTime, duration);
        }
        
        return true;
      } else if (typeof (window as any).AndroidInterface.startForegroundService !== 'undefined') {
        // Alternative API available in some APKs
        (window as any).AndroidInterface.startForegroundService("music_playback");
        return true;
      } else {
        // Fallback to more basic notification
        (window as any).AndroidInterface.showNotification("Background Playback", "Music continues when app is closed");
        return true;
      }
    } catch (e) {
      console.error('Error signaling background audio to Android:', e);
      return false;
    }
  }
  return false;
};

// Wake lock for keeping CPU active during playback
export const acquireWakeLock = () => {
  if (isAndroidWebView()) {
    try {
      if (typeof (window as any).AndroidInterface.acquireWakeLock !== 'undefined') {
        console.log('Acquiring wake lock for continuous playback');
        (window as any).AndroidInterface.acquireWakeLock();
        
        // Also try to get a partial wake lock if available (keeps CPU running)
        if (typeof (window as any).AndroidInterface.acquirePartialWakeLock !== 'undefined') {
          (window as any).AndroidInterface.acquirePartialWakeLock();
          console.log('Acquired partial wake lock for CPU');
        }
        
        return true;
      }
    } catch (e) {
      console.error('Error acquiring wake lock:', e);
    }
  }
  
  // Fallback for browsers that support Wake Lock API
  if ('wakeLock' in navigator) {
    try {
      (navigator as any).wakeLock.request('screen').then((lock: any) => {
        console.log('Wake lock acquired via Web API');
      }).catch((err: any) => {
        console.error('Web Wake lock error:', err);
      });
      return true;
    } catch (e) {
      console.error('Error with Web Wake Lock API:', e);
    }
  }
  
  return false;
};

// Check if device supports continuous playback
export const checkContinuousPlaybackSupport = (): boolean => {
  if (isAndroidWebView()) {
    try {
      if (typeof (window as any).AndroidInterface.supportsContinuousPlayback !== 'undefined') {
        return (window as any).AndroidInterface.supportsContinuousPlayback();
      }
      
      // Check for enhanced APK capabilities
      if (typeof (window as any).AndroidInterface.getApiVersion !== 'undefined') {
        const apiVersion = (window as any).AndroidInterface.getApiVersion();
        return apiVersion >= 2; // Version 2+ supports better background playback
      }
    } catch (e) {
      console.error('Error checking continuous playback support:', e);
    }
  }
  // Default to assuming support
  return true;
};

// Force next song to play - helps with stuck playback
export const forceNextSongPlayback = (songId?: string, title?: string, artist?: string) => {
  if (isAndroidWebView()) {
    try {
      // Try different APK methods based on availability
      if (typeof (window as any).AndroidInterface.forceNextSong !== 'undefined') {
        console.log('Forcing next song via Android Interface');
        (window as any).AndroidInterface.forceNextSong(songId || '', title || '', artist || '');
        return true;
      } else if (typeof (window as any).AndroidInterface.triggerNextSong !== 'undefined') {
        (window as any).AndroidInterface.triggerNextSong();
        return true;
      } else {
        // Basic notification as fallback
        (window as any).AndroidInterface.showNotification(title || 'Next Song', artist || 'Playing next track');
        return true;
      }
    } catch (e) {
      console.error('Error forcing next song playback:', e);
      return false;
    }
  }
  return false;
};

// Register the current song with Android's media session API (if available)
export const registerMediaSession = (song: {
  title: string;
  artist: string;
  imageUrl?: string;
  duration?: number;
  id?: string;
}) => {
  if (isAndroidWebView()) {
    try {
      if (typeof (window as any).AndroidInterface.updateMediaSession !== 'undefined') {
        console.log('Updating Android media session');
        (window as any).AndroidInterface.updateMediaSession(
          song.title,
          song.artist,
          song.imageUrl || '',
          song.duration || 0,
          song.id || ''
        );
        return true;
      }
    } catch (e) {
      console.error('Error updating Android media session:', e);
    }
  }
  
  // Fallback using Web Media Session API
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        artwork: song.imageUrl ? [{ src: song.imageUrl }] : []
      });
      return true;
    } catch (e) {
      console.error('Error with Web Media Session API:', e);
    }
  }
  
  return false;
};

// Update audio focus to stay in foreground
export const requestAudioFocus = () => {
  if (isAndroidWebView()) {
    try {
      if (typeof (window as any).AndroidInterface.requestAudioFocus !== 'undefined') {
        console.log('Requesting audio focus');
        (window as any).AndroidInterface.requestAudioFocus();
        return true;
      }
    } catch (e) {
      console.error('Error requesting audio focus:', e);
    }
  }
  return false;
};

// Send message to service worker to update audio state
export const updateServiceWorkerAudioState = (state: any) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'AUDIO_STATE_UPDATE',
      state
    });
    return true;
  }
  return false;
};

// Enhanced method to enable continuous playback without user gesture
export const enableContinuousPlayback = () => {
  if (isAndroidWebView()) {
    try {
      // Signal to Android WebView to disable media playback user gesture requirement
      if (typeof (window as any).AndroidInterface.setMediaPlaybackRequiresUserGesture !== 'undefined') {
        console.log('Disabling media playback user gesture requirement');
        (window as any).AndroidInterface.setMediaPlaybackRequiresUserGesture(false);
        
        // Also enable auto-advance for playlist continuation
        if (typeof (window as any).AndroidInterface.enableAutoAdvance !== 'undefined') {
          (window as any).AndroidInterface.enableAutoAdvance(true);
          console.log('Auto-advance enabled for continuous playback');
        }
        
        return true;
      } else {
        // Fallback: use the generic continuous playback signal
        return signalContinuousPlayback();
      }
    } catch (e) {
      console.error('Error enabling continuous playback:', e);
      return false;
    }
  }
  
  // For web browsers, try to enable autoplay policy bypass
  if ('navigator' in window && 'mediaSession' in navigator) {
    try {
      // Set media session to indicate continuous playback intent
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('Media session: next track requested');
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('Media session: previous track requested');
      });
      
      return true;
    } catch (e) {
      console.error('Error setting up media session:', e);
    }
  }
  
  return false;
};
