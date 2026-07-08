import { useCallback, useEffect, useState } from "react";

const KEY = "roi.likedPlaylists";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Instant + persistent "like" state for playlists.
 * Broadcasts a `roi:likedPlaylists` event so every subscriber updates in sync.
 */
export function usePlaylistLikes() {
  const [liked, setLiked] = useState<string[]>(() => read());

  useEffect(() => {
    const handler = () => setLiked(read());
    window.addEventListener("roi:likedPlaylists", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("roi:likedPlaylists", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setLiked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("roi:likedPlaylists"));
      return next;
    });
  }, []);

  const isLiked = useCallback((id: string) => liked.includes(id), [liked]);

  return { liked, isLiked, toggle };
}
