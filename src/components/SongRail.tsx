import type { Song } from "@/data/Song";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/PlayerContext";

export function SongRail({
  title,
  subtitle,
  songs,
  layout = "square",
}: {
  title: string;
  subtitle?: string;
  songs: Song[];
  layout?: "square" | "wide";
}) {
  const { playPlaylist, currentSong } = usePlayer();
  if (!songs.length) return null;

  return (
    <section className="mt-7">
      <div className="px-5">
        <h3 className="text-[15px] font-bold text-zinc-100">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] text-zinc-500">{subtitle}</p>
        )}
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {songs.map((s, i) => {
          const active = currentSong?.id === s.id;
          return (
            <button
              key={`${s.id}-${i}`}
              onClick={() => playPlaylist(songs.slice(i).concat(songs.slice(0, i)))}
              className={cn(
                "group shrink-0 text-left",
                layout === "wide" ? "w-[190px]" : "w-[124px]"
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border bg-zinc-900",
                  layout === "wide" ? "aspect-video" : "aspect-square",
                  active ? "border-red-700/70" : "border-white/5"
                )}
              >
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-black opacity-0 transition group-hover:opacity-100">
                  <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 truncate text-[12px] font-semibold",
                  active ? "text-red-500" : "text-zinc-200"
                )}
              >
                {s.title}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {(s as any).singer || s.artist}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
