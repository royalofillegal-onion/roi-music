// Mirrors player events (play / like / unlike) to the backend so collaborative
// recommendations and admin analytics work. Mounted once near the app root.
import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { getToken, invokeFn } from "@/lib/session";

export function usePlayerEventSync() {
  const { currentSong, likedSongs } = usePlayer();
  const lastSongRef = useRef<string | null>(null);
  const songStartRef = useRef<number>(Date.now());
  const lastLikedRef = useRef<Set<string>>(new Set());

  // Track plays: when currentSong changes, fire a play event for the PREVIOUS song
  // with listened_seconds = elapsed time. Skipped = listened < 25s & < 30% of song.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      lastSongRef.current = currentSong?.id ?? null;
      songStartRef.current = Date.now();
      return;
    }
    if (lastSongRef.current && lastSongRef.current !== currentSong?.id) {
      const listened = Math.floor((Date.now() - songStartRef.current) / 1000);
      const song = (window as any).__lastPlayerSong as any;
      if (song) {
        invokeFn("track-event", {
          token,
          type: "play",
          song: {
            id: song.id, title: song.title, artist: song.artist, album: song.album,
            genre: song.genre, sync: song.sync, language: song.language,
          },
          listened_seconds: listened,
          skipped: listened < 25,
        }).catch(() => {});
      }
    }
    lastSongRef.current = currentSong?.id ?? null;
    songStartRef.current = Date.now();
    if (currentSong) (window as any).__lastPlayerSong = currentSong;
  }, [currentSong?.id]);

  // Track likes / unlikes (diff against last snapshot).
  useEffect(() => {
    const token = getToken();
    if (!token) { lastLikedRef.current = new Set(likedSongs); return; }
    const prev = lastLikedRef.current;
    const next = new Set(likedSongs);
    const added = [...next].filter((id) => !prev.has(id));
    const removed = [...prev].filter((id) => !next.has(id));
    const findSong = (id: string) =>
      (window as any).__lastPlayerSong?.id === id ? (window as any).__lastPlayerSong : { id };
    for (const id of added) {
      invokeFn("track-event", { token, type: "like", song: findSong(id) }).catch(() => {});
    }
    for (const id of removed) {
      invokeFn("track-event", { token, type: "unlike", song: { id } }).catch(() => {});
    }
    lastLikedRef.current = next;
  }, [likedSongs]);
}
