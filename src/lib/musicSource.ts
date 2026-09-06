import { useEffect, useRef, useState } from "react";
import type { Song } from "@/data/Song";

/**
 * Real music source for the Discover feed.
 * Uses the public iTunes Search API, which returns streamable preview
 * audio (m4a) plus high-res artwork, with permissive CORS.
 */

const ENDPOINT = "https://itunes.apple.com/search";

export const DISCOVER_TERMS = [
  "telugu hits",
  "hindi songs",
  "tamil hits",
  "bollywood",
  "punjabi",
  "indie pop",
  "lofi",
  "electronic",
  "rock",
  "hip hop",
  "romantic",
  "workout",
];

interface ITunesTrack {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
  releaseDate?: string;
}

function toSong(t: ITunesTrack): Song | null {
  if (!t.previewUrl || !t.trackName || !t.artistName) return null;
  return {
    id: `itunes-${t.trackId}`,
    title: t.trackName,
    artist: t.artistName,
    singer: t.artistName,
    album: t.collectionName,
    imageUrl: (t.artworkUrl100 || "").replace("100x100bb", "600x600bb"),
    audioUrl: t.previewUrl,
    duration: Math.round((t.trackTimeMillis ?? 30000) / 1000),
    genre: t.primaryGenreName,
    year: t.releaseDate ? new Date(t.releaseDate).getFullYear() : undefined,
  };
}

const memory = new Map<string, Song[]>();

export async function fetchTracks(term: string, limit = 25): Promise<Song[]> {
  const key = `${term}|${limit}`;
  if (memory.has(key)) return memory.get(key)!;
  try {
    const url = `${ENDPOINT}?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: ITunesTrack[] };
    const songs = (data.results || []).map(toSong).filter(Boolean) as Song[];
    memory.set(key, songs);
    return songs;
  } catch {
    return [];
  }
}

function dedupe(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((s) => {
    const k = `${s.title.toLowerCase()}|${s.artist.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Loads a pool of real streamable tracks and keeps fetching more
 * search terms on demand, so the Discover feed never runs dry.
 */
export function useLiveMusicPool() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const cursor = useRef(0);
  const busy = useRef(false);

  const loadMore = async (count = 3) => {
    if (busy.current || cursor.current >= DISCOVER_TERMS.length) return;
    busy.current = true;
    const terms = DISCOVER_TERMS.slice(cursor.current, cursor.current + count);
    cursor.current += count;
    const batches = await Promise.all(terms.map((t) => fetchTracks(t)));
    setSongs((prev) => dedupe([...prev, ...shuffle(batches.flat())]));
    setLoading(false);
    busy.current = false;
  };

  useEffect(() => {
    void loadMore(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { songs, loading, loadMore, exhausted: cursor.current >= DISCOVER_TERMS.length };
}
