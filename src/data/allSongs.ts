import type { Song } from "./Song";
import { TeluguSongs } from "./TeluguSongs";
import { HindiSongs } from "./HindiSongs";
import { TamilSongs } from "./TamilSongs";
import { EnglishSongs } from "./EnglishSongs";
import { MalayalamSongs } from "./MalayalamSongs";
import { TrendingSongs } from "./TrendingSongs";
import { getPopularSongs } from "./PopularSongs";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const allSongs: Song[] = [
  ...TrendingSongs,
  ...TeluguSongs,
  ...HindiSongs,
  ...TamilSongs,
  ...EnglishSongs,
  ...MalayalamSongs,
];

export const uniqueSongs: Song[] = allSongs.filter((song, i, self) => {
  if (!song?.title || !song?.artist) return false;
  return i === self.findIndex(
    (s) =>
      s.title.toLowerCase().trim() === song.title.toLowerCase().trim() &&
      s.artist.toLowerCase().trim() === song.artist.toLowerCase().trim()
  );
});

/** Static fallback list (shuffled snapshot at module load). */
export const popularSongs: Song[] = (() => {
  const s = shuffle(uniqueSongs);
  return [...s.slice(0, 10), ...s.slice(10)];
})();

/** Live, user-driven popular songs (re-computed from play counts). */
export function getLivePopularSongs(limit = 30): Song[] {
  return getPopularSongs(uniqueSongs, limit);
}

export { TeluguSongs, HindiSongs, TamilSongs, EnglishSongs, MalayalamSongs, TrendingSongs };
