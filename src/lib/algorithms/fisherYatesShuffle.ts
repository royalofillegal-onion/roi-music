import { Song } from '@/data/Song';

/**
 * Fisher-Yates (Knuth) Shuffle Algorithm
 * Provides a true random permutation — every possible ordering is equally likely.
 * Time: O(n), Space: O(n) (creates a copy)
 * 
 * Unlike sort-based shuffles (which have bias), Fisher-Yates guarantees uniform distribution.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle songs ensuring no repeats until all have been played.
 * Maintains a "played" set; once all songs are exhausted, reshuffles the full list.
 */
export class NoRepeatShuffler {
  private remaining: Song[] = [];
  private allSongs: Song[];

  constructor(songs: Song[]) {
    this.allSongs = songs;
    this.remaining = fisherYatesShuffle(songs);
  }

  next(): Song | null {
    if (this.remaining.length === 0) {
      // All songs played — reshuffle
      this.remaining = fisherYatesShuffle(this.allSongs);
    }
    return this.remaining.shift() ?? null;
  }

  peek(): Song | null {
    if (this.remaining.length === 0) return null;
    return this.remaining[0];
  }

  reset(songs?: Song[]): void {
    if (songs) this.allSongs = songs;
    this.remaining = fisherYatesShuffle(this.allSongs);
  }

  get remainingCount(): number {
    return this.remaining.length;
  }

  get totalCount(): number {
    return this.allSongs.length;
  }
}

/**
 * Seeded Fisher-Yates for deterministic shuffles (e.g., hourly rotation).
 */
export function seededFisherYates<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let state = seed;
  const random = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
