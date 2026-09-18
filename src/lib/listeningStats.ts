import { useEffect, useRef, useState } from "react";
import type { Song } from "@/data/Song";

/**
 * Local listening history used for personal stats: play counts, listening
 * minutes and top artists. Stored on the device so it works signed out too.
 */

const KEY = "roi.stats.v1";
const EVENT = "roi:stats-changed";

export interface PlayEvent {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  seconds: number;
  at: number;
}

interface StatsFile {
  events: PlayEvent[];
}

const MAX_EVENTS = 1500;

function read(): StatsFile {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as StatsFile) : null;
    if (parsed && Array.isArray(parsed.events)) return parsed;
  } catch {
    /* corrupted / private mode */
  }
  return { events: [] };
}

function write(file: StatsFile) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ events: file.events.slice(-MAX_EVENTS) }));
  } catch {
    /* storage full */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function recordPlay(song: Song, seconds: number) {
  if (!song?.id || seconds < 5) return;
  const file = read();
  file.events.push({
    id: song.id,
    title: song.title,
    artist: song.singer || song.artist,
    imageUrl: song.imageUrl,
    seconds: Math.round(seconds),
    at: Date.now(),
  });
  write(file);
}

export function clearStats() {
  write({ events: [] });
}

export interface RankedItem {
  key: string;
  label: string;
  sub?: string;
  imageUrl?: string;
  plays: number;
  seconds: number;
}

export interface ListeningStats {
  totalMinutes: number;
  weekMinutes: number;
  totalPlays: number;
  weekPlays: number;
  streakDays: number;
  topSongs: RankedItem[];
  topArtists: RankedItem[];
  perDay: { label: string; minutes: number }[];
}

const DAY = 86_400_000;

function rank(events: PlayEvent[], by: "song" | "artist"): RankedItem[] {
  const map = new Map<string, RankedItem>();
  events.forEach((e) => {
    const key = by === "song" ? e.id : e.artist;
    const cur =
      map.get(key) ||
      ({
        key,
        label: by === "song" ? e.title : e.artist,
        sub: by === "song" ? e.artist : undefined,
        imageUrl: e.imageUrl,
        plays: 0,
        seconds: 0,
      } as RankedItem);
    cur.plays += 1;
    cur.seconds += e.seconds;
    map.set(key, cur);
  });
  return [...map.values()].sort((a, b) => b.seconds - a.seconds);
}

export function computeStats(events: PlayEvent[]): ListeningStats {
  const now = Date.now();
  const weekAgo = now - 7 * DAY;
  const week = events.filter((e) => e.at >= weekAgo);

  const days = new Set(events.map((e) => new Date(e.at).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(now - i * DAY).toDateString();
    if (days.has(d)) streak++;
    else if (i > 0) break;
  }

  const perDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * DAY);
    const key = d.toDateString();
    const minutes =
      events
        .filter((e) => new Date(e.at).toDateString() === key)
        .reduce((s, e) => s + e.seconds, 0) / 60;
    return { label: d.toLocaleDateString("en-US", { weekday: "narrow" }), minutes: Math.round(minutes) };
  });

  const sum = (xs: PlayEvent[]) => Math.round(xs.reduce((s, e) => s + e.seconds, 0) / 60);

  return {
    totalMinutes: sum(events),
    weekMinutes: sum(week),
    totalPlays: events.length,
    weekPlays: week.length,
    streakDays: streak,
    topSongs: rank(events, "song").slice(0, 5),
    topArtists: rank(events, "artist").slice(0, 5),
    perDay,
  };
}

export function useListeningStats(): ListeningStats {
  const [events, setEvents] = useState<PlayEvent[]>(() => read().events);
  useEffect(() => {
    const sync = () => setEvents(read().events);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return computeStats(events);
}

/** Records how long each song was actually on screen/playing. */
export function useListeningTracker(currentSong: Song | null | undefined) {
  const startedRef = useRef<number>(0);
  const songRef = useRef<Song | null>(null);

  useEffect(() => {
    const flush = () => {
      const prev = songRef.current;
      if (prev && startedRef.current) {
        recordPlay(prev, (Date.now() - startedRef.current) / 1000);
      }
    };
    flush();
    songRef.current = currentSong ?? null;
    startedRef.current = currentSong ? Date.now() : 0;

    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [currentSong?.id]);
}
