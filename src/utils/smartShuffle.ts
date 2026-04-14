import { Song } from '@/data/songs';
import { fisherYatesShuffle, seededFisherYates } from '@/lib/algorithms/fisherYatesShuffle';

// Re-export for backward compatibility
export { fisherYatesShuffle as shuffle } from '@/lib/algorithms/fisherYatesShuffle';

// Time-based shuffle using seeded Fisher-Yates (proper algorithm)
export function hourlyShuffleSongs(songs: Song[], sectionId: string = 'default'): Song[] {
  const now = new Date();
  const hourSeed = now.getFullYear() * 1000000 + 
                   (now.getMonth() + 1) * 10000 + 
                   now.getDate() * 100 + 
                   now.getHours();
  const sectionHash = sectionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return seededFisherYates(songs, hourSeed + sectionHash);
}

export function dailyShuffleSongs(songs: Song[], sectionId: string = 'default'): Song[] {
  const now = new Date();
  const daySeed = now.getFullYear() * 10000 + 
                  (now.getMonth() + 1) * 100 + 
                  now.getDate();
  const sectionHash = sectionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return seededFisherYates(songs, daySeed + sectionHash);
}

export function smartShuffleSongs(songs: Song[], topCount: number = 10): Song[] {
  const shuffled = fisherYatesShuffle(songs);
  return [...shuffled.slice(0, topCount), ...shuffled.slice(topCount)];
}

export function smartHourlyShuffleSongs(songs: Song[], topCount: number = 10, sectionId: string = 'default'): Song[] {
  const shuffled = hourlyShuffleSongs(songs, sectionId);
  return [...shuffled.slice(0, Math.min(topCount, shuffled.length)), ...shuffled.slice(topCount)];
}

export function getFeaturedSongs(songs: Song[], count: number = 6, sectionId: string = 'featured'): Song[] {
  return hourlyShuffleSongs(songs, sectionId).slice(0, count);
}
