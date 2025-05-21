
import React, { useEffect } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { 
  updateAndroidPlaybackState, 
  requestBackgroundPlayback, 
  initContinuousPlayback,
  startForegroundService
} from '@/services/androidNotification';

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, currentSong } = usePlayer();

  // Initialize background playback when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      console.log('Initializing background playback');
      initContinuousPlayback();
      requestBackgroundPlayback();
      startForegroundService();
    }
  }, []);

  // Update Android notification when play state changes
  useEffect(() => {
    if (currentSong && typeof window !== 'undefined' && window.AndroidInterface) {
      updateAndroidPlaybackState(isPlaying);
    }
  }, [isPlaying, currentSong]);

  // Listen for media control events
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
            document.dispatchEvent(new CustomEvent('media-control', { 
              detail: { action: 'next' } 
            }));
            break;
          case 'previous':
            document.dispatchEvent(new CustomEvent('media-control', { 
              detail: { action: 'previous' } 
            }));
            break;
        }
      }
    };

    document.addEventListener('android-media-control', handleMediaControl);
    document.addEventListener('media-control', handleMediaControl);
    document.addEventListener('app-background-restart', () => {
      console.log('Received background restart signal');
      if (currentSong && !isPlaying) {
        togglePlayPause();
      }
    });

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      document.removeEventListener('app-background-restart', () => {});
    };
  }, [isPlaying, togglePlayPause, currentSong]);

  // Restore initial play state if provided
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      togglePlayPause();
    }
  }, [initialPlayState]);

  return <Player />;
};

export default EnhancedPlayer;
