import { useState, useEffect, useCallback } from 'react';
import { sleepTimerService } from '@/services/SleepTimerService';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'sonner';

export function useSleepTimer() {
  const { pauseSong } = usePlayer();
  const [isActive, setIsActive] = useState(false);
  const [remaining, setRemaining] = useState('');
  const [mode, setMode] = useState<'time' | 'songs'>('time');

  useEffect(() => {
    sleepTimerService.setOnExpire(() => {
      pauseSong();
      toast.info('Sleep timer ended - playback paused', {
        icon: '😴'
      });
      setIsActive(false);
      setRemaining('');
    });

    sleepTimerService.setOnTick(() => {
      setRemaining(sleepTimerService.getFormattedRemaining());
    });

    return () => {
      sleepTimerService.setOnExpire(() => {});
      sleepTimerService.setOnTick(() => {});
    };
  }, [pauseSong]);

  const startTimer = useCallback((minutes: number) => {
    sleepTimerService.startTimer(minutes);
    setIsActive(true);
    setMode('time');
    setRemaining(sleepTimerService.getFormattedRemaining());
    toast.success(`Sleep timer set for ${minutes} minutes`, {
      icon: '⏰'
    });
  }, []);

  const startSongCounter = useCallback((songs: number) => {
    sleepTimerService.startSongCounter(songs);
    setIsActive(true);
    setMode('songs');
    setRemaining(sleepTimerService.getFormattedRemaining());
    toast.success(`Sleep timer set for ${songs} songs`, {
      icon: '🎵'
    });
  }, []);

  const stopTimer = useCallback(() => {
    sleepTimerService.stopTimer();
    setIsActive(false);
    setRemaining('');
    toast.info('Sleep timer cancelled');
  }, []);

  const extendTimer = useCallback((minutes: number) => {
    sleepTimerService.extendTimer(minutes);
    setRemaining(sleepTimerService.getFormattedRemaining());
    toast.success(`Added ${minutes} minutes to timer`);
  }, []);

  const onSongEnded = useCallback(() => {
    sleepTimerService.onSongEnded();
  }, []);

  return {
    isActive,
    remaining,
    mode,
    startTimer,
    startSongCounter,
    stopTimer,
    extendTimer,
    onSongEnded
  };
}
