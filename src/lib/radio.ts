import { uniqueSongs } from "@/data/allSongs";
import type { Song } from "@/data/Song";

/**
 * Smart radio: builds an endless-feeling station around a seed song by
 * scoring every other track on shared artist, genre, language and era.
 */

function score(seed: Song, other: Song): number {
  let s = 0;
  const artistA = (seed.singer || seed.artist || "").toLowerCase();
  const artistB = (other.singer || other.artist || "").toLowerCase();
  if (artistA && artistA === artistB) s += 6;
  if (seed.genre && seed.genre === other.genre) s += 3;
  if (seed.language && seed.language === other.language) s += 2;
  if (seed.movie && seed.movie === other.movie) s += 2;
  if (seed.year && other.year && Math.abs(seed.year - other.year) <= 3) s += 1;
  return s + Math.random() * 1.5; // keeps repeat stations fresh
}

export function buildRadio(seed: Song, limit = 60, pool: Song[] = uniqueSongs as Song[]): Song[] {
  const rest = pool
    .filter((s) => s.id !== seed.id)
    .map((s) => ({ s, v: score(seed, s) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, limit - 1)
    .map((x) => x.s);
  return [seed, ...rest];
}

/** Station built from a set of songs (e.g. the listener's liked tracks). */
export function buildBlendRadio(seeds: Song[], limit = 60): Song[] {
  if (seeds.length === 0) return [];
  const map = new Map<string, { s: Song; v: number }>();
  seeds.slice(0, 8).forEach((seed) => {
    buildRadio(seed, 30).forEach((s) => {
      const cur = map.get(s.id);
      if (cur) cur.v += 1;
      else map.set(s.id, { s, v: 1 });
    });
  });
  return [...map.values()].sort((a, b) => b.v - a.v).slice(0, limit).map((x) => x.s);
}
