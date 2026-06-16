import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, Play } from "lucide-react";
import { uniqueSongs } from "@/data/allSongs";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { cloudRecordSearch } from "@/lib/cloudTracker";

export function SearchView({ onClose }: { onClose: () => void }) {
  const { playSong, currentSong } = usePlayer();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Record finished search queries to the cloud (debounced).
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => cloudRecordSearch(term), 900);
    return () => clearTimeout(t);
  }, [q]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = uniqueSongs as any[];
    if (!term) return base.slice(0, 60);
    return base.filter((s) => {
      return (
        s.title?.toLowerCase().includes(term) ||
        s.artist?.toLowerCase().includes(term) ||
        s.singer?.toLowerCase().includes(term) ||
        s.album?.toLowerCase().includes(term) ||
        s.genre?.toLowerCase().includes(term) ||
        s.language?.toLowerCase().includes(term)
      );
    }).slice(0, 120);
  }, [q]);

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto text-white animate-in fade-in slide-in-from-bottom-4 duration-200"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #4a1f7a 0%, #2a0d4d 35%, #0a0418 75%)",
      }}
    >
      <div className="mx-auto max-w-[640px] px-5 pt-6 pb-40">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/15 bg-white/8 backdrop-blur px-4 py-2.5">
            <Search className="h-4 w-4 text-white/60" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search songs, artists, albums…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/45"
            />
            {q && (
              <button
                aria-label="Clear"
                onClick={() => setQ("")}
                className="grid h-6 w-6 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/8 hover:bg-white/15 border border-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-5 text-xs uppercase tracking-widest text-white/50">
          {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Browse all"}
        </p>

        <ul className="mt-3 space-y-2">
          {results.map((song: any) => {
            const playing = currentSong?.id === song.id;
            return (
              <li
                key={song.id}
                onClick={() => playSong(song)}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition",
                  playing
                    ? "bg-fuchsia-500/15 border border-fuchsia-400/30"
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                <img
                  src={song.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{song.title}</p>
                  <p className="text-xs text-white/60 truncate">
                    {song.singer || song.artist}
                    {song.album ? ` · ${song.album}` : ""}
                  </p>
                </div>
                <button
                  aria-label="Play"
                  className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                </button>
              </li>
            );
          })}

          {q && results.length === 0 && (
            <li className="text-sm text-white/55 py-8 text-center">
              No songs match “{q}”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
