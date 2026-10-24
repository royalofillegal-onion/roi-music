import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Heart, Search, SlidersHorizontal, Flame, Radio, CircleUserRound, ChevronLeft, ChevronRight } from "lucide-react";
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
  mongoSongs = [],
  onOpenSearch,
  onOpenAccount,
}: { mongoSongs?: import("@/data/Song").Song[]; onOpenSearch?: () => void; onOpenAccount?: () => void } = {}) {
  const { playSong, playPlaylist, currentSong, toggleLike, isLiked, recentlyPlayed } = usePlayer();
  const weather = useWeather();
  const [activeBanner, setActiveBanner] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const [typedBannerText, setTypedBannerText] = useState("");
  const touchStartX = useRef<number | null>(null);
  const songs = useMemo(() => {
    const combined = [...mongoSongs, ...popularSongs];
    return combined.filter((song, index, list) => list.findIndex((item) => item.id === song.id) === index).slice(0, 12);
  }, [mongoSongs]);
  const bannerSongs = songs.slice(0, Math.min(5, songs.length));
  const hero = bannerSongs[activeBanner] || songs[0];
  const bannerLabel = activeBanner === 0 && weather.condition
    ? `${weather.condition} Mix`
    : activeBanner === 0
      ? "Overcast Mix"
      : ["Fresh Finds", "Made for You", "On Repeat", "New Favorites"][activeBanner % 4];
  const bannerTypingText = `${(hero as any)?.singer || hero?.artist || "Your next favorite"} · ${hero?.title || "Discover something new"}`;

  useEffect(() => {
    if (bannerSongs.length < 2 || isBannerPaused) return;
    const timer = window.setInterval(() => {
      setActiveBanner((index) => (index + 1) % bannerSongs.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [bannerSongs.length, isBannerPaused]);

  useEffect(() => {
    setTypedBannerText("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedBannerText(bannerTypingText.slice(0, index));
      if (index >= bannerTypingText.length) window.clearInterval(timer);
    }, 34);
    return () => window.clearInterval(timer);
  }, [bannerTypingText]);

  const showBanner = (index: number) => {
    setActiveBanner((index + bannerSongs.length) % bannerSongs.length);
  };

  // Songs that match the current weather mood.
  const weatherMix = useMemo(() => {
    const mood = weather.mood;
    const matches = (uniqueSongs as any[]).filter((s) => s.sync === mood);
    const pool = matches.length >= 5 ? matches : (uniqueSongs as any[]);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
  }, [weather.mood]);

  const playWeatherMix = () => {
    if (hero) playSong(hero);
    else if (weatherMix.length > 0) playPlaylist(weatherMix as any);
  };

  const stats = useListeningStats();
  const topArtists = stats.topArtists;

  const startRadio = (seed: (typeof songs)[number]) => {
    const station = buildRadio(seed as any);
    if (station.length) playPlaylist(station as any);
  };

  const artistStation = (artist: string) => {
    const seed = (uniqueSongs as any[]).find(
      (s) => (s.singer || s.artist || "").toLowerCase() === artist.toLowerCase()
    );
    if (seed) startRadio(seed);
  };

  return (
    <main
      className="relative min-h-dvh px-5 pt-8 pb-40"
      style={{
        background: "radial-gradient(110% 65% at 50% -10%, #17191d 0%, #090a0c 48%, #030405 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(55% 35% at 12% 15%, rgba(255,255,255,.08) 0%, transparent 70%), radial-gradient(50% 40% at 90% 55%, rgba(123,75,255,.12) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-zinc-400">Hello</p>
          <h1
            className="mt-0.5 text-[23px] font-bold tracking-tight text-white"
          >
            {greeting()}, music lover
          </h1>
          <p className="mt-1 text-[11px] text-zinc-500">{todayStr} · your soundtrack starts here</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenAccount}
            aria-label="Open account"
            className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/15 bg-[#202124] text-white shadow-lg transition active:scale-90"
          >
            <CircleUserRound className="h-5 w-5 text-[#f5c34a]" />
          </button>
        </div>
      </header>

      {/* Search row */}
      <div className="relative mt-5 flex items-center gap-2.5">
        <button
          onClick={onOpenSearch}
          className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-white/[0.06] bg-[#252629] px-3.5 text-left transition hover:bg-[#303135]"
        >
          <Search className="h-4 w-4 text-zinc-400" />
          <span className="truncate text-[13px] text-zinc-400">Search album, song...</span>
        </button>
        <button
          onClick={onOpenSearch}
          aria-label="Filters"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-[#252629] transition hover:bg-[#303135]"
        >
          <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
        </button>
      </div>

      {/* Weather / mood banner */}
      {hero && (
        <section
          aria-roledescription="carousel"
          aria-label="Featured music"
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
          onFocus={() => setIsBannerPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsBannerPaused(false);
          }}
          onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const dx = event.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 45) showBanner(activeBanner + (dx < 0 ? 1 : -1));
            touchStartX.current = null;
          }}
          className="relative mt-4 min-h-[150px] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-[#4936a7] via-[#7647ce] to-[#ea70d5] shadow-[0_18px_45px_-28px_rgba(160,98,255,.9)]"
        >
          {bannerSongs.map((song, index) => (
            <div
              key={song.id}
              aria-hidden={index !== activeBanner}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                index === activeBanner ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <img
                src={song.imageUrl}
                alt=""
                className="absolute right-0 top-0 h-full w-[66%] object-cover object-center opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#4d39aa] via-[#7846cb]/95 via-50% to-[#d34ab3]/25" />
            </div>
          ))}
          <div className="relative z-10 flex min-h-[150px] items-center p-4">
            <div className="max-w-[76%] min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                Made for your mood
              </p>
              <h2 className="mt-1 text-[20px] font-extrabold leading-tight text-white">
                {bannerLabel}
              </h2>
              <p className="mt-1 h-4 truncate text-[11px] text-white/80" aria-live="polite">
                {typedBannerText}<span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-white/80 align-middle" />
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={playWeatherMix}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff5d68] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-lg transition hover:brightness-110 active:scale-95"
                >
                  <Play className="h-3 w-3" fill="currentColor" /> Play mix
                </button>
                <button
                  type="button"
                  onClick={() => startRadio(hero)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                >
                  <Radio className="h-3 w-3" /> Radio
                </button>
              </div>
            </div>
          </div>
          {bannerSongs.length > 1 && (
            <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1.5">
              <button type="button" aria-label="Previous featured song" onClick={() => showBanner(activeBanner - 1)} className="grid h-6 w-6 place-items-center rounded-full bg-black/20 text-white/90 transition hover:bg-black/40">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {bannerSongs.map((song, index) => (
                <button
                  key={song.id}
                  type="button"
                  aria-label={`Show featured song ${index + 1}`}
                  aria-current={index === activeBanner ? "true" : undefined}
                  onClick={() => showBanner(index)}
                  className={cn("h-1.5 rounded-full transition-all", index === activeBanner ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80")}
                />
              ))}
              <button type="button" aria-label="Next featured song" onClick={() => showBanner(activeBanner + 1)} className="grid h-6 w-6 place-items-center rounded-full bg-black/20 text-white/90 transition hover:bg-black/40">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <span
            key={activeBanner}
            className="pointer-events-none absolute bottom-0 left-0 z-10 h-0.5 w-0 bg-white/75 [animation:banner-progress_5200ms_linear_forwards]"
            style={{ animationPlayState: isBannerPaused ? "paused" : "running" }}
          />
        </section>
      )}

      {/* Your top artists */}
      {topArtists.length > 0 && (
        <section className="relative mt-8">
          <h2 className="mb-3 text-lg font-bold text-white">Your top artists</h2>
          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide">
            {topArtists.map((a) => (
              <button
                key={a.key}
                onClick={() => artistStation(a.label)}
                className="w-20 shrink-0 text-center"
              >
                <img
                  src={a.imageUrl}
                  alt=""
                  className="h-20 w-20 rounded-full border border-red-900/40 object-cover"
                  loading="lazy"
                />
                <span className="mt-2 block truncate text-[11px] font-semibold text-zinc-300">
                  {a.label}
                </span>
                <span className="block text-[10px] text-zinc-600">{Math.round(a.seconds / 60)} min</span>
              </button>
            ))}
          </div>
        </section>
      )}


      {/* Most popular */}
      <section className="relative mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[16px] font-bold text-white">
            <Flame className="h-4 w-4 text-[#ff5d68]" /> Most Popular
          </h2>
          <button
            onClick={onOpenSearch}
            className="rounded-md bg-[#ff5d68] px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-white"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {songs.slice(0, 8).map((song) => {
            const liked = isLiked(song.id);
            return (
              <article
                key={song.id}
                onClick={() => playSong(song)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[1.05] overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900">
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
                      className={cn("h-4 w-4", liked ? "fill-[#ff5d68] text-[#ff5d68]" : "text-white/70")}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(song);
                    }}
                    aria-label="Play"
                    className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-lg transition hover:scale-105"
                  >
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </button>
                </div>
                <p className="mt-2 truncate text-[12px] font-semibold text-white">{song.title}</p>
                <p className="truncate text-[10px] text-zinc-500">
                  {(song as any).singer || song.artist}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recently played */}
      <section className="relative mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-zinc-200">Recently Played</h2>
        </div>
        {recentlyPlayed.length === 0 ? (
          <p className="text-sm text-zinc-600">Songs you play will appear here.</p>
        ) : (
          <ul className="space-y-2.5">
            {recentlyPlayed.slice(0, 15).map((song) => {
              const playing = currentSong?.id === song.id;
              return (
                <li
                  key={"recent-" + song.id}
                  onClick={() => playSong(song)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl py-1 transition hover:bg-white/[0.04]"
                >
                  <img
                    src={song.imageUrl}
                    alt=""
                    className={cn(
                      "h-11 w-11 shrink-0 rounded-lg border object-cover",
                      playing ? "border-[#ff5d68]" : "border-white/5"
                    )}
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-semibold",
                        playing ? "text-[#ff5d68]" : "text-zinc-100"
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
