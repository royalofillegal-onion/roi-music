import { Play, Pause, SkipForward } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const { currentSong, isPlaying, togglePlayPause, nextSong, currentTime, duration } = usePlayer();
  if (!currentSong) return null;
  const pct = duration ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      onClick={onExpand}
      className="fixed bottom-3 left-3 right-3 z-40 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
    >
      <img
        src={currentSong.imageUrl}
        alt=""
        className="h-12 w-12 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-caveat text-xl leading-tight truncate">
          {currentSong.title}
        </p>
        <p className="text-xs text-white/50 truncate">
          {currentSong.singer || currentSong.artist}
        </p>
        <div className="mt-1 h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid h-10 w-10 place-items-center rounded-full bg-white text-black"
      >
        {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); nextSong(); }}
        aria-label="Next"
        className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
      >
        <SkipForward className="h-4 w-4" fill="currentColor" />
      </button>
    </div>
  );
}
