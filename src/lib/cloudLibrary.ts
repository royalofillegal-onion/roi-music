import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getPlaylists,
  getLikedPlaylistIds,
  replaceLibrary,
  PLAYLISTS_CHANGED_EVENT,
  type StoredPlaylist,
} from "@/lib/playlistStore";
import { useAuth } from "@/context/AuthContext";

const LIKED_SONGS_KEY = "likedSongs";
export const LIKES_RESTORED_EVENT = "roi:likes-restored";

function readLikedSongs(): string[] {
  try {
    const raw = localStorage.getItem(LIKED_SONGS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function mergePlaylists(a: StoredPlaylist[], b: StoredPlaylist[]): StoredPlaylist[] {
  const map = new Map<string, StoredPlaylist>();
  [...b, ...a].forEach((p) => {
    if (p && typeof p.id === "string") map.set(p.id, p);
  });
  return [...map.values()].sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0));
}

const uniq = (xs: string[]) => Array.from(new Set(xs.filter((x) => typeof x === "string")));

/**
 * Keeps the signed-in listener's liked songs and playlists mirrored between
 * this device and their account, so the library follows them anywhere.
 */
export function useLibrarySync(likedSongs: string[]) {
  const { user } = useAuth();
  const readyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Pull + merge on sign-in
  useEffect(() => {
    readyRef.current = false;
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("user_library")
        .select("liked_song_ids, playlists, liked_playlist_ids")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;

      const cloudLiked = (data?.liked_song_ids as string[] | null) ?? [];
      const cloudPlaylists = ((data?.playlists as unknown as StoredPlaylist[] | null) ?? []).filter(Boolean);
      const cloudPlaylistLikes = (data?.liked_playlist_ids as string[] | null) ?? [];

      const mergedLiked = uniq([...cloudLiked, ...readLikedSongs()]);
      const mergedPlaylists = mergePlaylists(getPlaylists(), cloudPlaylists);
      const mergedPlaylistLikes = uniq([...cloudPlaylistLikes, ...getLikedPlaylistIds()]);

      localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(mergedLiked));
      window.dispatchEvent(new Event(LIKES_RESTORED_EVENT));
      replaceLibrary(mergedPlaylists, mergedPlaylistLikes);

      await supabase.from("user_library").upsert(
        {
          user_id: user.id,
          liked_song_ids: mergedLiked,
          playlists: mergedPlaylists as unknown as never,
          liked_playlist_ids: mergedPlaylistLikes,
        },
        { onConflict: "user_id" }
      );
      readyRef.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Push local changes upward (debounced)
  useEffect(() => {
    if (!user) return;

    const push = () => {
      if (!readyRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void supabase.from("user_library").upsert(
          {
            user_id: user.id,
            liked_song_ids: uniq(readLikedSongs()),
            playlists: getPlaylists() as unknown as never,
            liked_playlist_ids: uniq(getLikedPlaylistIds()),
          },
          { onConflict: "user_id" }
        );
      }, 800);
    };

    push();
    window.addEventListener(PLAYLISTS_CHANGED_EVENT, push);
    return () => {
      window.removeEventListener(PLAYLISTS_CHANGED_EVENT, push);
      clearTimeout(timerRef.current);
    };
  }, [user?.id, likedSongs]);
}
