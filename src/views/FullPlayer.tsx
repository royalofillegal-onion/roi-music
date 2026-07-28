import { useEffect, useRef } from "react";
import {
  ChevronDown,
  Heart,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const fmt = (s: number) =>
  isFinite(s)
    ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
    : "0:00";

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
  } = usePlayer();

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

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
      if (e.code === "Space") { e.preventDefault(); togglePlayPause(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextSong, previousSong, togglePlayPause, onClose]);

  if (!currentSong) return null;
  const liked = isLiked(currentSong.id);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto text-white bg-black animate-in fade-in slide-in-from-bottom-8 duration-300"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto max-w-[520px] px-6 pt-4 pb-16">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Minimize"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <p className="font-caveat text-2xl">now playing</p>
          <button
            onClick={() => toggleLike(currentSong.id)}
            aria-label="Like"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <Heart className={cn("h-5 w-5", liked && "fill-white text-white")} />
          </button>
        </div>

        {/* Cover */}
        <div className="mt-8 mx-auto aspect-square w-full max-w-[380px] rounded-2xl overflow-hidden border border-white/10">
          <img
            src={currentSong.imageUrl}
            alt={currentSong.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Title */}
        <div className="mt-8 text-center">
          <h1 className="font-caveat text-5xl leading-none tracking-tight">
            {currentSong.title}
          </h1>
          <p className="mt-2 text-white/60 text-sm">
            {currentSong.singer || currentSong.artist}
            {currentSong.album ? ` · ${currentSong.album}` : ""}
          </p>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <Slider
            value={[Math.min(currentTime, duration || 0)]}
            min={0}
            max={Math.max(duration || 1, 1)}
            step={0.1}
            onValueChange={(v) => seek(v[0])}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-white/50">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Transport */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            aria-label="Shuffle"
            className={cn(
              "grid h-11 w-11 place-items-center rounded-full",
              isShuffled ? "text-white" : "text-white/40"
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
            className="grid h-16 w-16 place-items-center rounded-full bg-white text-black hover:scale-105 transition"
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
              isRepeating ? "text-white" : "text-white/40"
            )}
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        {/* Share */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigator.share?.({ title: currentSong.title, url: location.href }).catch(() => {})}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
          >
            <Share2 className="h-4 w-4" /> share
          </button>
        </div>
      </div>
    </div>
  );
}
