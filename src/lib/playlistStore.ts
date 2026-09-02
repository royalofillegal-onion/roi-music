import { useEffect, useState } from "react";
import { songsByIds } from "@/data/allSongs";
import type { Song } from "@/data/Song";

export interface StoredPlaylist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  /** true when the playlist arrived through a shared link */
  imported?: boolean;
}

const PLAYLISTS_KEY = "roi.playlists.v1";
const LIKES_KEY = "roi.playlistLikes.v1";
const EVENT = "roi:playlists-changed";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function getPlaylists(): StoredPlaylist[] {
  return read<StoredPlaylist[]>(PLAYLISTS_KEY, []);
}

export function getLikedPlaylistIds(): string[] {
  return read<string[]>(LIKES_KEY, []);
}

export function savePlaylist(name: string, songIds: string[], opts: { imported?: boolean; id?: string } = {}) {
  const list = getPlaylists();
  const id = opts.id || `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const existing = list.findIndex((p) => p.id === id);
  const playlist: StoredPlaylist = {
    id,
    name: name.trim() || "Untitled playlist",
    songIds: Array.from(new Set(songIds)),
    createdAt: Date.now(),
    imported: opts.imported,
  };
  if (existing >= 0) list[existing] = { ...list[existing], ...playlist };
  else list.unshift(playlist);
  write(PLAYLISTS_KEY, list);
  return playlist;
}

export function deletePlaylist(id: string) {
  write(PLAYLISTS_KEY, getPlaylists().filter((p) => p.id !== id));
  write(LIKES_KEY, getLikedPlaylistIds().filter((x) => x !== id));
}

export function togglePlaylistLike(id: string) {
  const likes = getLikedPlaylistIds();
  const next = likes.includes(id) ? likes.filter((x) => x !== id) : [...likes, id];
  write(LIKES_KEY, next);
  return next.includes(id);
}

/* ---------------- sharing ---------------- */

function toBase64(str: string) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64(str: string) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(s + "=".repeat((4 - (s.length % 4)) % 4))));
}

export function buildShareLink(playlist: Pick<StoredPlaylist, "name" | "songIds">): string {
  const payload = toBase64(JSON.stringify({ n: playlist.name, s: playlist.songIds }));
  return `${window.location.origin}${window.location.pathname}#playlist=${payload}`;
}

/** Reads a shared playlist from the URL hash, persists it, and clears the hash. */
export function importSharedPlaylistFromUrl(): StoredPlaylist | null {
  const match = window.location.hash.match(/playlist=([^&]+)/);
  if (!match) return null;
  try {
    const data = JSON.parse(fromBase64(match[1])) as { n?: string; s?: string[] };
    const ids = (data.s || []).filter((x) => typeof x === "string");
    if (!ids.length) return null;
    const saved = savePlaylist(data.n || "Shared playlist", ids, { imported: true });
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return saved;
  } catch {
    return null;
  }
}

/* ---------------- react binding ---------------- */

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<StoredPlaylist[]>(() => getPlaylists());
  const [likedIds, setLikedIds] = useState<string[]>(() => getLikedPlaylistIds());

  useEffect(() => {
    const sync = () => {
      setPlaylists(getPlaylists());
      setLikedIds(getLikedPlaylistIds());
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    playlists,
    likedIds,
    isPlaylistLiked: (id: string) => likedIds.includes(id),
    togglePlaylistLike,
    savePlaylist,
    deletePlaylist,
    buildShareLink,
    resolve: (p: StoredPlaylist): Song[] => songsByIds(p.songIds),
  };
}
