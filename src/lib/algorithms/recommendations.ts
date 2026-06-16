import { Song } from '@/data/Song';
import { fisherYatesShuffle } from './fisherYatesShuffle';

/**
 * Content-Based Filtering
 * Recommends songs similar to a given song based on shared attributes:
 * genre, sync (mood), language, artist, album.
 */
export function getContentBasedRecommendations(
  targetSong: Song,
  allSongs: Song[],
  limit: number = 20
): Song[] {
  const scored = allSongs
    .filter(s => s.id !== targetSong.id)
    .map(song => {
      let score = 0;

      // Genre match (strong signal)
      if (song.genre && targetSong.genre &&
        song.genre.toLowerCase() === targetSong.genre.toLowerCase()) {
        score += 3;
      }

      // Mood/sync match (strong signal)
      if (song.sync && targetSong.sync && song.sync === targetSong.sync) {
        score += 3;
      }

      // Same artist (moderate signal)
      if (song.artist.toLowerCase() === targetSong.artist.toLowerCase()) {
        score += 2;
      }

      // Same language
      if (song.language && targetSong.language && song.language === targetSong.language) {
        score += 1;
      }

      // Same album
      if (song.album && targetSong.album &&
        song.album.toLowerCase() === targetSong.album.toLowerCase()) {
        score += 2;
      }

      // Same year (slight relevance)
      if (song.year && targetSong.year && song.year === targetSong.year) {
        score += 0.5;
      }

      return { song, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.song);
}

/**
 * Collaborative Filtering (simplified, localStorage-based)
 * Uses the user's listening history to find patterns and recommend songs
 * that frequently follow or co-occur with recently played songs.
 */
export function getCollaborativeRecommendations(
  recentlyPlayed: Song[],
  allSongs: Song[],
  limit: number = 15
): Song[] {
  if (recentlyPlayed.length === 0) return [];

  const recentIds = new Set(recentlyPlayed.map(s => s.id));

  // Count attribute frequencies in recently played songs
  const genreFreq: Record<string, number> = {};
  const syncFreq: Record<string, number> = {};
  const artistFreq: Record<string, number> = {};
  const langFreq: Record<string, number> = {};

  recentlyPlayed.forEach(song => {
    if (song.genre) genreFreq[song.genre.toLowerCase()] = (genreFreq[song.genre.toLowerCase()] || 0) + 1;
    if (song.sync) syncFreq[song.sync] = (syncFreq[song.sync] || 0) + 1;
    artistFreq[song.artist.toLowerCase()] = (artistFreq[song.artist.toLowerCase()] || 0) + 1;
    if (song.language) langFreq[song.language] = (langFreq[song.language] || 0) + 1;
  });

  // Score all songs not recently played
  const scored = allSongs
    .filter(song => !recentIds.has(song.id))
    .map(song => {
      let score = 0;

      if (song.genre && genreFreq[song.genre.toLowerCase()]) {
        score += genreFreq[song.genre.toLowerCase()] * 2;
      }
      if (song.sync && syncFreq[song.sync]) {
        score += syncFreq[song.sync] * 2;
      }
      if (artistFreq[song.artist.toLowerCase()]) {
        score += artistFreq[song.artist.toLowerCase()] * 1.5;
      }
      if (song.language && langFreq[song.language]) {
        score += langFreq[song.language];
      }

      // Add small random factor to avoid always returning the same order
      score += Math.random() * 0.5;

      return { song, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.song);
}

/**
 * Hybrid recommendations: combines content-based + collaborative filtering.
 * Used for "Made For You" and auto-play next.
 */
export function getHybridRecommendations(
  currentSong: Song | null,
  recentlyPlayed: Song[],
  allSongs: Song[],
  limit: number = 20
): Song[] {
  const contentBased = currentSong
    ? getContentBasedRecommendations(currentSong, allSongs, limit)
    : [];
  const collaborative = getCollaborativeRecommendations(recentlyPlayed, allSongs, limit);

  // Merge and deduplicate, interleaving both sources
  const seen = new Set<string>();
  const merged: Song[] = [];
  const maxLen = Math.max(contentBased.length, collaborative.length);

  for (let i = 0; i < maxLen && merged.length < limit; i++) {
    if (i < contentBased.length && !seen.has(contentBased[i].id)) {
      seen.add(contentBased[i].id);
      merged.push(contentBased[i]);
    }
    if (i < collaborative.length && !seen.has(collaborative[i].id)) {
      seen.add(collaborative[i].id);
      merged.push(collaborative[i]);
    }
  }

  return merged.slice(0, limit);
}

/**
 * "Discover" recommendations — songs the user hasn't heard with diverse attributes.
 */
export function getDiscoverRecommendations(
  listenedSongIds: Set<string>,
  allSongs: Song[],
  limit: number = 15
): Song[] {
  const unheard = allSongs.filter(s => !listenedSongIds.has(s.id));
  return fisherYatesShuffle(unheard).slice(0, limit);
}
