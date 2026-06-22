/**
 * ============================================================
 *  MANUAL MOOD / TIME / WEATHER RECOMMENDATION CURATION
 * ============================================================
 *
 *  Edit THIS file by hand to control what shows up in the
 *  "Recommended for you" section on the Home screen.
 *
 *  You can curate songs by:
 *    1. Time of day  (morning / afternoon / evening / night)
 *    2. Weather mood (happy / love / sad / feel1 / dance /
 *                     devotional / mass)
 *    3. Sync-text "chains" — list songs that flow well one
 *       after another (same vibe / tempo / feel).
 *
 *  Just paste song IDs (the `id` field from any of the
 *  TeluguSongs / HindiSongs / TamilSongs / EnglishSongs /
 *  MalayalamSongs files) into the arrays below. You can also
 *  leave any bucket empty — the engine will auto-fall-back to
 *  songs whose `sync` matches the current mood.
 *
 *  Every refresh rotates the order, so users see a fresh
 *  feed each time (no repeats within ~5 minute windows).
 * ============================================================
 */

import type { Song } from "./Song";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type WeatherMood =
  | "happy" | "love" | "sad" | "feel1" | "dance" | "devotional" | "mass";

interface Bucket {
  /** Friendly description shown to the user (optional). */
  description: string;
  /** Short tagline that goes under the section heading. */
  syncText: string;
  /** Song IDs (in priority order). Leave [] to auto-derive from `sync`. */
  ids: string[];
}

/* -------------------------------------------------------------
 *  1) TIME-OF-DAY CURATION
 * ------------------------------------------------------------- */
export const TIME_OF_DAY: Record<TimeOfDay, Bucket> = {
  morning: {
    description: "Fresh, uplifting tracks to start the day right.",
    syncText: "Sunrise vibes · easy energy",
    ids: [
      // e.g. "tel-001", "hin-014", "tam-007"
    ],
  },
  afternoon: {
    description: "Steady grooves to keep the day flowing.",
    syncText: "Midday flow · keep moving",
    ids: [],
  },
  evening: {
    description: "Golden-hour songs — chill, melodic, romantic.",
    syncText: "Golden hour · warm melodies",
    ids: [],
  },
  night: {
    description: "Late-night picks — soulful, deep, slow burns.",
    syncText: "Late night · soulful & deep",
    ids: [],
  },
};

/* -------------------------------------------------------------
 *  2) WEATHER-MOOD CURATION
 *     `mood` comes from useWeather(): happy/love/sad/feel1/
 *     dance/devotional/mass — derived from current weather.
 * ------------------------------------------------------------- */
export const WEATHER_MOOD: Record<WeatherMood, Bucket> = {
  happy:      { description: "Bright, sunny, smile-out-loud tracks.",     syncText: "Sunny & bright",        ids: [] },
  love:       { description: "Romantic vibes for soft skies.",            syncText: "Soft & romantic",       ids: [] },
  sad:        { description: "Rainy-day comfort songs.",                  syncText: "Rainy & reflective",    ids: [] },
  feel1:      { description: "Cloudy-day chill — slow and dreamy.",       syncText: "Cloudy & dreamy",       ids: [] },
  dance:      { description: "Pure energy — get up and move.",            syncText: "High energy · dance",   ids: [] },
  devotional: { description: "Calm, devotional & peaceful.",              syncText: "Calm & devotional",     ids: [] },
  mass:       { description: "Stormy power-anthems & mass beats.",        syncText: "Stormy & powerful",     ids: [] },
};

/* -------------------------------------------------------------
 *  3) SYNC-TEXT CHAINS
 *     Songs that play GREAT in sequence (same vibe). The engine
 *     will use these to "chain" matching songs after the current
 *     one to give a smooth, DJ-like transition feel.
 * ------------------------------------------------------------- */
export const SYNC_CHAINS: Record<string, string[]> = {
  // "happy":      ["tel-001", "hin-014", "tam-007"],
  // "love":       [],
  // "sad":        [],
  // "feel1":      [],
  // "dance":      [],
  // "devotional": [],
  // "mass":       [],
};

/* -------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------- */

export function getTimeOfDay(d: Date = new Date()): TimeOfDay {
  const h = d.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

/** Cheap deterministic shuffle that re-rotates every ~5 minutes
 *  so users see a different order constantly without being random
 *  on every render (which would feel jumpy). */
function rotate<T>(arr: T[], seed: number): T[] {
  if (arr.length === 0) return arr;
  const out = arr.slice();
  // Fisher-Yates with a seeded PRNG (mulberry32)
  let a = seed >>> 0;
  const rand = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Map a list of IDs → Song[] using the master catalog. */
function idsToSongs(ids: string[], catalog: Song[]): Song[] {
  if (ids.length === 0) return [];
  const byId = new Map(catalog.map((s) => [s.id, s]));
  const out: Song[] = [];
  for (const id of ids) {
    const s = byId.get(id);
    if (s) out.push(s);
  }
  return out;
}

export interface DynamicRecsOptions {
  catalog: Song[];
  weatherMood: WeatherMood;
  currentSong?: Song | null;
  recentlyPlayed?: Song[];
  limit?: number;
  /** Pass `Date.now()` divided down to control rotation cadence. */
  rotationSeed?: number;
}

export interface DynamicRecsResult {
  songs: Song[];
  timeOfDay: TimeOfDay;
  syncText: string;
  description: string;
}

/**
 * Build a fresh recommendation feed that blends:
 *   - manual time-of-day picks
 *   - manual weather-mood picks
 *   - sync-chain continuation from the current song
 *   - auto fallback: songs whose `sync` matches the weather mood
 *
 * Rotates order every ~5 minutes so the feed feels alive.
 */
export function getDynamicRecommendations(
  opts: DynamicRecsOptions
): DynamicRecsResult {
  const {
    catalog,
    weatherMood,
    currentSong = null,
    recentlyPlayed = [],
    limit = 30,
    rotationSeed = Math.floor(Date.now() / (5 * 60 * 1000)),
  } = opts;

  const tod = getTimeOfDay();
  const todBucket = TIME_OF_DAY[tod];
  const wxBucket = WEATHER_MOOD[weatherMood];

  // 1) Manual picks (mapped from IDs)
  const todSongs = idsToSongs(todBucket.ids, catalog);
  const wxSongs = idsToSongs(wxBucket.ids, catalog);

  // 2) Sync-chain continuation
  const chainKey = currentSong?.sync || weatherMood;
  const chainSongs = idsToSongs(SYNC_CHAINS[chainKey] || [], catalog);

  // 3) Auto fallback by sync match (so empty buckets still produce songs)
  const autoSync = catalog.filter((s) => s.sync === weatherMood);
  const autoTod = catalog.filter((s) => {
    // light heuristic: pair time-of-day with sync moods
    if (tod === "morning")   return s.sync === "happy" || s.sync === "dance";
    if (tod === "afternoon") return s.sync === "happy" || s.sync === "love";
    if (tod === "evening")   return s.sync === "love"  || s.sync === "feel1";
    return s.sync === "sad" || s.sync === "feel1" || s.sync === "devotional";
  });

  // 4) Rotate each source independently so the mix changes over time
  const sources: Song[][] = [
    rotate(todSongs, rotationSeed + 1),
    rotate(wxSongs,  rotationSeed + 2),
    rotate(chainSongs, rotationSeed + 3),
    rotate(autoSync, rotationSeed + 4),
    rotate(autoTod,  rotationSeed + 5),
  ];

  // 5) De-prioritise very recently played so feed feels fresh
  const recentIds = new Set(recentlyPlayed.slice(0, 8).map((s) => s.id));
  const seen = new Set<string>();
  if (currentSong) seen.add(currentSong.id);
  const merged: Song[] = [];
  const max = Math.max(...sources.map((s) => s.length), 0);
  for (let i = 0; i < max && merged.length < limit; i++) {
    for (const src of sources) {
      const s = src[i];
      if (!s || seen.has(s.id) || recentIds.has(s.id)) continue;
      seen.add(s.id);
      merged.push(s);
      if (merged.length >= limit) break;
    }
  }
  // Top up with any remaining (including recently played) if still short
  if (merged.length < limit) {
    for (const src of sources) {
      for (const s of src) {
        if (seen.has(s.id)) continue;
        seen.add(s.id);
        merged.push(s);
        if (merged.length >= limit) break;
      }
      if (merged.length >= limit) break;
    }
  }

  return {
    songs: merged.slice(0, limit),
    timeOfDay: tod,
    syncText: `${todBucket.syncText} · ${wxBucket.syncText}`,
    description: `${todBucket.description} ${wxBucket.description}`,
  };
}
