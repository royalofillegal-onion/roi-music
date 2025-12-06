// Crossfade and Gapless Playback Service

interface CrossfadeConfig {
  enabled: boolean;
  duration: number; // in seconds (0.5 - 12)
  type: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

class CrossfadeService {
  private config: CrossfadeConfig = {
    enabled: false,
    duration: 3,
    type: 'easeInOut'
  };
  
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  private fadeInterval: number | null = null;
  private isTransitioning = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('crossfade-config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
  }

  saveConfig(): void {
    localStorage.setItem('crossfade-config', JSON.stringify(this.config));
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  setDuration(seconds: number): void {
    this.config.duration = Math.max(0.5, Math.min(12, seconds));
    this.saveConfig();
  }

  setType(type: CrossfadeConfig['type']): void {
    this.config.type = type;
    this.saveConfig();
  }

  getConfig(): CrossfadeConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getDuration(): number {
    return this.config.duration;
  }

  // Easing functions for smooth transitions
  private ease(progress: number): number {
    switch (this.config.type) {
      case 'linear':
        return progress;
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - (1 - progress) * (1 - progress);
      case 'easeInOut':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default:
        return progress;
    }
  }

  async performCrossfade(
    currentAudio: HTMLAudioElement,
    nextAudio: HTMLAudioElement,
    onComplete: () => void
  ): Promise<void> {
    if (!this.config.enabled || this.isTransitioning) {
      onComplete();
      return;
    }

    this.isTransitioning = true;
    this.currentAudio = currentAudio;
    this.nextAudio = nextAudio;

    const durationMs = this.config.duration * 1000;
    const steps = 60; // 60 fps
    const stepDuration = durationMs / steps;
    let step = 0;

    // Start next audio at 0 volume
    nextAudio.volume = 0;
    
    try {
      await nextAudio.play();
    } catch (error) {
      console.error('Failed to start crossfade playback:', error);
      this.isTransitioning = false;
      onComplete();
      return;
    }

    const originalVolume = currentAudio.volume;

    this.fadeInterval = window.setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = this.ease(progress);

      // Fade out current
      currentAudio.volume = Math.max(0, originalVolume * (1 - easedProgress));
      
      // Fade in next
      nextAudio.volume = Math.min(originalVolume, originalVolume * easedProgress);

      if (step >= steps) {
        this.stopFade();
        currentAudio.pause();
        currentAudio.volume = originalVolume;
        nextAudio.volume = originalVolume;
        this.isTransitioning = false;
        onComplete();
      }
    }, stepDuration);
  }

  stopFade(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  shouldStartCrossfade(currentTime: number, duration: number): boolean {
    if (!this.config.enabled || !duration) return false;
    const timeRemaining = duration - currentTime;
    return timeRemaining <= this.config.duration && timeRemaining > 0;
  }

  cleanup(): void {
    this.stopFade();
    this.isTransitioning = false;
    this.currentAudio = null;
    this.nextAudio = null;
  }
}

export const crossfadeService = new CrossfadeService();
