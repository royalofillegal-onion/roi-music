import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  ArrowUp,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { uniqueSongs } from "@/data/allSongs";
import { getLyricsForSong } from "@/data/lyrics";
import { buildRails } from "@/lib/recos";
import { SongRail } from "@/components/SongRail";

const fmt = (s: number) =>
  isFinite(s)
    ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
    : "0:00";

type Tab = "lyrics" | "queue" | "related" | "credits" | "about";

export function FullPlayer({ onClose }: { onClose: () => void }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    seek,
    togglePlayPause,
    nextSong,
    previousSong,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    isRepeating,
    toggleLike,
    isLiked,
    playSong,
    queue,
    recentlyPlayed,
  } = usePlayer();

  const [tab, setTab] = useState<Tab>("lyrics");
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const lastTapAt = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const tabContentRef = useRef<HTMLDivElement | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [showLyricsFace, setShowLyricsFace] = useState(false);

  // Swipe gestures: left/right to skip tracks, down to close.
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null || startY.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextSong();
      else previousSong();
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
    } else if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      const now = Date.now();
      if (now - lastTapAt.current < 320 && lyrics) {
        setShowLyricsFace((visible) => !visible);
        lastTapAt.current = 0;
      } else {
        lastTapAt.current = now;
      }
    }
    startX.current = startY.current = null;
  };

  const openTab = (nextTab: Tab) => {
    setTab(nextTab);
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      const content = tabContentRef.current;
      if (container && content) {
        container.scrollTo({ top: Math.max(0, content.offsetTop - 24), behavior: "smooth" });
      }
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextSong();
      if (e.key === "ArrowLeft") previousSong();
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextSong, previousSong, togglePlayPause, onClose]);

  // Related = same artist / movie / album as the current song.
  const related = useMemo(() => {
    if (!currentSong) return [];
    const artist = (currentSong.artist || "").toLowerCase();
    const album = (currentSong.album || "").toLowerCase();
    const singer = ((currentSong as any).singer || "").toLowerCase();
    return uniqueSongs
      .filter((s: any) => {
        if (s.id === currentSong.id) return false;
        const sArtist = (s.artist || "").toLowerCase();
        const sAlbum = (s.album || "").toLowerCase();
        const sSinger = (s.singer || "").toLowerCase();
        return (
          (artist && sArtist === artist) ||
          (album && sAlbum === album) ||
          (singer && sSinger === singer)
        );
      })
      .slice(0, 8);
  }, [currentSong?.id]);

  const rails = useMemo(
    () => buildRails(currentSong ?? null, recentlyPlayed as any),
    [currentSong?.id]
  );

  const lyrics = useMemo(
    () => getLyricsForSong(currentSong?.id),
    [currentSong?.id]
  );

  useEffect(() => {
    setShowLyricsFace(false);
    lastTapAt.current = 0;
  }, [currentSong?.id]);

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);
  const themeSeed = Array.from(currentSong.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const playerBackground = themeSeed % 2 === 0
    ? "radial-gradient(100% 70% at 50% 0%, #8a5a38 0%, #56351f 52%, #281b15 100%)"
    : "radial-gradient(100% 70% at 50% 0%, #527c72 0%, #315c54 52%, #183a36 100%)";

  return (
    <div
      ref={scrollRef}
      onScroll={(e) => setShowTop((e.target as HTMLElement).scrollTop > 320)}
      className="fixed inset-0 z-50 overflow-y-auto text-white animate-in fade-in slide-in-from-bottom-8 duration-300"
      style={{
        background: playerBackground,
      }}
    >
      <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">

        {/* Top bar */}
        <div className="relative flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Minimize"
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/65">Playing from</p>
            <p className="max-w-[190px] truncate text-[11px] font-semibold text-white/90">{currentSong.album || currentSong.artist}</p>
          </div>
          <button
            aria-label="More"
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/10"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Track metadata */}
        <div className="mt-4 text-center">
          <h1 className="truncate text-[20px] font-semibold leading-tight">{currentSong.title}</h1>
          <p className="mt-1 text-[12px] text-white/70">{currentSong.singer || currentSong.artist}</p>
        </div>

        {/* Progress */}
        <div className="mt-4 [&_[data-radix-collection-item]]:border-[#f2cb85] [&_[data-radix-collection-item]]:bg-[#f2cb85] [&_[data-radix-collection-item]]:ring-[#f2cb85] [&_span.bg-primary]:bg-[#f2cb85] [&_span.bg-secondary]:bg-white/25">
          <Slider
            value={[Math.min(currentTime, duration || 0)]}
            min={0}
            max={Math.max(duration || 1, 1)}
            step={0.1}
            onValueChange={(v) => seek(v[0])}
          />
          <div className="mt-1 flex items-center justify-between text-[9px] text-white/65">
            <span>{fmt(currentTime)}</span>
            <span>-{fmt(Math.max(0, (duration || 0) - currentTime))}</span>
          </div>
        </div>

        {/* Circular album artwork — swipe to change tracks */}
        <div className="flex flex-1 items-center justify-center py-5 [perspective:1000px]">
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onDoubleClick={() => { if (lyrics) setShowLyricsFace((visible) => !visible); }}
            role={lyrics ? "button" : undefined}
            aria-label={lyrics ? "Double tap to flip between album art and lyrics" : undefined}
            className="relative aspect-square w-[min(72vw,310px)] cursor-pointer rounded-full [transform-style:preserve-3d] transition-transform duration-500"
            style={{ transform: showLyricsFace && lyrics ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <div className="absolute inset-0 rounded-full border border-[#f2cb85]/80 p-[9px] shadow-[0_22px_65px_-22px_rgba(0,0,0,.7)] [backface-visibility:hidden]">
              <span className="pointer-events-none absolute inset-[5px] rounded-full border border-[#f2cb85]/25" />
              <img
                src={currentSong.imageUrl}
                alt={currentSong.title}
                className="h-full w-full rounded-full border border-white/10 object-cover"
              />
              <span className="absolute left-[7%] top-[68%] h-3 w-3 rounded-full border border-[#f4d59d] bg-[#f4d59d]/30 shadow-[0_0_14px_rgba(244,213,157,.8)]" />
            </div>
            {lyrics && (
              <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-full border border-[#f2cb85]/80 bg-black/25 px-8 py-10 text-center shadow-[0_22px_65px_-22px_rgba(0,0,0,.7)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f2cb85]">Lyrics</p>
                <p className="overflow-y-auto whitespace-pre-line text-[12px] leading-relaxed text-white/90 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{lyrics}</p>
                <p className="mt-2 shrink-0 text-[9px] text-white/50">Double tap to return</p>
              </div>
            )}
          </div>
        </div>

        {/* Transport */}
        <div className="mt-1 flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            aria-label="Shuffle"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full",
              isShuffled ? "text-[#f2cb85]" : "text-white/70"
            )}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button
            onClick={previousSong}
            aria-label="Previous"
            className="grid h-11 w-11 place-items-center rounded-full text-white/90"
          >
            <SkipBack className="h-7 w-7" fill="currentColor" />
          </button>
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#202421] shadow-[0_8px_25px_rgba(0,0,0,.22)] transition hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7" fill="currentColor" />
            ) : (
              <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
            )}
          </button>
          <button
            onClick={nextSong}
            aria-label="Next"
            className="grid h-11 w-11 place-items-center rounded-full text-white/90"
          >
            <SkipForward className="h-7 w-7" fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            aria-label="Repeat"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full",
              isRepeating ? "text-[#f2cb85]" : "text-white/70"
            )}
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        {/* Volume + audio settings */}
        <div className="mt-4 flex items-center gap-3 [&_[data-radix-collection-item]]:border-[#f2cb85] [&_[data-radix-collection-item]]:bg-[#f2cb85] [&_[data-radix-collection-item]]:ring-[#f2cb85] [&_span.bg-primary]:bg-[#f2cb85] [&_span.bg-secondary]:bg-white/25">
          <Volume2 className="h-4 w-4 text-white/75" />
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={(v) => setVolume(v[0])}
            className="flex-1"
          />
          {null}
        </div>

        {/* Tabs */}
        <div ref={tabContentRef} className="mt-5 min-h-[180px] scroll-mt-6">
          {tab === "lyrics" && (
            lyrics ? (
              <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line">
                {lyrics}
              </p>
            ) : (
              <p className="text-sm text-white/60 leading-relaxed">
                Lyrics for “{currentSong.title}” aren't available yet.
              </p>
            )
          )}

          {tab === "queue" && (
            <ul className="space-y-1.5">
              {(queue || []).length === 0 && (
                <li className="text-sm text-white/55">Queue is empty — songs auto-play next.</li>
              )}
              {(queue || []).map((s: any, i: number) => (
                <li key={`${s.id}-${i}`}>
                  <button
                    onClick={() => playSong(s)}
                    className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left hover:bg-white/5"
                  >
                    <span className="w-4 text-xs text-white/40">{i + 1}</span>
                    <img src={s.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{s.title}</span>
                      <span className="block truncate text-xs text-white/55">
                        {s.singer || s.artist}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === "related" && (
            <div className="grid grid-cols-2 gap-4">
              {related.map((s) => (
                <button
                  key={s.id}
                  onClick={() => playSong(s)}
                  className="text-left"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="h-full w-full object-cover hover:scale-105 transition"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold truncate">{s.title}</p>
                  <p className="text-xs text-white/60 truncate">
                    {(s as any).singer || s.artist}
                  </p>
                </button>
              ))}
            </div>
          )}

          {tab === "credits" && (
            <ul className="text-sm space-y-2 text-white/80">
              <li><span className="text-white/50 w-24 inline-block">Album</span>{currentSong.singer || currentSong.artist}</li>
              <li><span className="text-white/50 w-24 inline-block">Song</span>{currentSong.album || "—"}</li>
              <li><span className="text-white/50 w-24 inline-block">Year</span>{currentSong.year || "—"}</li>
              <li><span className="text-white/50 w-24 inline-block">Language</span>{currentSong.language || "—"}</li>
              <li><span className="text-white/50 w-24 inline-block">Genre</span>{currentSong.genre || "—"}</li>
            </ul>
          )}

          {tab === "about" && (
            <p className="text-sm text-white/75 leading-relaxed">
              {currentSong.title} by {currentSong.singer || currentSong.artist}.
              Enjoy lossless streaming, lock-screen controls, and free routing
              to your wired or Bluetooth headphones from the audio settings.
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="-mx-5 mt-4">
          {rails.map((r) => (
            <SongRail
              key={r.id}
              title={r.title}
              subtitle={r.subtitle}
              songs={r.songs}
              layout={r.layout}
            />
          ))}
        </div>
      </div>

      <nav aria-label="Player sections" className="fixed bottom-0 left-0 right-0 z-[51] border-t border-white/15 bg-[#171c19]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,.16)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[560px] items-stretch justify-around px-2">
          {(["lyrics", "queue", "related", "credits", "about"] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-current={tab === item ? "page" : undefined}
              onClick={() => openTab(item)}
              className={cn(
                "relative flex min-w-0 flex-1 items-center justify-center px-1 py-3 text-[12px] font-semibold capitalize transition-colors",
                tab === item ? "text-[#f2cb85]" : "text-white/60 hover:text-white/85"
              )}
            >
              {item === "about" ? "About" : item}
              {tab === item && <span className="absolute left-1/2 top-0 h-0.5 w-7 -translate-x-1/2 rounded-full bg-[#f2cb85]" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 right-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-[#f4c327]/30 bg-[#1b211b]/90 text-[#f4c327] shadow-lg backdrop-blur transition active:scale-90"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
