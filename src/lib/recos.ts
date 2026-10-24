import type { Song } from "@/data/Song";
import { uniqueSongs } from "@/data/allSongs";

const low = (v?: string) => (v || "").toLowerCase().trim();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface Rail {
  id: string;
  title: string;
  subtitle?: string;
  songs: Song[];
  layout?: "square" | "wide";
}

/** Score songs by similarity to a seed song. */
export function similarTo(seed: Song, limit = 12): Song[] {
  return (uniqueSongs as Song[])
    .filter((s) => s.id !== seed.id)
    .map((s) => {
      let score = 0;
      if (low(s.artist) === low(seed.artist)) score += 5;
      if (low((s as any).singer) === low((seed as any).singer) && (s as any).singer) score += 4;
      if (low(s.album) && low(s.album) === low(seed.album)) score += 4;
      if (low(s.genre) && low(s.genre) === low(seed.genre)) score += 3;
      if (low(s.language) === low(seed.language)) score += 2;
      if ((s as any).sync && (s as any).sync === (seed as any).sync) score += 2;
      if (s.year && seed.year && Math.abs(s.year - seed.year) <= 2) score += 1;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export function moreFromArtist(seed: Song, limit = 12): Song[] {
  const name = low((seed as any).singer || seed.artist);
  return (uniqueSongs as Song[])
    .filter(
      (s) =>
        s.id !== seed.id &&
        (low(s.artist) === name || low((s as any).singer) === name)
    )
    .slice(0, limit);
}

export function trending(limit = 12): Song[] {
  return shuffle(uniqueSongs as Song[]).slice(0, limit);
}

/** Rails shown under the player / feed item. */
export function buildRails(seed: Song | null, recentlyPlayed: Song[] = []): Rail[] {
  const rails: Rail[] = [];
  if (seed) {
    const artist = (seed as any).singer || seed.artist;
    const fromArtist = moreFromArtist(seed);
    const similar = similarTo(seed);
    if (similar.length)
      rails.push({
        id: "because",
        title: "Because you listened to this",
        subtitle: seed.title,
        songs: similar.slice(0, 10),
      });
    if (fromArtist.length)
      rails.push({
        id: "artist",
        title: `More from ${artist}`,
        songs: fromArtist,
      });
  }
  rails.push({ id: "trending", title: "Trending now", songs: trending(10) });
  if (recentlyPlayed.length)
    rails.push({ id: "recent", title: "Recently played", songs: recentlyPlayed.slice(0, 10) });
  return rails;
}

export { shuffle };
