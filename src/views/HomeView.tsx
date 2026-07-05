import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Heart, ChevronLeft, ChevronRight, MapPin, Library, User } from "lucide-react";
import { popularSongs, uniqueSongs, getLivePopularSongs } from "@/data/allSongs";
import { getNewReleaseSongs } from "@/data/NewReleaseSongs";
import { playlists, getPlaylistSongs } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";
import { LibrarySheet } from "@/components/LibrarySheet";
import { SongListSheet } from "@/components/SongListSheet";
import { Marquee } from "@/components/Marquee";
import FloatingMascot from "@/components/FloatingMascot";
import { getHybridRecommendations } from "@/lib/algorithms/recommendations";
import { getDynamicRecommendations } from "@/data/moodRecommendations";

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
  const { playSong, playPlaylist, currentSong, toggleLike, isLiked, recentlyPlayed, likedSongs } = usePlayer();
  const weather = useWeather();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null);

  // Language filter for "Made for this moment" carousel.
  type LangFilter = "telugu" | "hindi" | "tamil";
  const LANG_OPTIONS: { key: LangFilter; label: string }[] = [
    { key: "telugu", label: "Telugu" },
    { key: "hindi", label: "Hindi" },
    { key: "tamil", label: "Tamil" },
  ];
  const [momentLangs, setMomentLangs] = useState<LangFilter[]>([]);
  const toggleMomentLang = (k: LangFilter) =>
    setMomentLangs((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const matchesLang = (songLang: string | undefined) => {
    const l = (songLang || "").toLowerCase();
    // Always hide English from this carousel.
    if (l === "english") return false;
    if (momentLangs.length === 0) return true;
    return momentLangs.some((lf) => l === lf);
  };

  const songs = useMemo(() => {
    const filtered = (popularSongs as any[]).filter((s) => matchesLang(s.language));
    return (filtered.length > 0 ? filtered : (popularSongs as any[])).slice(0, 12);
  }, [momentLangs]);

  // Songs that match the current weather mood.
  const weatherMix = useMemo(() => {
    const mood = weather.mood;
    const matches = (uniqueSongs as any[]).filter((s) => s.sync === mood);
    const pool = matches.length >= 5 ? matches : (uniqueSongs as any[]);
    // shuffle
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
  }, [weather.mood]);

  // Curated new releases (from NewReleaseSongs.ts IDs).
  const newReleases = useMemo(() => getNewReleaseSongs(), []);
  const playNewReleases = () => {
    if (newReleases.length > 0) playPlaylist(newReleases as any);
  };

  const playWeatherMix = () => {
    if (weatherMix.length > 0) playPlaylist(weatherMix as any);
  };

  // Re-rotate the feed every ~5 minutes so users see fresh order constantly.
  const [rotationTick, setRotationTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setRotationTick((n) => n + 1), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Recommendations — manual time-of-day + weather mood + sync chains
  // (curated in src/data/moodRecommendations.ts).
  const recoResult = useMemo(
    () =>
      getDynamicRecommendations({
        catalog: uniqueSongs as any,
        weatherMood: weather.mood,
        currentSong,
        recentlyPlayed,
        limit: 30,
      }),
    [weather.mood, currentSong, recentlyPlayed, rotationTick]
  );

  // Blend in liked-vibe + hybrid signals on top of manual curation.
  const recommendations = useMemo(() => {
    const pool = uniqueSongs as any[];
    const mostPlayed = getLivePopularSongs(20);
    const hybrid = getHybridRecommendations(currentSong, recentlyPlayed, pool as any, 20);
    const likedObjs = pool.filter((s) => likedSongs.includes(s.id));
    const likedSyncs = new Set(likedObjs.map((s) => s.sync).filter(Boolean));
    const likedLike = pool.filter(
      (s) => !likedSongs.includes(s.id) && s.sync && likedSyncs.has(s.sync)
    );

    const seen = new Set<string>();
    const merged: any[] = [];
    // Manual curation comes FIRST so it always shows.
    const sources = [recoResult.songs, mostPlayed, hybrid, likedLike];
    const max = Math.max(...sources.map((s) => s.length), 0);
    for (let i = 0; i < max && merged.length < 40; i++) {
      for (const src of sources) {
        const s = src[i];
        if (s && !seen.has(s.id)) {
          seen.add(s.id);
          merged.push(s);
        }
      }
    }
    return merged;
  }, [recoResult, currentSong, recentlyPlayed, likedSongs]);

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
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLibraryOpen(true)}
            aria-label="Open your library"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/8 hover:bg-white/15 border border-white/10 transition"
          >
            <Library className="h-5 w-5" />
          </button>
          <button
            onClick={() => setLibraryOpen(true)}
            aria-label="Open Profile"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/8 hover:bg-white/15 border border-white/10 transition"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      <LibrarySheet open={libraryOpen} onOpenChange={setLibraryOpen} />

      {(() => {
        const p = playlists.find((x) => x.id === openPlaylistId);
        if (!p) return null;
        const list = getPlaylistSongs(p);
        return (
          <SongListSheet
            open={!!openPlaylistId}
            onOpenChange={(v) => !v && setOpenPlaylistId(null)}
            title={p.name}
            subtitle={(p as any).description}
            cover={p.cover}
            covers={(p as any).covers}
            emoji={(p as any).emoji}
            songs={list as any}
            kind="Playlist"
          />
        );
      })()}

      

      {/* New Releases — compact horizontal pill cards */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">New Releases</h2>
          {newReleases.length > 0 && (
            <button
              onClick={playNewReleases}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-400/40 px-3 py-1.5 text-xs font-semibold text-white transition"
            >
              <Play className="h-3 w-3" fill="currentColor" />
              Play all
            </button>
          )}
        </div>

        {newReleases.length === 0 ? (
          <p className="mt-3 text-sm text-white/55">
            New releases will appear here once added.
          </p>
        ) : (
          <div className="mt-3 -mx-5">
            <div className="flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {newReleases.map((song: any) => (
                <button
                  key={"new-" + song.id}
                  onClick={() => playSong(song)}
                  className="shrink-0 flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition min-w-[220px] max-w-[260px]"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="h-12 w-12 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{song.title}</p>
                    <p className="text-[11px] text-white/60 truncate">
                      {song.singer || song.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section heading */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-wide">
          Made for this moment
        </h2>
        <button
          onClick={onOpenSearch}
          className="text-sm font-medium text-fuchsia-400 hover:text-fuchsia-300"
        >
          🔍 Search
        </button>
      </div>

      {/* Language filter for Made-for-this-moment */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {LANG_OPTIONS.map((opt) => {
          const active = momentLangs.includes(opt.key);
          return (
            <button
              key={opt.key}
              onClick={() => toggleMomentLang(opt.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold border transition",
                active
                  ? "bg-fuchsia-500/30 border-fuchsia-400/60 text-white"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              )}
            >
              {opt.label}
            </button>
          );
        })}
        {momentLangs.length > 0 ? (
          <button
            onClick={() => setMomentLangs([])}
            className="text-xs text-white/55 hover:text-white underline-offset-2 hover:underline ml-1"
          >
            Clear
          </button>
        ) : (
          <span className="text-xs text-white/45 ml-1">All languages</span>
        )}
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
                    <Marquee
                      text={song.title}
                      className="text-lg font-bold leading-tight drop-shadow"
                    />
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

      

      {/* Playlists — Spotify-style square cards with mosaic covers */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Playlists</h2>
          <span className="text-xs text-white/45">{playlists.length} curated</span>
        </div>
        {playlists.length === 0 ? (
          <p className="mt-3 text-sm text-white/55">No playlists yet.</p>
        ) : (
          <div className="mt-4 -mx-5">
            <div className="flex gap-4 overflow-x-auto px-5 pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {playlists.map((p) => {
                const songs = getPlaylistSongs(p);
                const covers = (p as any).covers as string[] | undefined;
                return (
                  <article
                    key={"pl-" + p.id}
                    onClick={() => setOpenPlaylistId(p.id)}
                    className="snap-start shrink-0 w-40 cursor-pointer group"
                  >
                    <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                      {covers && covers.length >= 4 ? (
                        <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                          {covers.slice(0, 4).map((c, i) => (
                            <img key={i} src={c} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ))}
                        </div>
                      ) : (
                        <img
                          src={p.cover}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute top-2 left-2 text-lg drop-shadow">
                        {(p as any).emoji || "🎵"}
                      </span>
                      <button
                        aria-label="Play"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (songs.length > 0) playPlaylist(songs as any);
                        }}
                        className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-fuchsia-500 text-white shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-105 transition"
                      >
                        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[11px] text-white/55 truncate">
                      {songs.length} songs · {(p as any).description || ""}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Recommendations */}
      {/* New Releases */}
      {/* Recommendations */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Recommended for you</h2>
            <p className="mt-1 text-xs text-fuchsia-200/80 capitalize truncate">
              {recoResult.timeOfDay} · {recoResult.syncText}
            </p>
          </div>
          <span className="shrink-0 text-xs text-white/45">
            {recommendations.length} songs
          </span>
        </div>

        {recommendations.length === 0 ? (
          <p className="mt-4 text-sm text-white/55">
            Play a few songs and recommendations will appear here.
          </p>
        ) : (
          <div className="mt-4 -mx-5">
            <div className="flex gap-3 overflow-x-auto px-5 pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recommendations.map((song: any) => {
                const playing = currentSong?.id === song.id;
                const liked = isLiked(song.id);
                return (
                  <article
                    key={"rec-" + song.id}
                    onClick={() => playSong(song)}
                    className={cn(
                      "snap-start shrink-0 w-36 cursor-pointer group",
                      playing && "opacity-100"
                    )}
                  >
                    <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.id);
                        }}
                        aria-label="Like"
                        className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/40 backdrop-blur border border-white/15"
                      >
                        <Heart
                          className={cn(
                            "h-3.5 w-3.5",
                            liked ? "fill-fuchsia-400 text-fuchsia-400" : "text-white"
                          )}
                        />
                      </button>
                      <button
                        aria-label="Play"
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song);
                        }}
                        className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-white text-black shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-105 transition"
                      >
                        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs font-semibold truncate">{song.title}</p>
                    <p className="text-[11px] text-white/55 truncate">
                      {song.singer || song.artist}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
      
      {/* Recently played */}
      <section className="mt-10">
        <h2 className="text-base font-semibold mb-4">Recently played</h2>
        {recentlyPlayed.length === 0 ? (
          <p className="text-sm text-white/55">
            Songs you play will appear here.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentlyPlayed.slice(0, 10).map((song) => {
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

      {/* Footer: Terms & Copyright */}
      <footer className="mt-14 pt-6 border-t border-white/10 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/60">
          <a href="#terms" className="hover:text-white transition">Terms & Conditions</a>
          <span className="text-white/20">·</span>
          <a href="#privacy" className="hover:text-white transition">Privacy Policy</a>
          <span className="text-white/20">·</span>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </nav>
        <p className="mt-3 text-[11px] text-white/45">
          © {new Date().getFullYear()} ROI Music. All rights reserved.
        </p>
        <p className="mt-1 text-[11px] text-white/35">
          All trademarks and copyrights belong to their respective owners.
        </p>
      </footer>
    </main>
  );
}
