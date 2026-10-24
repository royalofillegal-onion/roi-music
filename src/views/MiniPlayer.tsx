import { useRef, useState } from "react";
import { Play, Pause, SkipForward, ChevronUp, Heart } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

/** Animated bars that react to playback state. */
function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-4 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[2px] rounded-full bg-[#f4c327]",
            active ? "animate-[eq_0.9s_ease-in-out_infinite]" : "h-1 opacity-40"
          )}
          style={active ? { animationDelay: `${i * 0.12}s` } : undefined}
        />
      ))}
    </span>
  );
}

export function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    nextSong,
    previousSong,
    currentTime,
    duration,
    seek,
    toggleLike,
    isLiked,
  } = usePlayer();

  const startX = useRef(0);
  const startY = useRef(0);
  const [dx, setDx] = useState(0);

  if (!currentSong) return null;
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const liked = isLiked(currentSong.id);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX - startX.current;
    const y = Math.abs(e.touches[0].clientY - startY.current);
    if (y < 30) setDx(Math.max(-120, Math.min(120, x)));
  };
  const onTouchEnd = () => {
    if (dx <= -70) nextSong();
    else if (dx >= 70) previousSong();
    setDx(0);
  };

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-40 px-2.5 pb-1">
      <div
        onClick={onExpand}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="button"
        aria-label="Expand player"
        style={{ transform: `translateX(${dx}px)`, transition: dx ? "none" : "transform 0.25s ease" }}
        className="mx-auto flex max-w-[560px] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 px-2.5 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,1)] backdrop-blur-xl transition-colors hover:bg-zinc-900/90"
      >
        <div className="relative h-11 w-11 shrink-0">
          <img src={currentSong.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
          <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/40">
            <Equalizer active={isPlaying} />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">{currentSong.title}</p>
          <p className="truncate text-[11px] text-zinc-500">
            {(currentSong as any).singer || currentSong.artist}
          </p>
          <div
            onClick={scrub}
            role="slider"
            aria-label="Seek"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            className="mt-1 h-2 w-full cursor-pointer py-[3px]"
          >
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#f4c327] shadow-[0_0_8px_rgba(244,195,39,0.6)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentSong.id);
          }}
          aria-label="Like"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition active:scale-90"
        >
          <Heart className={cn("h-4 w-4", liked ? "fill-red-600 text-red-600" : "text-zinc-400")} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black transition active:scale-90"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSong();
          }}
          aria-label="Next"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition active:scale-90"
        >
          <SkipForward className="h-4 w-4" fill="currentColor" />
        </button>
        <ChevronUp className="mr-0.5 h-4 w-4 shrink-0 text-zinc-600" />
      </div>
    </div>
  );
}
