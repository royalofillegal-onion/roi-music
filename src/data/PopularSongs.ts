import type { Song } from "./Song";
import { getTopPlayed } from "@/lib/deviceTracker";

/**
 * PopularSongs — songs the user listens to the most.
 * Stored in localStorage via deviceTracker (play counts).
 * Falls back to a shuffled slice of the catalog when there's no history yet.
 */
export function getPopularSongs(pool: Song[], limit = 30): Song[] {
  const top = getTopPlayed(100);
  if (top.length === 0) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, limit);
  }
  const byId = new Map(pool.map((s) => [s.id, s] as const));
  const ordered: Song[] = [];
  const seen = new Set<string>();
  for (const t of top) {
    const s = byId.get(t.id);
    if (s && !seen.has(s.id)) {
      ordered.push(s);
      seen.add(s.id);
    }
    if (ordered.length >= limit) break;
  }
  // Pad with shuffled unseen songs if user hasn't played many yet.
  if (ordered.length < limit) {
    const extras = pool
      .filter((s) => !seen.has(s.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit - ordered.length);
    ordered.push(...extras);
  }
  return ordered;
}