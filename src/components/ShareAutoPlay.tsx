import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { getSharedSongFromUrl } from "@/lib/shareLink";
import type { Song } from "@/data/Song";

/**
 * Detects a shared link like /s/<hash> on first load, then auto-plays the
 * song. If the browser blocks autoplay (no user gesture yet), it shows a
 * one-tap overlay so the visitor lands straight on the track.
 */
export function ShareAutoPlay() {
  const { playSong, isPlaying } = usePlayer();
  const [pending, setPending] = useState<Song | null>(null);

  useEffect(() => {
    const song = getSharedSongFromUrl();
    if (!song) return;

    // Clean the URL so refreshes don't re-trigger and routing stays at "/".
    try {
      window.history.replaceState({}, "", "/");
    } catch { /* ignore */ }

    // Try to autoplay immediately.
    playSong(song);

    // If autoplay was blocked, surface the tap overlay after a beat.
    const t = setTimeout(() => {
      const audio = document.querySelector("audio");
      if (!audio || audio.paused) setPending(song);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPlaying) setPending(null);
  }, [isPlaying]);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0a0418]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <button
        onClick={() => { playSong(pending); setPending(null); }}
        className="flex flex-col items-center gap-5 text-center px-8"
      >
        <div className="relative">
          <img
            src={pending.imageUrl}
            alt={pending.title}
            className="h-44 w-44 rounded-3xl object-cover shadow-[0_30px_80px_-10px_rgba(168,85,247,0.7)] border border-white/10"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-2xl ring-4 ring-fuchsia-500/60">
              <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
            </span>
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-widest text-fuchsia-300">SHARED WITH YOU</p>
          <h2 className="mt-1 text-xl font-bold text-white">{pending.title}</h2>
          <p className="text-sm text-white/60">{pending.singer || pending.artist}</p>
          <p className="mt-4 text-sm text-white/70">Tap to play</p>
        </div>
      </button>
    </div>
  );
}
