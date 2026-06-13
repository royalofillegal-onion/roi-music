import { Song } from '@/data/songs';

/**
 * UserPreferenceLearner — Adaptive Learning Engine
 * 
 * Tracks every user interaction (play, like, skip, time-spent) and builds
 * a preference profile stored in localStorage. This profile is used to
 * dynamically reorder songs, sections, and recommendations on every visit.
 * 
 * The system learns:
 * - Preferred genres, moods, artists, languages
 * - Time-of-day listening patterns
 * - Play frequency and recency for individual songs
 * - Skip patterns (songs skipped quickly get deprioritized)
 */

interface PlayEvent {
  songId: string;
  genre?: string;
  sync?: string;
  artist: string;
  language?: string;
  timestamp: number;
  duration: number;       // how long user actually listened (seconds)
  totalDuration: number;  // full song duration
  skipped: boolean;       // true if user skipped before 30% played
}

interface PreferenceProfile {
  genreScores: Record<string, number>;
  moodScores: Record<string, number>;
  artistScores: Record<string, number>;
  languageScores: Record<string, number>;
  songPlayCounts: Record<string, number>;
  songLastPlayed: Record<string, number>;
  songSkipCounts: Record<string, number>;
  totalPlays: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'roi_user_preferences';
const DECAY_FACTOR = 0.98;     // older preferences slowly decay
const MAX_HISTORY_EVENTS = 500;
const SKIP_THRESHOLD = 0.3;    // <30% listened = skip

class UserPreferenceLearner {
  private profile: PreferenceProfile;
  private dirty = false;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): PreferenceProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch { /* ignore */ }
    return this.createEmptyProfile();
  }

  private createEmptyProfile(): PreferenceProfile {
    return {
      genreScores: {},
      moodScores: {},
      artistScores: {},
      languageScores: {},
      songPlayCounts: {},
      songLastPlayed: {},
      songSkipCounts: {},
      totalPlays: 0,
      lastUpdated: Date.now(),
    };
  }

  private saveProfile(): void {
    try {
      this.profile.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      this.dirty = false;
    } catch { /* storage full, ignore */ }
  }

  /**
   * Record a play event — call when a song finishes or user navigates away.
   */
  recordPlay(song: Song, listenedDuration: number): void {
    const skipped = song.duration > 0 && (listenedDuration / song.duration) < SKIP_THRESHOLD;

    const p = this.profile;
    p.totalPlays++;

    // Song-level tracking
    p.songPlayCounts[song.id] = (p.songPlayCounts[song.id] || 0) + 1;
    p.songLastPlayed[song.id] = Date.now();

    if (skipped) {
      p.songSkipCounts[song.id] = (p.songSkipCounts[song.id] || 0) + 1;
      // Skipped songs get negative signal
      this.adjustScore(p.genreScores, song.genre?.toLowerCase(), -0.5);
      this.adjustScore(p.moodScores, song.sync, -0.5);
      this.adjustScore(p.artistScores, song.artist.toLowerCase(), -0.3);
    } else {
      // Listened fully — strong positive signal
      const listenRatio = Math.min(listenedDuration / (song.duration || 1), 1);
      const weight = 1 + listenRatio; // 1-2x weight based on how much they listened

      this.adjustScore(p.genreScores, song.genre?.toLowerCase(), weight);
      this.adjustScore(p.moodScores, song.sync, weight);
      this.adjustScore(p.artistScores, song.artist.toLowerCase(), weight * 1.2);
      this.adjustScore(p.languageScores, song.language, weight * 0.8);
    }

    this.dirty = true;
    this.saveProfile();
  }

  /**
   * Record a like — strong positive signal.
   */
  recordLike(song: Song): void {
    const p = this.profile;
    this.adjustScore(p.genreScores, song.genre?.toLowerCase(), 3);
    this.adjustScore(p.moodScores, song.sync, 3);
    this.adjustScore(p.artistScores, song.artist.toLowerCase(), 4);
    this.adjustScore(p.languageScores, song.language, 2);
    this.dirty = true;
    this.saveProfile();
  }

  /**
   * Record an unlike — mild negative signal.
   */
  recordUnlike(song: Song): void {
    const p = this.profile;
    this.adjustScore(p.genreScores, song.genre?.toLowerCase(), -1);
    this.adjustScore(p.artistScores, song.artist.toLowerCase(), -1.5);
    this.dirty = true;
    this.saveProfile();
  }

  private adjustScore(scores: Record<string, number>, key: string | undefined, delta: number): void {
    if (!key) return;
    scores[key] = (scores[key] || 0) + delta;
  }

  /**
   * Apply time-based decay to all scores (call periodically).
   * Makes recent interactions matter more than old ones.
   */
  applyDecay(): void {
    const p = this.profile;
    for (const key in p.genreScores) p.genreScores[key] *= DECAY_FACTOR;
    for (const key in p.moodScores) p.moodScores[key] *= DECAY_FACTOR;
    for (const key in p.artistScores) p.artistScores[key] *= DECAY_FACTOR;
    for (const key in p.languageScores) p.languageScores[key] *= DECAY_FACTOR;
    this.saveProfile();
  }

  /**
   * Score a song based on the user's learned preferences.
   * Higher score = more likely the user wants to hear it.
   */
  scoreSong(song: Song): number {
    const p = this.profile;
    let score = 0;

    // Genre preference
    if (song.genre) {
      score += (p.genreScores[song.genre.toLowerCase()] || 0) * 2;
    }

    // Mood preference
    if (song.sync) {
      score += (p.moodScores[song.sync] || 0) * 2;
    }

    // Artist preference (strongest signal)
    score += (p.artistScores[song.artist.toLowerCase()] || 0) * 2.5;

    // Language preference
    if (song.language) {
      score += (p.languageScores[song.language] || 0) * 1.5;
    }

    // Recency bonus — recently played songs get a small boost
    const lastPlayed = p.songLastPlayed[song.id];
    if (lastPlayed) {
      const hoursSince = (Date.now() - lastPlayed) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        score += 1; // played today
      } else if (hoursSince < 72) {
        score += 0.5; // played in last 3 days
      }
    }

    // Skip penalty — frequently skipped songs get deprioritized
    const skipCount = p.songSkipCounts[song.id] || 0;
    const playCount = p.songPlayCounts[song.id] || 0;
    if (playCount > 0 && skipCount / playCount > 0.5) {
      score -= 2; // more than half the time skipped = penalty
    }

    // Freshness bonus for unplayed songs (discovery)
    if (!playCount) {
      score += 0.3;
    }

    return score;
  }

  /**
   * Reorder an array of songs based on learned preferences.
   * Songs with higher preference scores come first, with
   * small random jitter to keep things fresh.
   */
  reorderSongs(songs: Song[]): Song[] {
    if (this.profile.totalPlays < 3) {
      // Not enough data yet — return as-is
      return songs;
    }

    return [...songs].sort((a, b) => {
      const scoreA = this.scoreSong(a) + Math.random() * 0.5;
      const scoreB = this.scoreSong(b) + Math.random() * 0.5;
      return scoreB - scoreA;
    });
  }

  /**
   * Get personalized recommendations from a pool of songs.
   * Combines preference scoring with diversity to avoid echo chambers.
   */
  getPersonalizedSongs(allSongs: Song[], limit: number = 20): Song[] {
    if (this.profile.totalPlays < 3) return [];

    const scored = allSongs.map(song => ({
      song,
      score: this.scoreSong(song) + Math.random() * 1.5, // jitter for variety
    }));

    scored.sort((a, b) => b.score - a.score);

    // Take top songs but ensure artist diversity
    const result: Song[] = [];
    const artistCount: Record<string, number> = {};
    const maxPerArtist = 3;

    for (const item of scored) {
      if (result.length >= limit) break;
      const artistKey = item.song.artist.toLowerCase();
      if ((artistCount[artistKey] || 0) >= maxPerArtist) continue;
      artistCount[artistKey] = (artistCount[artistKey] || 0) + 1;
      result.push(item.song);
    }

    return result;
  }

  /**
   * Get the user's top preferred genres/moods/artists for display.
   */
  getTopPreferences(): {
    genres: string[];
    moods: string[];
    artists: string[];
  } {
    const topN = (scores: Record<string, number>, n: number) =>
      Object.entries(scores)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, n)
        .map(([k]) => k);

    return {
      genres: topN(this.profile.genreScores, 5),
      moods: topN(this.profile.moodScores, 5),
      artists: topN(this.profile.artistScores, 10),
    };
  }

  /**
   * Get sections ordered by user preference.
   * Returns section IDs in priority order.
   */
  getSectionOrder(sectionMoodMap: Record<string, string[]>): string[] {
    const scored = Object.entries(sectionMoodMap).map(([sectionId, moods]) => {
      let score = 0;
      for (const mood of moods) {
        score += (this.profile.moodScores[mood] || 0);
      }
      return { sectionId, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.sectionId);
  }

  /**
   * Check if user has enough data for personalization.
   */
  hasEnoughData(): boolean {
    return this.profile.totalPlays >= 3;
  }

  /**
   * Reset all learned preferences.
   */
  reset(): void {
    this.profile = this.createEmptyProfile();
    this.saveProfile();
  }

  getProfile(): PreferenceProfile {
    return { ...this.profile };
  }
}

// Singleton instance
export const userPreferenceLearner = new UserPreferenceLearner();
