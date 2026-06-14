// Fetches collaborative recommendations from the backend & maps song_ids
// back to local Song objects. Falls back to the locally-learned recs.
import { useEffect, useState } from "react";
import { uniqueSongs } from "@/data/allSongs";
import { Song } from "@/data/songs";
import { getToken, invokeFn } from "@/lib/session";

const CACHE_KEY = "roi_collab_recs";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry { at: number; ids: string[]; }

export function useCollabRecommendations(): { songs: Song[]; loading: boolean; refresh: () => void } {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const entry = JSON.parse(raw) as CacheEntry;
      if (Date.now() - entry.at < CACHE_TTL_MS) return entry.ids;
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(false);

  const fetchIt = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await invokeFn<{ recommendations: { song_id: string }[] }>("recommend-for-user", { token });
      const newIds = (res.recommendations ?? []).map(r => r.song_id);
      setIds(newIds);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), ids: newIds }));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const cached = (() => {
      try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as CacheEntry | null; } catch { return null; }
    })();
    if (!cached || Date.now() - cached.at > CACHE_TTL_MS) fetchIt();
  }, []);

  const songMap = new Map(uniqueSongs.map(s => [s.id, s]));
  const songs = ids.map(id => songMap.get(id)).filter(Boolean) as Song[];

  return { songs, loading, refresh: fetchIt };
}
