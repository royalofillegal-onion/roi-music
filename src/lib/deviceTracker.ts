// Local-only per-device analytics.
// Generates a stable device ID on first run and counts plays per song.

import { Song } from "@/data/Song";

const DEVICE_ID_KEY = "roi.deviceId";
const PLAY_COUNTS_KEY = "roi.playCounts";
const SONG_META_KEY = "roi.songMeta";
const FIRST_SEEN_KEY = "roi.firstSeen";
const LAST_SEEN_KEY = "roi.lastSeen";

export interface PlayCount {
  id: string;
  count: number;
  lastPlayedAt: number;
}

export interface SongMeta {
  id: string;
  title: string;
  artist: string;
  imageUrl?: string;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
    localStorage.setItem(FIRST_SEEN_KEY, String(Date.now()));
  }
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  return id;
}

export function getFirstSeen(): number {
  return Number(localStorage.getItem(FIRST_SEEN_KEY) || Date.now());
}

export function getLastSeen(): number {
  return Number(localStorage.getItem(LAST_SEEN_KEY) || Date.now());
}

function readCounts(): Record<string, PlayCount> {
  try {
    return JSON.parse(localStorage.getItem(PLAY_COUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function readMeta(): Record<string, SongMeta> {
  try {
    return JSON.parse(localStorage.getItem(SONG_META_KEY) || "{}");
  } catch {
    return {};
  }
}

export function recordPlay(song: Song) {
  const counts = readCounts();
  const prev = counts[song.id]?.count || 0;
  counts[song.id] = { id: song.id, count: prev + 1, lastPlayedAt: Date.now() };
  localStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify(counts));

  const meta = readMeta();
  meta[song.id] = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    imageUrl: song.imageUrl,
  };
  localStorage.setItem(SONG_META_KEY, JSON.stringify(meta));
}

export function getTopPlayed(limit = 20): Array<PlayCount & SongMeta> {
  const counts = readCounts();
  const meta = readMeta();
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((c) => ({ ...c, ...(meta[c.id] || { id: c.id, title: c.id, artist: "Unknown" }) }));
}

export function getTotalPlays(): number {
  return Object.values(readCounts()).reduce((s, c) => s + c.count, 0);
}

export function getLikedMeta(likedIds: string[]): SongMeta[] {
  const meta = readMeta();
  return likedIds.map((id) => meta[id]).filter(Boolean) as SongMeta[];
}

export function getAllMeta(): Record<string, SongMeta> {
  return readMeta();
}

// Recommendations FOR this device, derived from local top-played + liked.
// (No backend = no true cross-user data.)
export function getDeviceRecommendations(allSongs: Song[], limit = 15): Song[] {
  const top = getTopPlayed(50);
  const artistScore = new Map<string, number>();
  top.forEach((t) => {
    if (!t.artist) return;
    artistScore.set(t.artist, (artistScore.get(t.artist) || 0) + t.count);
  });
  const playedIds = new Set(top.map((t) => t.id));
  return allSongs
    .filter((s) => !playedIds.has(s.id))
    .map((s) => ({ s, score: artistScore.get(s.artist) || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}
