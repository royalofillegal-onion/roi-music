
export class VoiceGreetingService {
  private static readonly STORAGE_KEY = 'royalstar_daily_greeting';
  private static readonly VOICES_ENABLED_KEY = 'royalstar_voices_enabled';

  static hasPlayedToday(): boolean {
    const lastPlayed = localStorage.getItem(this.STORAGE_KEY);
    if (!lastPlayed) return false;
    
    const lastPlayedDate = new Date(lastPlayed).toDateString();
    const today = new Date().toDateString();
    
    return lastPlayedDate === today;
  }

  static markAsPlayedToday(): void {
    localStorage.setItem(this.STORAGE_KEY, new Date().toISOString());
  }

  static isVoicesEnabled(): boolean {
    const enabled = localStorage.getItem(this.VOICES_ENABLED_KEY);
    return enabled !== 'false'; // Default to true
  }

  static setVoicesEnabled(enabled: boolean): void {
    localStorage.setItem(this.VOICES_ENABLED_KEY, enabled.toString());
  }

  static getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good morning! Welcome to Royal Music. Enjoy unlimited music service with beautiful melodies to start your day.";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon! Welcome to Royal Music. Enjoy unlimited music service with amazing songs for your day.";
    } else if (hour >= 17 && hour < 21) {
      return "Good evening! Welcome to Royal Music. Enjoy unlimited music service with wonderful tunes for your evening.";
    } else {
      return "Good night! Welcome to Royal Music. Enjoy unlimited music service with relaxing songs for peaceful moments.";
    }
  }

  static async playGreeting(): Promise<void> {
    if (!this.isVoicesEnabled() || this.hasPlayedToday()) {
      return;
    }

    try {
      const message = this.getTimeBasedGreeting();
      await this.speakMessage(message);
      this.markAsPlayedToday();
    } catch (error) {
      console.error('Error playing voice greeting:', error);
    }
  }

  static async speakMessage(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      
      // Configure for sweet female voice
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      
      // Try to find a female voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('zira')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    });
  }
}
