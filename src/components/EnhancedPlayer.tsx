import React, { useEffect } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  requestBackgroundPlayback, 
  initContinuousPlayback,
  startForegroundService,
  keepDeviceAwake
} from '@/services/androidNotification';

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, currentSong, nextSong } = usePlayer();

  // Initialize background playback when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('Initializing background playback with aggressive setup');
      
      // Multiple attempts for better reliability
      initContinuousPlayback();
      startForegroundService();
      requestBackgroundPlayback();
      
      // Make multiple attempts for better reliability
      setTimeout(() => {
        initContinuousPlayback();
        startForegroundService();
        requestBackgroundPlayback();
        if (isPlaying) {
          keepDeviceAwake();
        }
      }, 1000);
      
      // One more attempt after a delay
      setTimeout(() => {
        startForegroundService();
      }, 2000);
    }
  }, []);

  // Update Android notification when play state or song changes
  useEffect(() => {
    if (currentSong && typeof window !== 'undefined' && window.AndroidInterface) {
      updateAndroidPlaybackState(isPlaying);
      
      // Ensure we keep device awake when playing
      if (isPlaying) {
        keepDeviceAwake();
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
            }
            break;
        }
      }
    };

    // Listen for Android media control events
    document.addEventListener('android-media-control', handleMediaControl);
    document.addEventListener('media-control', handleMediaControl);
    
    // Listen for app background restart events
    document.addEventListener('app-background-restart', () => {
      console.log('Received background restart signal');
      if (currentSong) {
        console.log('Restarting playback after background restart');
        if (!isPlaying) {
          togglePlayPause();
        } else {
          // Force update Android state if already playing
          updateAndroidPlaybackState(true);
        }
      }
    });

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      document.removeEventListener('app-background-restart', () => {});
    };
  }, [isPlaying, togglePlayPause, currentSong, nextSong]);

  // Restore initial play state if provided
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      togglePlayPause();
    }
  }, [initialPlayState]);

  return <Player />;
};

export default EnhancedPlayer;
