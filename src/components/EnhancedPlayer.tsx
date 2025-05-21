import React, { useEffect, useState, useRef } from 'react';
import Player from './Player';
import { usePlayer } from '@/context/PlayerContext';
import { updateAndroidPlaybackState, requestBackgroundPlayback, getBackgroundPlaybackEnabled, keepDeviceAwake } from '@/services/androidNotification';
import { toast } from "sonner";

interface EnhancedPlayerProps {
  isPlaying?: boolean;
}

const EnhancedPlayer = ({ isPlaying: initialPlayState }: EnhancedPlayerProps) => {
  const { isPlaying, togglePlayPause, setVolume, currentSong } = usePlayer();
  const [backgroundPlaybackConfirmed, setBackgroundPlaybackConfirmed] = useState(false);
  const backgroundPlaybackRequested = useRef(false);
  const wakeLockRequested = useRef(false);

  // Request background playback permission when component mounts or when playback starts
  useEffect(() => {
    // Request Android background playback permission immediately and when playback starts
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      if (!backgroundPlaybackRequested.current) {
        requestBackgroundPlayback();
        console.log('Background playback requested from Android on mount');
        backgroundPlaybackRequested.current = true;
        
        // Keep device awake if playing to ensure continuous playback
        if (isPlaying) {
          keepDeviceAwake();
          wakeLockRequested.current = true;
        }
        
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
            
            // Try requesting again after a moment if it failed
            setTimeout(() => {
              requestBackgroundPlayback();
              console.log('Retrying background playback request');
            }, 2000);
          }
        }, 1000);
      }
    }
  }, []);

  // Request background playback again when playback state changes to ensure it's maintained
  useEffect(() => {
    if (isPlaying && typeof window !== 'undefined' && window.AndroidInterface) {
      // Re-request background playback when playing starts/resumes
      requestBackgroundPlayback();
      console.log('Background playback re-requested due to playback starting');
      
      // Keep device awake when playing
      if (!wakeLockRequested.current) {
        keepDeviceAwake();
        wakeLockRequested.current = true;
      }
    }
  }, [isPlaying]);

  // Listen for media control events from Android
  useEffect(() => {
    const handleMediaControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action) {
        console.log('Received media control:', customEvent.detail.action);
        
        // Re-request background playback when receiving media controls
        // to ensure continuous playback
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          requestBackgroundPlayback();
        }
        
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

    // Auto-request background playback periodically to ensure it stays enabled
    const backgroundPlaybackInterval = setInterval(() => {
      if (isPlaying && typeof window !== 'undefined' && window.AndroidInterface) {
        requestBackgroundPlayback();
        console.log('Periodic background playback check');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      document.removeEventListener('android-media-control', handleMediaControl);
      document.removeEventListener('media-control', handleMediaControl);
      clearInterval(backgroundPlaybackInterval);
    };
  }, [isPlaying, togglePlayPause, setVolume]);

  // Update Android notification when play state changes
  useEffect(() => {
    if (currentSong) {
      updateAndroidPlaybackState(isPlaying);
      
      // Re-request background playback when song changes
      if (typeof window !== 'undefined' && window.AndroidInterface) {
        requestBackgroundPlayback();
      }
    }
  }, [isPlaying, currentSong]);

  // Handle app visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying) {
        // App going to background while playing - ensure background playback
        if (typeof window !== 'undefined' && window.AndroidInterface) {
          requestBackgroundPlayback();
          console.log('Background playback re-requested when app hidden');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Restore initial play state if provided and different from current
  useEffect(() => {
    if (initialPlayState !== undefined && initialPlayState !== isPlaying) {
      console.log('Syncing play state with parent component:', initialPlayState);
    }
  }, [initialPlayState, isPlaying]);

  return <Player />;
};

export default EnhancedPlayer;
