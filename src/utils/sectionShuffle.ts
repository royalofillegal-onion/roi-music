
import { Song } from '@/data/songs';

// Define section configurations that shuffle every hour
export interface SectionConfig {
  id: string;
  title: string;
  getSongs: () => Song[];
  enabled: boolean;
}

// Shuffle sections every hour
export const shuffleSections = (sections: SectionConfig[]): SectionConfig[] => {
  const currentHour = new Date().getHours();
  const enabledSections = sections.filter(section => section.enabled);
  
  // Create a deterministic shuffle based on current hour
  const shuffled = [...enabledSections];
  const seed = currentHour; // Changes every hour
  
  // Fisher-Yates shuffle with seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(((seed * (i + 1)) % 1000) / 1000 * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Get current hour-based sections
export const getCurrentSections = (): SectionConfig[] => {
  const baseSections: SectionConfig[] = [
    {
      id: 'trending',
      title: 'Trending Now',
      getSongs: () => [], // Will be populated from data
      enabled: true,
    },
    {
      id: 'popular',
      title: 'Popular Songs',
      getSongs: () => [],
      enabled: true,
    },
    {
      id: 'newReleases',
      title: 'New Releases',
      getSongs: () => [],
      enabled: true,
    },
    {
      id: 'massRap',
      title: 'Mass & Rap',
      getSongs: () => [],
      enabled: true,
    },
    {
      id: 'hindi',
      title: 'Hindi Collection',
      getSongs: () => [],
      enabled: true,
    },
    {
      id: 'feelGood',
      title: 'Feel Good Vibes',
      getSongs: () => [],
      enabled: true,
    },
  ];
  
  return shuffleSections(baseSections);
};
