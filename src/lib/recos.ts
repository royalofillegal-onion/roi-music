import type { Song } from "@/data/Song";
import { uniqueSongs } from "@/data/allSongs";
import { getTaste } from "@/lib/listeningStats";

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
  const taste = getTaste();
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
      if (score > 0) {
        score += Math.max(-4, Math.min(3, taste.song.get(s.id) || 0));
        score += Math.max(-2, Math.min(2, (taste.artist.get(low(s.singer || s.artist)) || 0) / 3));
      }
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

/** Mix of familiar favourites and new discoveries, each with a reason. */
export function forYou(limit = 12): { songs: Song[]; reason: string } {
  const taste = getTaste();
  if (taste.played.size < 3) return { songs: trending(limit), reason: "Popular picks to get you started" };
  const topArtists = [...taste.artist.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a]) => a);
  const pool = uniqueSongs as Song[];
  const fresh = shuffle(pool.filter((s) => !taste.played.has(s.id) && topArtists.includes(low(s.singer || s.artist))));
  const favs = shuffle(pool.filter((s) => (taste.song.get(s.id) || 0) > 1));
  const discover = shuffle(pool.filter((s) => !taste.played.has(s.id)));
  const out: Song[] = []; const seen = new Set<string>();
  const add = (s?: Song) => { if (s && !seen.has(s.id) && (taste.song.get(s.id) || 0) > -1) { seen.add(s.id); out.push(s); } };
  for (let i = 0; out.length < limit && i < pool.length; i++) { add(fresh[i]); add(favs[i]); add(discover[i]); }
  const name = topArtists[0] ? pool.find((s) => low(s.singer || s.artist) === topArtists[0]) : undefined;
  return { songs: out.slice(0, limit), reason: name ? `Because you enjoy ${name.singer || name.artist}` : "Based on your listening" };
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
  const fy = forYou(10);
  rails.push({ id: "foryou", title: "Picked for you", subtitle: fy.reason, songs: fy.songs });
  rails.push({ id: "trending", title: "Trending now", songs: trending(10) });
  if (recentlyPlayed.length)
    rails.push({ id: "recent", title: "Recently played", songs: recentlyPlayed.slice(0, 10) });
  return rails;
}

export { shuffle };
