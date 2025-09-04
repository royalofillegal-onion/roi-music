import { Song } from '@/data/songs';
import { trendingSongs, popularSongs, newReleases } from '@/data/allSongs';
import { massRapSongs } from '@/data/massRapSongs';
import { moreSongs } from '@/data/moreSongs';
import { HindiSongs } from '@/data/HindiSongs';

export interface EnhancedSectionConfig {
  id: string;
  title: string;
  getSongs: () => Song[];
  enabled: boolean;
  priority: number;
  relatedSections: string[];
  timeWeight: number;
  description: string;
  gradient: string;
}

// Enhanced section configurations with relationships and time-based weights
const baseSections: EnhancedSectionConfig[] = [
  {
    id: 'trending',
    title: 'Trending Now',
    getSongs: () => trendingSongs.filter(Boolean),
    enabled: true,
    priority: 1,
    relatedSections: ['popular', 'newReleases'],
    timeWeight: 1.2, // Higher weight during peak hours
    description: 'What\'s hot right now',
    gradient: 'from-red-500/20 to-pink-500/20'
  },
  {
    id: 'popular',
    title: 'Popular This Week',
    getSongs: () => popularSongs.filter(Boolean),
    enabled: true,
    priority: 2,
    relatedSections: ['trending', 'massRap'],
    timeWeight: 1.0,
    description: 'Fan favorites',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'newReleases',
    title: 'Fresh Drops',
    getSongs: () => newReleases.filter(Boolean),
    enabled: true,
    priority: 3,
    relatedSections: ['trending', 'feelGood'],
    timeWeight: 1.1,
    description: 'Latest releases',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'massRap',
    title: 'Mass & Rap Bangers',
    getSongs: () => massRapSongs.filter(Boolean),
    enabled: true,
    priority: 4,
    relatedSections: ['popular', 'hindi'],
    timeWeight: 0.9,
    description: 'High energy vibes',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 'hindi',
    title: 'Bollywood Hits',
    getSongs: () => HindiSongs.filter(Boolean),
    enabled: true,
    priority: 5,
    relatedSections: ['feelGood', 'romantic'],
    timeWeight: 1.0,
    description: 'Hindi & Regional gems',
    gradient: 'from-purple-500/20 to-indigo-500/20'
  },
  {
    id: 'feelGood',
    title: 'Feel Good Vibes',
    getSongs: () => moreSongs.filter(Boolean),
    enabled: true,
    priority: 6,
    relatedSections: ['romantic', 'dance'],
    timeWeight: 0.8,
    description: 'Good mood music',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  }
];

// Time-based section weights (24-hour format)
const getTimeWeight = (hour: number): number => {
  if (hour >= 6 && hour <= 9) return 1.3; // Morning boost
  if (hour >= 17 && hour <= 22) return 1.4; // Evening peak
  if (hour >= 0 && hour <= 2) return 0.7; // Late night
  return 1.0; // Default
};

// Enhanced shuffle with time-based priorities and relationships
export const enhancedShuffleSections = (sections: EnhancedSectionConfig[]): EnhancedSectionConfig[] => {
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const timeWeight = getTimeWeight(currentHour);
  
  // Create seed based on hour and day (changes hourly but deterministic)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = (dayOfYear * 24 + currentHour) * 100 + Math.floor(currentMinute / 15); // Changes every 15 minutes
  
  const enabledSections = sections.filter(section => section.enabled);
  
  // Calculate weighted scores
  const scoredSections = enabledSections.map(section => ({
    ...section,
    score: (section.priority + section.timeWeight * timeWeight) * (1 + Math.sin(seed + section.priority) * 0.3)
  }));
  
  // Sort by score and apply some randomization
  scoredSections.sort((a, b) => b.score - a.score);
  
  // Add some controlled randomization to prevent too predictable ordering
  const shuffled = [];
  const remaining = [...scoredSections];
  
  while (remaining.length > 0) {
    const maxIndex = Math.min(2, remaining.length - 1); // Pick from top 3
    const randomIndex = Math.floor(((seed * (shuffled.length + 1)) % 1000) / 1000 * (maxIndex + 1));
    shuffled.push(remaining.splice(randomIndex, 1)[0]);
  }
  
  return shuffled;
};

// Get sections with enhanced relationships
export const getEnhancedSections = (): EnhancedSectionConfig[] => {
  return enhancedShuffleSections(baseSections);
};

// Find related sections for cross-navigation
export const getRelatedSections = (currentSectionId: string): EnhancedSectionConfig[] => {
  const currentSection = baseSections.find(s => s.id === currentSectionId);
  if (!currentSection) return [];
  
  return baseSections.filter(s => 
    currentSection.relatedSections.includes(s.id) && s.enabled
  );
};

// Get section by mood/time of day
export const getSectionsByMood = (mood: 'energetic' | 'chill' | 'romantic' | 'focus'): EnhancedSectionConfig[] => {
  const moodMap = {
    energetic: ['massRap', 'trending', 'popular'],
    chill: ['feelGood', 'hindi', 'newReleases'],
    romantic: ['hindi', 'feelGood'],
    focus: ['newReleases', 'feelGood']
  };
  
  return baseSections.filter(s => moodMap[mood].includes(s.id) && s.enabled);
};