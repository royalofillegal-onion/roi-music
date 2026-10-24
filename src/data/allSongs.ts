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

/** A song is streamable only when it points at a real remote audio file. */
export function isStreamable(song: Song | undefined | null): boolean {
  return !!song?.audioUrl && /^https?:\/\//i.test(song.audioUrl);
}

export const uniqueSongs: Song[] = allSongs.filter((song, i, self) => {
  if (!song?.title || !song?.artist) return false;
  if (!isStreamable(song)) return false;
  return i === self.findIndex(
    (s) =>
      s.title.toLowerCase().trim() === song.title.toLowerCase().trim() &&
      s.artist.toLowerCase().trim() === song.artist.toLowerCase().trim()
  );
});

export const songById = new Map(uniqueSongs.map((s) => [s.id, s]));

export function songsByIds(ids: string[]): Song[] {
  return ids.map((id) => songById.get(id)).filter(Boolean) as Song[];
}


export const popularSongs: Song[] = (() => {
  const s = shuffle(uniqueSongs);
  return [...s.slice(0, 10), ...s.slice(10)];
})();

export { TeluguSongs, HindiSongs, TamilSongs, TrendingSongs };
