import { Song } from '@/data/songs';

const hourlyCache = new Map<string, { hour: number; result: Song[] }>();
const dailyCache = new Map<string, { day: number; result: Song[] }>();

// Seeded random for consistent shuffles within a time period
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// Pure shuffle helper (random each time)
export function shuffle<T>(array: T[]): T[] {
  return [...array]
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.item);
}

// Time-based shuffle that changes every hour
export function hourlyShuffleSongs(songs: Song[], sectionId: string = 'default'): Song[] {
  const now = new Date();
  const hourKey = now.getFullYear() * 1000000 +
                  (now.getMonth() + 1) * 10000 +
                  now.getDate() * 100 +
                  now.getHours();

  const cacheKey = `${sectionId}-${songs.length}`;
  const cached = hourlyCache.get(cacheKey);

  if (cached && cached.hour === hourKey) {
    return cached.result;
  }

  const sectionHash = sectionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = seededRandom(hourKey + sectionHash);

  const result = [...songs]
    .map(song => ({ song, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.song);

  hourlyCache.set(cacheKey, { hour: hourKey, result });

  return result;
}

// Daily shuffle that changes every day
export function dailyShuffleSongs(songs: Song[], sectionId: string = 'default'): Song[] {
  const now = new Date();
  const dayKey = now.getFullYear() * 10000 +
                 (now.getMonth() + 1) * 100 +
                 now.getDate();

  const cacheKey = `${sectionId}-${songs.length}`;
  const cached = dailyCache.get(cacheKey);

  if (cached && cached.day === dayKey) {
    return cached.result;
  }

  const sectionHash = sectionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = seededRandom(dayKey + sectionHash);

  const result = [...songs]
    .map(song => ({ song, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.song);

  dailyCache.set(cacheKey, { day: dayKey, result });

  return result;
}

// Smart shuffle: Top N random picks + remaining songs
export function smartShuffleSongs(songs: Song[], topCount: number = 10): Song[] {
  const shuffled = shuffle(songs);
  const top = shuffled.slice(0, topCount);
  const remaining = shuffled.slice(topCount);
  return [...top, ...remaining];
}

// Smart hourly shuffle: Top N based on hourly seed + rest
export function smartHourlyShuffleSongs(songs: Song[], topCount: number = 10, sectionId: string = 'default'): Song[] {
  const shuffled = hourlyShuffleSongs(songs, sectionId);
  const top = shuffled.slice(0, Math.min(topCount, shuffled.length));
  const remaining = shuffled.slice(topCount);
  return [...top, ...remaining];
}

// Get featured songs (top picks that rotate)
export function getFeaturedSongs(songs: Song[], count: number = 6, sectionId: string = 'featured'): Song[] {
  return hourlyShuffleSongs(songs, sectionId).slice(0, count);
}
