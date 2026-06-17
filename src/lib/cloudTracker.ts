// Cross-device analytics synced to Lovable Cloud.
// Every device auto-generates an ID (see deviceTracker) and mirrors its
// plays / likes / searches to the cloud so the admin panel can see ALL users
// and so we can build cross-user (collaborative) recommendations.

import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceTracker";
import type { Song } from "@/data/Song";

// The generated types file may not yet know about these tables, so we use a
// loosely-typed client to avoid type friction.
const db = supabase as any;

export interface CloudSongMeta {
  song_id: string;
  title: string;
  artist?: string | null;
  image_url?: string | null;
}

/** Register / refresh this device in the cloud. Safe to call often. */
export async function syncDevice(): Promise<void> {
  try {
    const id = getDeviceId();
    await db.from("devices").upsert(
      { device_id: id, last_seen: new Date().toISOString() },
      { onConflict: "device_id" }
    );
  } catch {
    /* offline-safe */
  }
}

/** Record a play in the cloud, incrementing the per-device count. */
export async function cloudRecordPlay(song: Song): Promise<void> {
  try {
    const device_id = getDeviceId();
    // Read current count, then upsert incremented value.
    const { data } = await db
      .from("plays")
      .select("play_count")
      .eq("device_id", device_id)
      .eq("song_id", song.id)
      .maybeSingle();
    const nextCount = (data?.play_count ?? 0) + 1;
    await db.from("plays").upsert(
      {
        device_id,
        song_id: song.id,
        title: song.title,
        artist: song.artist,
        image_url: song.imageUrl,
        play_count: nextCount,
        last_played_at: new Date().toISOString(),
      },
      { onConflict: "device_id,song_id" }
    );
  } catch {
    /* offline-safe */
  }
}

/** Add a like in the cloud. */
export async function cloudAddLike(song: Song): Promise<void> {
  try {
    const device_id = getDeviceId();
    await db.from("likes").upsert(
      {
        device_id,
        song_id: song.id,
        title: song.title,
        artist: song.artist,
        image_url: song.imageUrl,
      },
      { onConflict: "device_id,song_id" }
    );
  } catch {
    /* offline-safe */
  }
}

/** Remove a like in the cloud. */
export async function cloudRemoveLike(songId: string): Promise<void> {
  try {
    const device_id = getDeviceId();
    await db.from("likes").delete().eq("device_id", device_id).eq("song_id", songId);
  } catch {
    /* offline-safe */
  }
}

/** Record a search query in the cloud. */
export async function cloudRecordSearch(query: string): Promise<void> {
  const q = query.trim();
  if (!q) return;
  try {
    const device_id = getDeviceId();
    await db.from("searches").insert({ device_id, query: q });
  } catch {
    /* offline-safe */
  }
}

// ---------- Admin / analytics reads (all devices) ----------

export interface DeviceRow {
  device_id: string;
  first_seen: string;
  last_seen: string;
}
export interface PlayRow {
  device_id: string;
  song_id: string;
  title: string;
  artist: string | null;
  image_url: string | null;
  play_count: number;
  last_played_at: string;
}
export interface LikeRow {
  device_id: string;
  song_id: string;
  title: string;
  artist: string | null;
  image_url: string | null;
  created_at: string;
}
export interface SearchRow {
  device_id: string;
  query: string;
  searched_at: string;
}

export async function fetchAllDevices(): Promise<DeviceRow[]> {
  if (!db) return [];
  try {
    const { data } = await db.from("devices").select("*").order("last_seen", { ascending: false });
    return data ?? [];
  } catch { return []; }
}
export async function fetchAllPlays(): Promise<PlayRow[]> {
  if (!db) return [];
  try {
    const { data } = await db.from("plays").select("*").order("play_count", { ascending: false });
    return data ?? [];
  } catch { return []; }
}
export async function fetchAllLikes(): Promise<LikeRow[]> {
  if (!db) return [];
  try {
    const { data } = await db.from("likes").select("*").order("created_at", { ascending: false });
    return data ?? [];
  } catch { return []; }
}
export async function fetchAllSearches(): Promise<SearchRow[]> {
  if (!db) return [];
  try {
    const { data } = await db.from("searches").select("*").order("searched_at", { ascending: false }).limit(500);
    return data ?? [];
  } catch { return []; }
}

/**
 * Collaborative recommendations.
 * For the target device, find OTHER devices that share songs (plays or likes)
 * with it, then recommend the songs those similar devices played/liked that the
 * target device hasn't heard yet. If A plays a song B also plays, A's other
 * songs are suggested to B and vice-versa.
 */
export function collaborativeRecsForDevice(
  deviceId: string,
  plays: PlayRow[],
  likes: LikeRow[]
): CloudSongMeta[] {
  // Build per-device song sets (plays + likes treated as "engaged").
  const deviceSongs = new Map<string, Map<string, CloudSongMeta>>();
  const add = (d: string, m: CloudSongMeta) => {
    if (!deviceSongs.has(d)) deviceSongs.set(d, new Map());
    deviceSongs.get(d)!.set(m.song_id, m);
  };
  plays.forEach((p) =>
    add(p.device_id, { song_id: p.song_id, title: p.title, artist: p.artist, image_url: p.image_url })
  );
  likes.forEach((l) =>
    add(l.device_id, { song_id: l.song_id, title: l.title, artist: l.artist, image_url: l.image_url })
  );

  const mine = deviceSongs.get(deviceId);
  if (!mine || mine.size === 0) return [];
  const mineIds = new Set(mine.keys());

  // Score candidate songs by how many similar devices engaged with them.
  const scores = new Map<string, { meta: CloudSongMeta; score: number }>();
  for (const [other, songs] of deviceSongs) {
    if (other === deviceId) continue;
    // similarity = number of shared songs
    let shared = 0;
    for (const id of songs.keys()) if (mineIds.has(id)) shared++;
    if (shared === 0) continue;
    for (const [id, meta] of songs) {
      if (mineIds.has(id)) continue; // already engaged by target
      const prev = scores.get(id);
      const score = (prev?.score ?? 0) + shared;
      scores.set(id, { meta, score });
    }
  }

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((x) => x.meta);
}
