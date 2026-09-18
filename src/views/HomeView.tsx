import { useMemo } from "react";
import { Play, Heart, MapPin, Search, SlidersHorizontal, Flame, Radio } from "lucide-react";
import { popularSongs, uniqueSongs } from "@/data/allSongs";
import { usePlayer } from "@/context/PlayerContext";
import { useWeather } from "@/hooks/useWeather";
import { useListeningStats } from "@/lib/listeningStats";
import { buildRadio } from "@/lib/radio";
import { cn } from "@/lib/utils";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

const todayStr = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

export function HomeView({
  onOpenSearch,
}: { onOpenSearch?: () => void } = {}) {
  const { playSong, playPlaylist, currentSong, toggleLike, isLiked, recentlyPlayed } = usePlayer();
  const weather = useWeather();
  const songs = useMemo(() => popularSongs.slice(0, 12), []);
  const hero = songs[0];

  // Songs that match the current weather mood.
  const weatherMix = useMemo(() => {
    const mood = weather.mood;
    const matches = (uniqueSongs as any[]).filter((s) => s.sync === mood);
    const pool = matches.length >= 5 ? matches : (uniqueSongs as any[]);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
  }, [weather.mood]);

  const playWeatherMix = () => {
    if (weatherMix.length > 0) playPlaylist(weatherMix as any);
  };

  return (
    <main
      className="relative min-h-dvh px-5 pt-10 pb-44"
      style={{
        background:
          "radial-gradient(110% 70% at 50% -10%, #1a0507 0%, #0a0507 40%, #050005 80%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 20%, #fff 0%, transparent 60%), radial-gradient(50% 40% at 90% 60%, #b91c1c 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">Hello</p>
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {greeting()}
          </h1>
          <p className="mt-1 text-[11px] text-zinc-600">{todayStr}</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-red-900/40 bg-zinc-900 text-lg shadow-[0_0_24px_-8px_rgba(185,28,28,0.9)]">
          <span>{weather.emoji}</span>
        </div>
      </header>

      {/* Search row */}
      <div className="relative mt-5 flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-left backdrop-blur transition hover:bg-white/10"
        >
          <Search className="h-4 w-4 text-white/55" />
          <span className="truncate text-sm text-white/45">Search album, song...</span>
        </button>
        <button
          onClick={onOpenSearch}
          aria-label="Filters"
          className="grid h-[50px] w-[50px] shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur transition hover:bg-white/10"
        >
          <SlidersHorizontal className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {/* Weather / mood banner */}
      {hero && (
        <section
          onClick={playWeatherMix}
          role="button"
          className="relative mt-5 overflow-hidden rounded-[28px] border border-red-950/60 shadow-[0_30px_60px_-30px_rgba(0,0,0,1)]"
        >
          <img
            src={hero.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-red-950/50" />
          <div className="relative flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                Made for this moment
              </p>
              <h2 className="mt-1.5 text-xl font-bold leading-tight text-white">
                {weather.condition ? `${weather.condition} mix` : "Weather mix"}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
                {weather.city && (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{weather.city}</span>
                  </>
                )}
                {weather.tempC !== null && <span>· {weather.tempC}°C</span>}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                <Play className="h-3 w-3" fill="currentColor" />
                Play now
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Most popular */}
      <section className="relative mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Flame className="h-4 w-4 text-red-600" /> Most Popular
          </h2>
          <button
            onClick={onOpenSearch}
            className="rounded-full bg-red-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {songs.slice(0, 8).map((song) => {
            const liked = isLiked(song.id);
            return (
              <article
                key={song.id}
                onClick={() => playSong(song)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/5 bg-zinc-900">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song.id);
                    }}
                    aria-label="Like"
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/50 backdrop-blur"
                  >
                    <Heart
                      className={cn("h-4 w-4", liked ? "fill-red-600 text-red-600" : "text-white/70")}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(song);
                    }}
                    aria-label="Play"
                    className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-white text-black shadow-lg transition hover:scale-105"
                  >
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </button>
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-white">{song.title}</p>
                <p className="truncate text-[11px] text-zinc-500">
                  {(song as any).singer || song.artist}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recently played */}
      <section className="relative mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-200">Recently played</h2>
        </div>
        {recentlyPlayed.length === 0 ? (
          <p className="text-sm text-zinc-600">Songs you play will appear here.</p>
        ) : (
          <ul className="space-y-3.5">
            {recentlyPlayed.slice(0, 15).map((song) => {
              const playing = currentSong?.id === song.id;
              return (
                <li
                  key={"recent-" + song.id}
                  onClick={() => playSong(song)}
                  className="flex cursor-pointer items-center gap-4"
                >
                  <img
                    src={song.imageUrl}
                    alt=""
                    className={cn(
                      "h-14 w-14 shrink-0 rounded-lg border object-cover",
                      playing ? "border-red-800" : "border-white/5"
                    )}
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-semibold",
                        playing ? "text-red-600" : "text-zinc-100"
                      )}
                    >
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {(song as any).singer || song.artist}
                    </p>
                  </div>
                  <button
                    aria-label="Play"
                    className="grid h-9 w-9 place-items-center rounded-full text-zinc-700 hover:text-white"
                  >
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
