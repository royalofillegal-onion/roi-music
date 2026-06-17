import lyricsData from "./lyrics.json";

/**
 * Lyrics are stored in src/data/lyrics.json keyed by song id.
 * To add lyrics for a new song, add an entry: "<songId>": "line1\nline2..."
 */
const lyricsMap = lyricsData as Record<string, string>;

export function getLyricsForSong(songId: string | undefined | null): string | null {
  if (!songId) return null;
  return lyricsMap[songId] ?? null;
}

export default lyricsMap;
