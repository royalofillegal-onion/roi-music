// Sleep Timer Service

type TimerCallback = () => void;

interface SleepTimerState {
  isActive: boolean;
  endTime: number | null;
  remainingMinutes: number;
  mode: 'time' | 'songs';
  songsRemaining: number;
}

class SleepTimerService {
  private state: SleepTimerState = {
    isActive: false,
    endTime: null,
    remainingMinutes: 0,
    mode: 'time',
    songsRemaining: 0
  };

  private timerId: number | null = null;
  private tickInterval: number | null = null;
  private onExpire: TimerCallback | null = null;
  private onTick: ((remaining: number) => void) | null = null;

  setOnExpire(callback: TimerCallback): void {
    this.onExpire = callback;
  }

  setOnTick(callback: (remaining: number) => void): void {
    this.onTick = callback;
  }

  startTimer(minutes: number): void {
    this.stopTimer();
    
    const endTime = Date.now() + minutes * 60 * 1000;
    
    this.state = {
      isActive: true,
      endTime,
      remainingMinutes: minutes,
      mode: 'time',
      songsRemaining: 0
    };

    // Main timer
    this.timerId = window.setTimeout(() => {
      this.expire();
    }, minutes * 60 * 1000);

    // Tick every second for UI updates
    this.tickInterval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.state.endTime! - Date.now()) / 60000));
      this.state.remainingMinutes = remaining;
      this.onTick?.(remaining);
      
      if (remaining <= 0) {
        this.expire();
      }
    }, 1000);

    console.log(`Sleep timer set for ${minutes} minutes`);
  }

  startSongCounter(songCount: number): void {
    this.stopTimer();
    
    this.state = {
      isActive: true,
      endTime: null,
      remainingMinutes: 0,
      mode: 'songs',
      songsRemaining: songCount
    };

    console.log(`Sleep timer set for ${songCount} songs`);
  }

  onSongEnded(): void {
    if (this.state.mode === 'songs' && this.state.isActive) {
      this.state.songsRemaining--;
      
      if (this.state.songsRemaining <= 0) {
        this.expire();
      } else {
        this.onTick?.(this.state.songsRemaining);
      }
    }
  }

  private expire(): void {
    console.log('Sleep timer expired');
    this.onExpire?.();
    this.stopTimer();
  }

  stopTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.state = {
      isActive: false,
      endTime: null,
      remainingMinutes: 0,
      mode: 'time',
      songsRemaining: 0
    };
  }

  extendTimer(minutes: number): void {
    if (this.state.isActive && this.state.mode === 'time' && this.state.endTime) {
      const newEndTime = this.state.endTime + minutes * 60 * 1000;
      const newRemaining = Math.ceil((newEndTime - Date.now()) / 60000);
      
      this.stopTimer();
      this.startTimer(newRemaining);
    }
  }

  getState(): SleepTimerState {
    return { ...this.state };
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  getRemainingTime(): { minutes: number; seconds: number } {
    if (!this.state.isActive || !this.state.endTime) {
      return { minutes: 0, seconds: 0 };
    }
    
    const remaining = Math.max(0, this.state.endTime - Date.now());
    return {
      minutes: Math.floor(remaining / 60000),
      seconds: Math.floor((remaining % 60000) / 1000)
    };
  }

  getFormattedRemaining(): string {
    const { minutes, seconds } = this.getRemainingTime();
    if (this.state.mode === 'songs') {
      return `${this.state.songsRemaining} song${this.state.songsRemaining !== 1 ? 's' : ''} left`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const sleepTimerService = new SleepTimerService();
