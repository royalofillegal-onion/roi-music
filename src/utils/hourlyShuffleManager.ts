import { Song } from '@/data/songs';

export interface ShuffledSection {
  id: string;
  title: string;
  songs: Song[];
  priority: number;
  lastShuffled: number;
}

// Enhanced section shuffling with hourly rotation
export class HourlyShuffleManager {
  private static instance: HourlyShuffleManager;
  private shuffleHistory: Map<string, number> = new Map();
  
  static getInstance(): HourlyShuffleManager {
    if (!HourlyShuffleManager.instance) {
      HourlyShuffleManager.instance = new HourlyShuffleManager();
    }
    return HourlyShuffleManager.instance;
  }

  // Get current hour as timestamp for deterministic shuffling
  getCurrentHourTimestamp(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
  }

  // Check if section needs reshuffling (every hour)
  needsReshuffle(sectionId: string): boolean {
    const currentHour = this.getCurrentHourTimestamp();
    const lastShuffle = this.shuffleHistory.get(sectionId) || 0;
    return currentHour !== lastShuffle;
  }

  // Shuffle array with hour-based seed for consistency
  shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    
    // Create deterministic random using hour seed
    const random = (max: number) => {
      seed = (seed * 9301 + 49297) % 233280;
      return Math.floor((seed / 233280) * max);
    };

    while (currentIndex > 0) {
      const randomIndex = random(currentIndex);
      currentIndex--;
      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  }

  // Get shuffled sections based on current hour
  getShuffledSections(sections: ShuffledSection[]): ShuffledSection[] {
    const currentHour = this.getCurrentHourTimestamp();
    
    const shuffledSections = sections.map(section => {
      if (this.needsReshuffle(section.id)) {
        const shuffledSongs = this.shuffleWithSeed(section.songs, currentHour + section.priority);
        this.shuffleHistory.set(section.id, currentHour);
        
        return {
          ...section,
          songs: shuffledSongs,
          lastShuffled: currentHour
        };
      }
      return section;
    });

    // Also shuffle the order of sections themselves
    return this.shuffleWithSeed(shuffledSections, currentHour);
  }

  // Get time-based section priorities (changes throughout the day)
  getTimePriority(): { [key: string]: number } {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      // Morning: Energetic, motivational
      return {
        'trending': 1,
        'massRap': 2,
        'dance': 3,
        'popular': 4,
        'newReleases': 5,
        'hindi': 6,
        'romantic': 7,
        'devotional': 8
      };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon: Popular, mainstream
      return {
        'popular': 1,
        'trending': 2,
        'hindi': 3,
        'newReleases': 4,
        'massRap': 5,
        'dance': 6,
        'romantic': 7,
        'devotional': 8
      };
    } else if (hour >= 17 && hour < 22) {
      // Evening: Relaxing, romantic
      return {
        'romantic': 1,
        'popular': 2,
        'hindi': 3,
        'trending': 4,
        'newReleases': 5,
        'dance': 6,
        'massRap': 7,
        'devotional': 8
      };
    } else {
      // Night: Chill, devotional
      return {
        'devotional': 1,
        'romantic': 2,
        'hindi': 3,
        'popular': 4,
        'trending': 5,
        'newReleases': 6,
        'dance': 7,
        'massRap': 8
      };
    }
  }
}

// Export singleton instance
export const shuffleManager = HourlyShuffleManager.getInstance();