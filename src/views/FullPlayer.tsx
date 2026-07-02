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
  Infinity as InfinityIcon,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { uniqueSongs } from "@/data/allSongs";
import { getLyricsForSong } from "@/data/lyrics";
import { buildShareUrl } from "@/lib/shareLink";
import { toast } from "sonner";

const fmt = (s: number) =>
  isFinite(s)
    ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
    : "0:00";

type Tab = "lyrics" | "related" | "credits" | "about";

export function FullPlayer({ onClose }: { onClose: () => void }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
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
    continuousPlay,
    toggleContinuousPlay,
    continuousUntil,
  } = usePlayer();

  const [tab, setTab] = useState<Tab>("lyrics");
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

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
    }
    startX.current = startY.current = null;
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

  const lyrics = useMemo(
    () => getLyricsForSong(currentSong?.id),
    [currentSong?.id]
  );

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto text-white animate-in fade-in slide-in-from-bottom-8 duration-300"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #4a1f7a 0%, #21093e 50%, #0a0418 100%)",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto max-w-[560px] px-5 pt-4 pb-32">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Minimize"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/8 hover:bg-white/15"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-widest text-white/70">
              PLAYING FROM ALBUM
            </p>
            <p className="text-sm font-semibold">{currentSong.album || currentSong.artist}</p>
          </div>
          <button
            aria-label="More"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/8 hover:bg-white/15"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Cover */}
        <div className="mt-6 mx-auto w-full aspect-square max-w-[420px] rounded-3xl overflow-hidden shadow-[0_40px_120px_-20px_rgba(168,85,247,0.6)] border border-white/10">
          <img
            src={currentSong.imageUrl}
            alt={currentSong.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Title row */}
        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight truncate">
              {currentSong.title}
            </h1>
            <p className="mt-1 text-white/65">
              {currentSong.singer || currentSong.artist}
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-200 font-semibold">
                {currentSong.genre ? "FLAC" : "HQ"}
              </span>
              <span className="text-white/60">
                {currentSong.genre || "Music"} · {currentSong.language || "—"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike(currentSong.id)}
              aria-label="Like"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/8 hover:bg-white/15"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  liked ? "fill-fuchsia-400 text-fuchsia-400" : ""
                )}
              />
            </button>
            <button
              aria-label="Share"
              onClick={async () => {
                const url = buildShareUrl(currentSong.id);
                const data = {
                  title: currentSong.title,
                  text: `Listen to "${currentSong.title}" by ${currentSong.singer || currentSong.artist} 🎵`,
                  url,
                };
                try {
                  if (navigator.share) {
                    await navigator.share(data);
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast.success("Share link copied!");
                  }
                } catch {
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Share link copied!");
                  } catch { /* ignore */ }
                }
              }}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/8 hover:bg-white/15"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <Slider
            value={[Math.min(currentTime, duration || 0)]}
            min={0}
            max={Math.max(duration || 1, 1)}
            step={0.1}
            onValueChange={(v) => seek(v[0])}
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-white/60">
            <span>{fmt(currentTime)}</span>
            <span>-{fmt(Math.max(0, (duration || 0) - currentTime))}</span>
          </div>
        </div>

        {/* Transport */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            aria-label="Shuffle"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full",
              isShuffled ? "text-fuchsia-300" : "text-white/70"
            )}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button
            onClick={previousSong}
            aria-label="Previous"
            className="grid h-12 w-12 place-items-center rounded-full text-white"
          >
            <SkipBack className="h-7 w-7" fill="currentColor" />
          </button>
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-2xl ring-4 ring-fuchsia-500/60 hover:scale-105 transition"
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
            className="grid h-12 w-12 place-items-center rounded-full text-white"
          >
            <SkipForward className="h-7 w-7" fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            aria-label="Repeat"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full",
              isRepeating ? "text-fuchsia-300" : "text-white/70"
            )}
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        {/* Non-stop 1H toggle (replaces volume) */}
        <button
          onClick={toggleContinuousPlay}
          className={cn(
            "mt-5 w-full flex items-center gap-3 rounded-2xl px-4 py-3 border transition",
            continuousPlay
              ? "bg-gradient-to-r from-fuchsia-600/40 to-purple-600/40 border-fuchsia-400/50 text-white"
              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
          )}
          aria-pressed={continuousPlay}
        >
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full",
              continuousPlay ? "bg-fuchsia-500 text-white" : "bg-white/10 text-white/70"
            )}
          >
            <InfinityIcon className="h-5 w-5" />
          </span>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">
              Non-stop Play {continuousPlay ? "· ON" : "· OFF"}
            </p>
            <p className="text-[11px] text-white/60">
              {continuousPlay
                ? continuousUntil
                  ? `Auto-plays for ${Math.max(1, Math.ceil((continuousUntil - Date.now()) / 60000))} min and keeps going`
                  : "Auto-plays for 1 hour and keeps going"
                : "Tap to keep music playing non-stop"}
            </p>
          </div>
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition",
              continuousPlay ? "bg-fuchsia-500" : "bg-white/15"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                continuousPlay ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </span>
        </button>

        {/* Tabs */}
        <div className="mt-8 border-b border-white/10">
          <div className="flex gap-6 text-sm">
            {(["lyrics", "related", "credits", "about"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "pb-3 -mb-px capitalize transition relative",
                  tab === t
                    ? "text-fuchsia-300 font-semibold"
                    : "text-white/55 hover:text-white/80"
                )}
              >
                {t === "about" ? "About Song" : t}
                {tab === t && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-fuchsia-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 min-h-[180px]">
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
      </div>
    </div>
  );
}
