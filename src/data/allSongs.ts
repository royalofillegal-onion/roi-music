import type { Song } from "./Song";
import { TeluguSongs } from "./TeluguSongs";
import { HindiSongs } from "./HindiSongs";
import { TamilSongs } from "./TamilSongs";
import { TrendingSongs } from "./TrendingSongs";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const allSongs: Song[] = [
  ...TrendingSongs,
  ...TeluguSongs,
  ...HindiSongs,
  ...TamilSongs,
];

export const uniqueSongs: Song[] = allSongs.filter((song, i, self) => {
  if (!song?.title || !song?.artist) return false;
  return i === self.findIndex(
    (s) =>
      s.title.toLowerCase().trim() === song.title.toLowerCase().trim() &&
      s.artist.toLowerCase().trim() === song.artist.toLowerCase().trim()
  );
});

export const popularSongs: Song[] = (() => {
  const s = shuffle(uniqueSongs);
  return [...s.slice(0, 10), ...s.slice(10)];
})();

export { TeluguSongs, HindiSongs, TamilSongs, TrendingSongs };
