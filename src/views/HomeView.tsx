import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Play, Heart, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { popularSongs } from "@/data/allSongs";
import { uniqueSongs } from "@/data/allSongs";
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

export function HomeView({ onOpenSearch }: { onOpenSearch?: () => void } = {}) {
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
      className="relative min-h-dvh px-5 pt-10 pb-44"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #4a1f7a 0%, #2a0d4d 35%, #0a0418 75%)",
      }}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-tight">
            {greeting()} <span className="ml-1">{weather.emoji}</span>
          </h1>
          <p className="mt-1.5 text-sm text-white/70">{todayStr}</p>
          {(weather.city || weather.tempC !== null) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-fuchsia-200/90">
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
                <span className="ml-1 text-white/80">
                  · {weather.tempC}°C {weather.condition}
                </span>
              )}
            </p>
          )}
          <button
            onClick={playWeatherMix}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-400/40 px-3.5 py-1.5 text-sm font-medium text-white transition"
          >
            <Play className="h-3.5 w-3.5" fill="currentColor" />
            Play {weather.condition ? weather.condition.toLowerCase() : "weather"} mix
          </button>
        </div>
        <button
          aria-label="Notifications"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/8 backdrop-blur border border-white/10 hover:bg-white/15 transition"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {/* Section heading */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-wide">
          Made for this moment
        </h2>
        <button
          onClick={onOpenSearch}
          className="text-sm font-medium text-fuchsia-400 hover:text-fuchsia-300"
        >
          View all
        </button>
      </div>

      {/* Carousel */}
      <div className="relative mt-6 -mx-5">
        <button
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="hidden md:grid absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="hidden md:grid absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur border border-white/10 hover:bg-black/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingInline: "20px" }}
        >
          {songs.map((song, i) => {
            const isCenter = i === activeIndex;
            const liked = isLiked(song.id);
            return (
              <article
                key={song.id}
                className={cn(
                  "snap-center shrink-0 relative rounded-3xl overflow-hidden border border-white/10 transition-all duration-500 cursor-pointer",
                  "w-[78vw] max-w-[340px] aspect-[3/4]",
                  isCenter
                    ? "scale-100 opacity-100 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.55)]"
                    : "scale-[0.88] opacity-60"
                )}
                onClick={() => playSong(song)}
              >
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/0 to-black/70" />

                {/* Top: title + heart */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-tight line-clamp-2 drop-shadow">
                      {song.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/85 line-clamp-1">
                      {song.singer || song.artist}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(song.id);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full bg-black/30 backdrop-blur border border-white/15"
                    aria-label="Like"
                  >
                    <Heart
                      className={cn(
                        "h-4.5 w-4.5",
                        liked ? "fill-fuchsia-400 text-fuchsia-400" : "text-white"
                      )}
                    />
                  </button>
                </div>

                {/* Play button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSong(song);
                  }}
                  aria-label="Play"
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 grid h-16 w-16 place-items-center rounded-full bg-white text-black ring-4 ring-fuchsia-500/70 shadow-2xl hover:scale-105 transition"
                >
                  <Play className="h-7 w-7 ml-0.5" fill="currentColor" />
                </button>
              </article>
            );
          })}
        </div>

        {/* Pagination dots */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {songs.slice(0, 6).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activeIndex % 6
                  ? "w-6 bg-fuchsia-400"
                  : "w-1.5 bg-white/25"
              )}
            />
          ))}
        </div>
      </div>

      {/* Recently played */}
      <section className="mt-10">
        <h2 className="text-base font-semibold mb-4">Recently played</h2>
        {recentlyPlayed.length === 0 ? (
          <p className="text-sm text-white/55">
            Songs you play will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentlyPlayed.slice(0, 15).map((song) => {
              const playing = currentSong?.id === song.id;
              return (
                <li
                  key={"recent-" + song.id}
                  onClick={() => playSong(song)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition",
                    playing
                      ? "bg-fuchsia-500/15 border border-fuchsia-400/30"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <img
                    src={song.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{song.title}</p>
                    <p className="text-xs text-white/60 truncate">
                      {song.singer || song.artist}
                    </p>
                  </div>
                  <button
                    aria-label="Play"
                    className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20"
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
