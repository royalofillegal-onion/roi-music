import React, { useEffect } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  requestBackgroundPlayback, 
  initContinuousPlayback,
  startForegroundService,
  keepDeviceAwake,
  restartAndroidPlayback
} from '@/services/androidNotification';

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, currentSong, nextSong } = usePlayer();

  // Initialize background playback when the component mounts with super aggressive setup
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('Initializing background playback with super aggressive setup');
      
      // Make multiple attempts for better reliability immediately
      initContinuousPlayback();
      startForegroundService();
      requestBackgroundPlayback();
      
      // First wave of attempts
      setTimeout(() => {
        initContinuousPlayback();
        startForegroundService();
        requestBackgroundPlayback();
        if (isPlaying) {
          keepDeviceAwake();
          restartAndroidPlayback(); // Force restart playback
        }
      }, 500);
      
      // Second wave of attempts
      setTimeout(() => {
        initContinuousPlayback();
        startForegroundService();
        requestBackgroundPlayback();
      }, 1500);
      
      // Third wave of attempts
      setTimeout(() => {
        startForegroundService();
        if (isPlaying && currentSong) {
          restartAndroidPlayback();
        }
      }, 3000);
      
      // Fourth wave of attempts - for longer-term reliability
      setTimeout(() => {
        startForegroundService();
        initContinuousPlayback();
        if (isPlaying) {
          keepDeviceAwake();
          restartAndroidPlayback();
        }
      }, 8000);
    }
  }, []);

  // Update Android notification when play state or song changes with improved reliability
  useEffect(() => {
    if (currentSong && typeof window !== 'undefined' && window.AndroidInterface) {
      updateAndroidPlaybackState(isPlaying);
      
      // Make an additional attempt to update state for better reliability
      setTimeout(() => {
        updateAndroidPlaybackState(isPlaying);
      }, 300);
      
      // Ensure we keep device awake when playing
      if (isPlaying) {
        keepDeviceAwake();
        
        // Make an additional attempt to keep device awake
        setTimeout(() => {
          keepDeviceAwake();
        }, 1000);
      }
    }
  }, [isPlaying, currentSong]);

  // Listen for media control events with improved handler reliability
  useEffect(() => {
    const handleMediaControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action) {
        console.log('Received media control:', customEvent.detail.action);
        
        switch (customEvent.detail.action) {
          case 'play':
            if (!isPlaying) togglePlayPause();
            break;
          case 'pause':
            if (isPlaying) togglePlayPause();
            break;
          case 'next':
            nextSong();
            break;
          case 'previous':
            document.dispatchEvent(new CustomEvent('media-control', { 
              detail: { action: 'previous' } 
            }));
            break;
          case 'check_playback':
            // Respond to Android service check
            if (isPlaying && currentSong) {
              console.log('Responding to playback check - we are playing');
              updateAndroidPlaybackState(true);
              
              // Make additional attempt to ensure the service knows we're still playing
              setTimeout(() => {
                updateAndroidPlaybackState(true);
              }, 300);
            }
            break;
        }
      }
    };

    // Listen for Android media control events with multiple event types for better reliability
    document.addEventListener('android-media-control', handleMediaControl);
    document.addEventListener('media-control', handleMediaControl);
    
    // Listen for app background restart events with enhanced recovery
    const handleBackgroundRestart = () => {
      console.log('Received background restart signal');
      if (currentSong) {
        console.log('Restarting playback after background restart');
        
        // Force services to start in foreground
        startForegroundService();
        initContinuousPlayback();
        
        if (!isPlaying) {
          // Start playback if not already playing
          togglePlayPause();
        } else {
          // Force update Android state if already playing
          updateAndroidPlaybackState(true);
          
          // Force restart playback on Android
          if (typeof window !== 'undefined' && window.AndroidInterface) {
            restartAndroidPlayback();
          }
        }
        
        // Make additional attempt after a delay
        setTimeout(() => {
          if (isPlaying) {
            updateAndroidPlaybackState(true);
          }
        }, 500);
      }
    };
    
    document.addEventListener('app-background-restart', handleBackgroundRestart);

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      document.removeEventListener('app-background-restart', handleBackgroundRestart);
    };
  }, [isPlaying, togglePlayPause, currentSong, nextSong]);

  // Restore initial play state if provided with improved reliability
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      console.log('Restoring initial play state:', initialPlayState);
      togglePlayPause();
      
      // Make an additional attempt after a delay for better reliability
      if (initialPlayState && currentSong) {
        setTimeout(() => {
          if (!isPlaying && currentSong) {
            console.log('Making additional attempt to restore play state');
            togglePlayPause();
          }
        }, 1000);
      }
    }
  }, [initialPlayState]);

  return <Player />;
};

export default EnhancedPlayer;
