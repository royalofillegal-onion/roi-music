import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, Play, ChevronRight, Bell, Settings, MoreHorizontal, Disc3 } from "lucide-react";
import { uniqueSongs } from "@/data/allSongs";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import type { Song } from "@/data/Song";

type SearchCategory = "Top Results" | "Artists" | "Albums" | "Songs";

export function SearchView({ onClose, mongoSongs = [] }: { onClose: () => void; mongoSongs?: Song[] }) {
  const { playSong, currentSong } = usePlayer();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<SearchCategory>("Top Results");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const catalog = useMemo(() => {
    return [...mongoSongs, ...uniqueSongs].filter((song, index, list) => list.findIndex((item) => item.id === song.id) === index);
  }, [mongoSongs]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return catalog.slice(0, 30);
    return catalog.filter((s) => {
      return (
        s.title?.toLowerCase().includes(term) ||
        s.artist?.toLowerCase().includes(term) ||
        s.singer?.toLowerCase().includes(term) ||
        s.album?.toLowerCase().includes(term) ||
        s.genre?.toLowerCase().includes(term) ||
        s.language?.toLowerCase().includes(term)
      );
    }).slice(0, 80);
  }, [q, catalog]);

  const artists = useMemo(() => {
    const seen = new Set<string>();
    return results.filter((song) => {
      const key = (song.singer || song.artist).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [results]);

  const albums = useMemo(() => {
    const seen = new Set<string>();
    return results.filter((song) => {
      if (!song.album) return false;
      const key = `${song.album.toLowerCase()}-${(song.singer || song.artist).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [results]);

  const tabs: SearchCategory[] = ["Top Results", "Artists", "Albums", "Songs"];
  const visibleSongs = category === "Artists" ? artists : category === "Albums" ? albums : results;

  return (
    <div
      className="fixed inset-0 z-30 overflow-y-auto text-white animate-in fade-in slide-in-from-bottom-4 duration-200"
      style={{
        background: "radial-gradient(110% 70% at 50% -12%, #17313a 0%, #0b1a20 48%, #071219 100%)",
      }}
    >
      <div className="mx-auto max-w-[640px] px-5 pt-9 pb-36">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight">Search</h1>
          <div className="flex items-center gap-3 text-white/90">
            <button aria-label="Notifications" className="rounded-full p-1.5 transition hover:bg-white/10"><Bell className="h-5 w-5" /></button>
            <button aria-label="Settings" className="rounded-full p-1.5 transition hover:bg-white/10"><Settings className="h-5 w-5" /></button>
          </div>
        </header>

        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-[#0a1920]/90 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
          <Search className="h-[18px] w-[18px] shrink-0 text-white/75" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-white/55"
            />
            {q && (
              <button
                aria-label="Clear"
                onClick={() => setQ("")}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            )}
        </div>

        <div className="-mx-5 mt-4 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Search categories">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={category === tab}
              onClick={() => setCategory(tab)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                category === tab ? "bg-[#f4c327] font-semibold text-[#132027]" : "text-white/80 hover:bg-white/10"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-[14px] font-medium text-white/90">{q ? "Search results" : category === "Top Results" ? "Recently searched" : category}</h2>
          {q && <span className="text-xs text-white/50">{visibleSongs.length} found</span>}
        </div>

        <ul className="mt-2 space-y-0.5">
          {visibleSongs.map((song) => {
            const playing = currentSong?.id === song.id;
            const isArtist = category === "Artists";
            const isAlbum = category === "Albums";
            return (
              <li
                key={song.id}
                onClick={() => playSong(song)}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl px-1 py-2 transition-colors",
                  playing
                    ? "bg-[#f4c327]/10"
                    : "hover:bg-white/[0.06]"
                )}
              >
                <img
                  src={song.imageUrl}
                  alt=""
                  className={cn("h-11 w-11 shrink-0 object-cover", isArtist ? "rounded-full" : "rounded-lg")}
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-5 text-white">{isArtist ? song.singer || song.artist : isAlbum ? song.album : song.title}</p>
                  <p className="truncate text-[11px] leading-4 text-[#8b9aa0]">
                    {isArtist ? "Artist" : isAlbum ? `Album · ${song.singer || song.artist}` : `Song · ${song.singer || song.artist}`}
                  </p>
                </div>
                {isArtist || isAlbum ? (
                  <ChevronRight className="mr-1 h-5 w-5 shrink-0 text-white/75" />
                ) : (
                  <>
                    <span className="text-[11px] tabular-nums text-white/75">{song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, "0")}` : ""}</span>
                    <button aria-label={`Play ${song.title}`} onClick={(e) => { e.stopPropagation(); playSong(song); }} className="grid h-8 w-8 place-items-center rounded-full text-[#f4c327] opacity-0 transition group-hover:opacity-100 focus:opacity-100">
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                    </button>
                    <button aria-label={`More options for ${song.title}`} onClick={(e) => e.stopPropagation()} className="grid h-8 w-6 place-items-center text-[#f4c327]/75">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </>
                )}
              </li>
            );
          })}

          {q && visibleSongs.length === 0 && (
            <li className="py-12 text-center text-sm text-white/55">
              No matches for “{q}”. Try another search.
            </li>
          )}
        </ul>

        {!q && category === "Top Results" && results.length > 0 && (
          <div className="mt-5 flex items-center gap-2 text-[11px] text-white/45">
            <Disc3 className="h-3.5 w-3.5" /> Your music, all in one place
          </div>
        )}
      </div>
    </div>
  );
}
