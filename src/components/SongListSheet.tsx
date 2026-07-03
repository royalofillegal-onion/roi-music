import { Play, Shuffle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePlayer } from "@/context/PlayerContext";
import { Marquee } from "@/components/Marquee";
import { cn } from "@/lib/utils";
import type { Song } from "@/data/Song";

/**
 * Spotify-style detail sheet used for playlists and artist collections.
 * Shows a big header (cover, title, subtitle), Play + Shuffle actions,
 * then the full song list.
 */
export function SongListSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  cover,
  covers,
  emoji,
  songs,
  kind = "Playlist",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  subtitle?: string;
  cover?: string;
  covers?: string[];
  emoji?: string;
  songs: Song[];
  kind?: string;
}) {
  const { playSong, playPlaylist, currentSong } = usePlayer();

  const playAll = () => {
    if (songs.length > 0) playPlaylist(songs);
  };
  const shufflePlay = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playPlaylist(shuffled);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#120726] border-l border-white/10 text-white p-0 flex flex-col"
      >
        {/* Header */}
        <div
          className="relative px-5 pt-12 pb-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.35) 0%, rgba(18,7,38,0) 100%)",
          }}
        >
          <div className="flex gap-4">
            <div className="relative h-28 w-28 rounded-2xl overflow-hidden border border-white/10 shadow-xl shrink-0">
              {covers && covers.length >= 4 ? (
                <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                  {covers.slice(0, 4).map((c, i) => (
                    <img key={i} src={c} alt="" className="h-full w-full object-cover" />
                  ))}
                </div>
              ) : cover ? (
                <img src={cover} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-fuchsia-500/30 grid place-items-center text-3xl">
                  {emoji || "🎵"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-end">
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                {kind}
              </p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight line-clamp-2">
                {emoji && <span className="mr-1">{emoji}</span>}
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-xs text-white/60 truncate">{subtitle}</p>
              )}
              <p className="text-[11px] text-white/50 mt-0.5">{songs.length} songs</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={playAll}
              className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Play
            </button>
            <button
              onClick={shufflePlay}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/15 border border-white/10"
              aria-label="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto px-2 pb-24">
          <ul className="space-y-1">
            {songs.map((s, i) => {
              const playing = currentSong?.id === s.id;
              return (
                <li
                  key={s.id}
                  onClick={() => playSong(s)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition",
                    playing
                      ? "bg-fuchsia-500/15 border border-fuchsia-400/30"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <span className="w-5 text-center text-[11px] text-white/40 shrink-0">
                    {i + 1}
                  </span>
                  <img
                    src={s.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <Marquee
                      text={s.title}
                      className={cn(
                        "text-sm font-semibold",
                        playing && "text-fuchsia-300"
                      )}
                    />
                    <p className="text-[11px] text-white/55 truncate">
                      {s.singer || s.artist}
                    </p>
                  </div>
                  <button
                    aria-label="Play"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(s);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 ml-0.5" fill="currentColor" />
                  </button>
                </li>
              );
            })}
            {songs.length === 0 && (
              <p className="text-center text-sm text-white/55 py-10">
                No songs to show.
              </p>
            )}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
