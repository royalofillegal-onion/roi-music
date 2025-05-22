
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayer } from '@/context/PlayerContext';
import { updateAndroidPlaybackState } from '@/services/androidNotification';

export const PlayerControls = () => {
  const { isPlaying, togglePlayPause, nextSong, previousSong } = usePlayer();

  useEffect(() => {
    // Ensure the play state is properly synchronized with Android notifications
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      updateAndroidPlaybackState(isPlaying);
      
      // Make an additional attempt after a delay for better reliability
      setTimeout(() => {
        updateAndroidPlaybackState(isPlaying);
      }, 300);
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    togglePlayPause();
    
    // Update Android notification with new play state
    if (typeof window !== 'undefined' && window.AndroidInterface) {
      updateAndroidPlaybackState(!isPlaying);
      
      // Make an additional attempt after a delay for better reliability
      setTimeout(() => {
        updateAndroidPlaybackState(!isPlaying);
      }, 300);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button 
        variant="playerControl" 
        size="playerIcon" 
        onClick={previousSong}
        aria-label="Previous song"
      >
        <SkipBack />
      </Button>

      <Button 
        variant={isPlaying ? "pauseButton" : "playButton"}
        size="playerIcon" 
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="visible opacity-100 z-50"
      >
        {isPlaying ? <Pause className="opacity-100" /> : <Play className="opacity-100" />}
      </Button>

      <Button 
        variant="playerControl" 
        size="playerIcon" 
        onClick={nextSong}
        aria-label="Next song"
      >
        <SkipForward />
      </Button>
      
      <Volume2 className="text-white" />
    </div>
  );
};

export default PlayerControls;
