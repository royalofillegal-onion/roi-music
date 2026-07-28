/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ROI Music — Smart Recommendation Algorithm (single-file edition)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  Everything lives here so it's easy to hand-edit:
 *
 *    1. SONG_META         — id → { description (2 lines), mood, time, weather,
 *                                  genre, vibe }   (auto-generated from catalog,
 *                                  override any entry by editing the OVERRIDES
 *                                  map below — your edits win).
 *    2. MANUAL_PLAYLISTS  — name → string[] of song ids.  Add your own here.
 *    3. recommendSongs()  — main entry point.  Pass {time, mood, weather, genre,
 *                                                    text} and get a ranked list.
 *    4. playedCache       — small session cache: songs played in this session
 *                                                are kept in memory so the next
 *                                                request for them is instant
 *                                                and never re-hits the network.
 *
 *  All inputs are optional — leave any field undefined and that signal is
 *  simply ignored when scoring.
 */

import type { Song } from "@/data/Song";
import { uniqueSongs } from "@/data/allSongs";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Mood    = "happy" | "sad" | "chill" | "energetic" | "romantic" | "angry" | "focus" | "party" | "sleep";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night" | "lateNight";
export type Weather   = "sunny" | "rainy" | "cloudy" | "cold" | "hot" | "snow" | "storm";

export interface SongMeta {
  description: string;          // 2 short lines describing the vibe
  mood:    Mood[];
  time:    TimeOfDay[];
  weather: Weather[];
  genre:   string[];
  vibe:    string[];            // free-form keywords used for text matching
}

export interface RecommendOptions {
  time?:    TimeOfDay;
  mood?:    Mood;
  weather?: Weather;
  genre?:   string;
  text?:    string;             // free-text from chat / search
  limit?:   number;             // default 20
  exclude?: string[];           // song ids to exclude
}

// ─── Manual override map ────────────────────────────────────────────────────
//   Hand-curated metadata wins over the auto-generated one below.
//   Add entries here whenever you want exact control over a specific song.

const OVERRIDES: Record<string, Partial<SongMeta>> = {
  // Example — uncomment & edit:
  // "te-001": {
  //   description: "A high-energy banger that turns any car ride into a party.\nPerfect for late-night drives with the windows down.",
  //   mood: ["energetic", "party"],
  //   time: ["night", "lateNight"],
  //   weather: ["hot"],
  //   genre: ["dance"],
  //   vibe: ["drive", "party", "loud"],
  // },
};

// ─── Manual playlists (just lists of ids) ───────────────────────────────────

export const MANUAL_PLAYLISTS: Record<string, string[]> = {
  // "morning-coffee": ["te-001", "hi-024", "en-077"],
  // "gym-pump":       ["en-012", "ta-088"],
  // "rainy-evening":  ["hi-003", "ml-019"],
};

/** Resolve a manual playlist name into Song objects (in declared order). */
export function getManualPlaylist(name: string, pool: Song[] = uniqueSongs): Song[] {
  const ids = MANUAL_PLAYLISTS[name];
  if (!ids) return [];
  const byId = new Map(pool.map(s => [s.id, s] as const));
  return ids.map(id => byId.get(id)).filter(Boolean) as Song[];
}

// ─── Heuristic auto-tagger ──────────────────────────────────────────────────
//   Reads existing catalog fields (title / genre / sync / album / artist) and
//   guesses sensible defaults. Override anything explicit via OVERRIDES.

const KEYWORD_MOOD: Array<[RegExp, Mood]> = [
  [/love|prema|pyaar|kadhal|dil|jaan|romantic|aaru/i, "romantic"],
  [/sad|gham|tears|alone|virah|kanneer|miss/i,         "sad"],
  [/party|dance|club|mast|naach|step|disco/i,          "party"],
  [/energetic|fast|power|fire|gym|run|beast/i,         "energetic"],
  [/chill|relax|calm|breeze|soft|smooth/i,             "chill"],
  [/happy|khushi|smile|sun|joy|fun/i,                  "happy"],
  [/focus|study|piano|instrumental|lofi/i,             "focus"],
  [/angry|rage|war|fight|fury/i,                       "angry"],
  [/sleep|lullaby|night|moon|dream/i,                  "sleep"],
];

const KEYWORD_TIME: Array<[RegExp, TimeOfDay]> = [
  [/morning|sunrise|udaya|fajr|dawn/i,        "morning"],
  [/noon|afternoon|midday/i,                  "afternoon"],
  [/evening|sunset|dusk|godhuli/i,            "evening"],
  [/night|raat|iravu|chand|moon/i,            "night"],
  [/lofi|sleep|lullaby|dream|3am/i,           "lateNight"],
];

const KEYWORD_WEATHER: Array<[RegExp, Weather]> = [
  [/rain|baarish|mazha|monsoon|barsaat/i,     "rainy"],
  [/sun|summer|hot|beach/i,                   "sunny"],
  [/cloud|grey|fog/i,                         "cloudy"],
  [/cold|winter|chill|snow/i,                 "cold"],
  [/snow|himalaya|ice/i,                      "snow"],
  [/storm|thunder|tufan/i,                    "storm"],
];

const GENRE_TO_MOOD: Record<string, Mood[]> = {
  romantic:   ["romantic", "chill"],
  melody:     ["chill", "romantic"],
  dance:      ["party", "energetic"],
  folk:       ["happy", "chill"],
  classical:  ["focus", "chill"],
  rock:       ["energetic", "angry"],
  hiphop:     ["energetic", "party"],
  pop:        ["happy", "energetic"],
  devotional: ["focus", "chill"],
  lofi:       ["chill", "focus", "sleep"],
};

function matchAll<T>(rules: Array<[RegExp, T]>, hay: string): T[] {
  const out: T[] = [];
  for (const [re, val] of rules) if (re.test(hay)) out.push(val);
  return out;
}

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function autoTag(song: Song): SongMeta {
  const hay = [song.title, song.album, song.genre, (song as any).sync, song.artist]
    .filter(Boolean).join(" ");

  const moods   = uniq(matchAll(KEYWORD_MOOD,   hay));
  const times   = uniq(matchAll(KEYWORD_TIME,   hay));
  const weather = uniq(matchAll(KEYWORD_WEATHER, hay));
  const genres  = uniq([song.genre, (song as any).sync].filter(Boolean) as string[]);

  // Fill in defaults from genre if we found nothing
  if (moods.length === 0) {
    for (const g of genres) {
      const key = g.toLowerCase();
      if (GENRE_TO_MOOD[key]) moods.push(...GENRE_TO_MOOD[key]);
    }
  }
  if (moods.length === 0)   moods.push("chill");
  if (times.length === 0)   times.push("evening", "night");
  if (weather.length === 0) weather.push("cloudy", "sunny");

  const description =
    `${song.title} by ${song.artist}.\n` +
    `A ${moods[0]} ${genres[0] || "track"} that fits ${times.join(" / ")}.`;

  return {
    description,
    mood: uniq(moods),
    time: uniq(times),
    weather: uniq(weather),
    genre: genres.length ? genres : ["pop"],
    vibe: uniq([...moods, ...times, ...weather, ...genres]) as string[],
  };
}

// Build SONG_META lazily once.
let _meta: Map<string, SongMeta> | null = null;
function getMeta(): Map<string, SongMeta> {
  if (_meta) return _meta;
  const m = new Map<string, SongMeta>();
  for (const s of uniqueSongs) {
    const base = autoTag(s);
    const override = OVERRIDES[s.id];
    m.set(s.id, override ? { ...base, ...override } : base);
  }
  _meta = m;
  return m;
}
export function getSongMeta(id: string): SongMeta | undefined {
  return getMeta().get(id);
}
export function SONG_META(): Map<string, SongMeta> { return getMeta(); }

// ─── Auto time-of-day / weather helpers ─────────────────────────────────────

export function currentTimeOfDay(date: Date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5  && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  if (h >= 21 || h < 1)  return "night";
  return "lateNight";
}

/** Convert OpenWeather-ish `condition` string to our enum. */
export function normalizeWeather(condition?: string): Weather | undefined {
  if (!condition) return undefined;
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle")) return "rainy";
  if (c.includes("snow")) return "snow";
  if (c.includes("thunder") || c.includes("storm")) return "storm";
  if (c.includes("cloud")) return "cloudy";
  if (c.includes("clear") || c.includes("sun")) return "sunny";
  if (c.includes("cold") || c.includes("haze") || c.includes("mist")) return "cold";
  return undefined;
}

// ─── Recommendation core ────────────────────────────────────────────────────

const W = {
  mood:    4,
  time:    2,
  weather: 2,
  genre:   3,
  text:    1.5,
} as const;

export function recommendSongs(opts: RecommendOptions = {}, pool: Song[] = uniqueSongs): Song[] {
  const meta   = getMeta();
  const limit  = opts.limit ?? 20;
  const exclude = new Set(opts.exclude ?? []);
  const text   = opts.text?.toLowerCase().trim() || "";
  const words  = text ? text.split(/\s+/).filter(w => w.length > 2) : [];

  const scored = pool
    .filter(s => !exclude.has(s.id))
    .map(s => {
      const m = meta.get(s.id);
      if (!m) return { song: s, score: 0 };
      let score = 0;
      if (opts.mood    && m.mood.includes(opts.mood))           score += W.mood;
      if (opts.time    && m.time.includes(opts.time))           score += W.time;
      if (opts.weather && m.weather.includes(opts.weather))     score += W.weather;
      if (opts.genre   && m.genre.some(g => g.toLowerCase() === opts.genre!.toLowerCase()))
        score += W.genre;
      if (words.length) {
        const hay = (m.vibe.join(" ") + " " + m.description + " " + s.title + " " + s.artist).toLowerCase();
        for (const w of words) if (hay.includes(w)) score += W.text;
      }
      // Tiny tie-breaker so we don't always return identical order
      score += Math.random() * 0.3;
      return { song: s, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // If nothing scored (e.g. user passed no signals), return a shuffled slice.
  if (scored.length === 0) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, limit);
  }
  return scored.slice(0, limit).map(x => x.song);
}

// ─── Session play-cache ─────────────────────────────────────────────────────
//   Keeps the *Song objects* of recently played tracks in memory so repeat
//   requests don't re-hit the catalog / network. Bounded LRU.

const MAX_CACHE = 80;
const playedCache = new Map<string, Song>(); // insertion-ordered → behaves as LRU

export function rememberPlayed(song: Song): void {
  if (playedCache.has(song.id)) playedCache.delete(song.id);
  playedCache.set(song.id, song);
  while (playedCache.size > MAX_CACHE) {
    const firstKey = playedCache.keys().next().value as string | undefined;
    if (firstKey) playedCache.delete(firstKey);
  }
}

export function getCachedSong(id: string): Song | undefined {
  return playedCache.get(id);
}

export function getRecentlyPlayedCache(limit = 20): Song[] {
  return Array.from(playedCache.values()).reverse().slice(0, limit);
}

export function clearPlayedCache(): void { playedCache.clear(); }
