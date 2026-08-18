import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Heart, ChevronLeft, ChevronRight, MapPin, Search, X } from "lucide-react";
import { popularSongs, uniqueSongs } from "@/data/allSongs";
import { usePlayer } from "@/context/PlayerContext";
import { useWeather } from "@/hooks/useWeather";
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Songs that match the current weather mood.
  const weatherMix = useMemo(() => {
    const mood = weather.mood;
    const matches = (uniqueSongs as any[]).filter((s) => s.sync === mood);
    const pool = matches.length >= 5 ? matches : (uniqueSongs as any[]);
    // shuffle
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
  }, [weather.mood]);

  const playWeatherMix = () => {
    if (weatherMix.length > 0) playPlaylist(weatherMix as any);
  };

  // Track which card is centered while user swipes.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.firstElementChild?.clientWidth ?? 1;
      const gap = 16;
      const idx = Math.round(el.scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.max(0, Math.min(songs.length - 1, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [songs.length]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 280;
    el.scrollBy({ left: (cardWidth + 16) * dir, behavior: "smooth" });
  };

  return (
    <main
      className="relative min-h-dvh px-6 pt-12 pb-44"
      style={{
        background:
          "radial-gradient(110% 70% at 50% -10%, #1a0507 0%, #0a0507 40%, #050005 80%)",
      }}
    >
      {/* subtle fog */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 20%, #fff 0%, transparent 60%), radial-gradient(50% 40% at 90% 60%, #b91c1c 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {greeting()}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{todayStr}</p>
          {(weather.city || weather.tempC !== null) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              {weather.city && (
                <>
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {weather.city}
                    {weather.country ? `, ${weather.country}` : ""}
                  </span>
                </>
              )}
              {weather.tempC !== null && (
                <span className="ml-1 text-zinc-400">
                  · {weather.tempC}°C {weather.condition}
                </span>
              )}
            </p>
          )}
          <button
            onClick={playWeatherMix}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-900/50 bg-red-950/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-red-500 transition hover:bg-red-900/40"
          >
            <Play className="h-3 w-3" fill="currentColor" />
            Play {weather.condition ? weather.condition.toLowerCase() : "weather"} mix
          </button>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-2xl">
          <span className="text-base">{weather.emoji}</span>
        </div>
      </header>

      {/* Section heading */}
      <div className="relative mt-10 flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
          Made for this moment
        </h2>
        <button
          onClick={onOpenSearch}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600"
        >
          Search
        </button>
      </div>

      {/* Carousel */}
      <div className="relative mt-4 -mx-6">
        <button
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="hidden md:grid absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 place-items-center rounded-full bg-black/60 backdrop-blur border border-white/10 hover:bg-black/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="hidden md:grid absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 place-items-center rounded-full bg-black/60 backdrop-blur border border-white/10 hover:bg-black/80"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto px-6 pb-3 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingInline: "24px" }}
        >
          {songs.map((song, i) => {
            const isCenter = i === activeIndex;
            const liked = isLiked(song.id);
            return (
              <article
                key={song.id}
                className={cn(
                  "snap-center shrink-0 relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 transition-all duration-500 cursor-pointer",
                  "w-[82vw] max-w-[340px] aspect-square",
                  isCenter
                    ? "opacity-100 shadow-[0_30px_70px_-25px_rgba(0,0,0,1)]"
                    : "opacity-45"
                )}
                onClick={() => playSong(song)}
              >
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/25 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-2xl font-bold leading-tight tracking-tight line-clamp-2">
                      {song.title}
                    </h3>
                    <p className="text-sm font-light italic text-zinc-400 line-clamp-1">
                      {song.singer || song.artist}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song.id);
                      }}
                      aria-label="Like"
                      className="transition-colors"
                    >
                      <Heart
                        className={cn(
                          "h-6 w-6",
                          liked ? "fill-red-700 text-red-700" : "text-zinc-400"
                        )}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playSong(song);
                      }}
                      aria-label="Play"
                      className="grid h-14 w-14 place-items-center rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] transition hover:scale-105"
                    >
                      <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination dots */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {songs.slice(0, 6).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-1 rounded-full transition-all",
                i === activeIndex % 6
                  ? "bg-red-700 shadow-[0_0_8px_rgba(185,28,28,0.8)]"
                  : "bg-zinc-800"
              )}
            />
          ))}
        </div>
      </div>


      {/* Recently played */}
      <section className="relative mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-200">Recently played</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            View all
          </span>
        </div>
        {recentlyPlayed.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Songs you play will appear here.
          </p>
        ) : (
          <ul className="space-y-4">
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
                      {song.singer || song.artist}
                    </p>
                  </div>
                  <button
                    aria-label="Play"
                    className="grid h-9 w-9 place-items-center rounded-full text-zinc-700 hover:text-white"
                  >
                    <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
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
