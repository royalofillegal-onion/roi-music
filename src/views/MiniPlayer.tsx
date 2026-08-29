import { Play, Pause, SkipForward, ChevronUp, Heart } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

export function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    nextSong,
    currentTime,
    duration,
    toggleLike,
    isLiked,
  } = usePlayer();
  if (!currentSong) return null;
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const liked = isLiked(currentSong.id);

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-40 px-2.5 pb-1">
      <div
        onClick={onExpand}
        role="button"
        aria-label="Expand player"
        className="mx-auto flex max-w-[560px] cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 px-2.5 py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,1)] backdrop-blur-xl transition hover:bg-zinc-900/90"
      >
        <img
          src={currentSong.imageUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">{currentSong.title}</p>
          <p className="truncate text-[11px] text-zinc-500">
            {(currentSong as any).singer || currentSong.artist}
          </p>
          <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(currentSong.id);
          }}
          aria-label="Like"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        >
          <Heart className={cn("h-4 w-4", liked ? "fill-red-600 text-red-600" : "text-zinc-400")} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black"
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
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white"
        >
          <SkipForward className="h-4 w-4" fill="currentColor" />
        </button>
        <ChevronUp className="mr-0.5 h-4 w-4 shrink-0 text-zinc-600" />
      </div>
    </div>
  );
}
