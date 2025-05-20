
import React, { useEffect, useState } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { updateAndroidPlaybackState, requestBackgroundPlayback, getBackgroundPlaybackEnabled } from '@/services/androidNotification';
import { toast } from "sonner";

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, setVolume, currentSong } = usePlayer();
  const [backgroundPlaybackConfirmed, setBackgroundPlaybackConfirmed] = useState(false);

  // Request background playback permission when component mounts
  useEffect(() => {
    // Request Android background playback permission on mount and show confirmation
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      const backgroundEnabled = getBackgroundPlaybackEnabled();
      
      if (!backgroundEnabled || !backgroundPlaybackConfirmed) {
        requestBackgroundPlayback();
        console.log('Background playback requested from Android');
        
        // Confirm background playback was enabled and show toast notification
        setTimeout(() => {
          if (getBackgroundPlaybackEnabled()) {
            toast.success("Background playback enabled", {
              duration: 3000,
              description: "Music will continue even when app is closed"
            });
            setBackgroundPlaybackConfirmed(true);
          } else {
            toast.error("Background playback not enabled", {
              duration: 3000,
              description: "Playback may stop when app is closed"
            });
          }
        }, 1000);
      }
    }
  }, [backgroundPlaybackConfirmed]);

  // Listen for media control events from Android
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
          case 'volume-up':
            setVolume(0.75); // Increase volume
            break;
          case 'volume-down':
            setVolume(0.25); // Decrease volume
            break;
        }
      }
    };

    // Listen for both native Android events and service worker events
    document.addEventListener('android-media-control', handleMediaControl);
    document.addEventListener('media-control', handleMediaControl);

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
    };
  }, [isPlaying, togglePlayPause, setVolume]);

  // Update Android notification when play state changes
  useEffect(() => {
    if (currentSong) {
      updateAndroidPlaybackState(isPlaying);
    }
  }, [isPlaying, currentSong]);

  // Restore initial play state if provided and different from current
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      console.log('Syncing play state with parent component:', initialPlayState);
    }
  }, [initialPlayState, isPlaying]);

  return <Player />;
};

export default EnhancedPlayer;
