import type { Song } from "./Song";
import { uniqueSongs } from "./allSongs";

/**
 * New release song IDs (most recent first).
 * Add the `id` of any song from the catalog to feature it as a new release.
 * Unknown IDs are ignored safely.
 */
export const newReleaseSongIds: string[] = [
  "irumudi-kattu-ananthu",
  "oriya-pilla-sid-sriram",
  "veera-jayadheera-deepak-blue-lakshmi-meghana",
  "Thassadiya-Chinmayi",
  "Niluvanivvade",
  "neno-butterfly-sublahshini",
  "jigithara-karthik",
  "gunde-pelipothondhe-anurag-kulkarni",
  "aura-hiphop-tamizha",
  "Yetta Yetta",
  "pavazha-malli-sai-abhyankkar-shruti-haasan",
];

/** Resolve the ID list against the full catalog. */
export function getNewReleaseSongs(): Song[] {
  const map = new Map(uniqueSongs.map((s) => [s.id, s]));
  const picked = newReleaseSongIds
    .map((id) => map.get(id))
    .filter(Boolean) as Song[];

  // Fallback: if no curated IDs match, surface the newest by `year`.
  if (picked.length === 0) {
    return [...uniqueSongs]
      .filter((s) => typeof s.year === "number")
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 12);
  }
  return picked;
}
