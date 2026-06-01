import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Play, Menu, Music2, ChevronRight } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { useSidebarState } from "@/context/SidebarContext";
import { uniqueSongs, shuffledTrendingSongs, popularSongs } from "@/data/allSongs";
import { getTimeBasedGreeting } from "@/utils/dailyRotation";
import UserProfile from "@/components/UserProfile";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playSong, recentlyPlayed, likedSongs, toggleLike } = usePlayer() as any;
  const { toggle } = useSidebarState() as any;

  const greeting = getTimeBasedGreeting();
  const firstName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Listener";

  const popularBroadcast = useMemo(() => shuffledTrendingSongs.slice(0, 12), []);
  const recent = useMemo(() => {
    const list = recentlyPlayed?.length ? recentlyPlayed : popularSongs;
    return list.slice(0, 6);
  }, [recentlyPlayed]);

  const likedSet: Set<string> = useMemo(() => {
    const set = new Set<string>();
    (likedSongs || []).forEach((s: any) => set.add(s.id));
    return set;
  }, [likedSongs]);

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-b from-[#0f0a1f] via-[#120a26] to-background text-foreground">
      {/* Top bar: menu + search + avatar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => toggle?.()}
            className="md:hidden p-2 -ml-1 rounded-full text-foreground/80 hover:text-foreground hover:bg-white/5"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate("/search")}
            className="flex-1 flex items-center gap-3 h-11 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 text-left transition-colors"
          >
            <Search className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/60">Search album, song, artist…</span>
          </button>

          <UserProfile />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 space-y-10">
        {/* Greeting */}
        <section className="animate-fade-in">
          <p className="text-xs uppercase tracking-[0.18em] text-purple-300/70">{greeting}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
            Hi, {firstName}
          </h1>
          <p className="mt-1 text-sm text-white/50">Ready for a fresh mix today?</p>
        </section>

        {/* Popular Broadcast — horizontal row */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">Popular Broadcast</h2>
            <button
              onClick={() => navigate("/live")}
              className="text-xs md:text-sm text-purple-300 hover:text-pink-300 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none snap-x snap-mandatory">
            {popularBroadcast.map((song) => (
              <button
                key={`pb-${song.id}`}
                onClick={() => playSong(song)}
                className="group snap-start flex-shrink-0 w-[150px] md:w-[170px] text-left"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-transform duration-300 group-hover:scale-[1.03]">
                  {song.imageUrl ? (
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-white/40">
                      <Music2 className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <Play className="w-4 h-4 text-white ml-0.5 fill-white" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-semibold truncate">{song.title}</p>
                <p className="text-xs text-white/50 truncate">{song.artist}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Recently Played — list with heart */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">Recently Played</h2>
            <button
              onClick={() => navigate("/liked")}
              className="text-xs md:text-sm text-purple-300 hover:text-pink-300 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <ul className="space-y-3">
            {recent.map((song: any) => {
              const liked = likedSet.has(song.id);
              return (
                <li
                  key={`rp-${song.id}`}
                  className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-colors"
                >
                  <button
                    onClick={() => playSong(song)}
                    className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white/10"
                    aria-label={`Play ${song.title}`}
                  >
                    {song.imageUrl ? (
                      <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-white/50">
                        <Music2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 grid place-items-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </button>

                  <button
                    onClick={() => playSong(song)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-semibold truncate">{song.title}</p>
                    <p className="text-xs text-white/50 truncate">{song.artist}</p>
                  </button>

                  <button
                    onClick={() => toggleLike?.(song)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={liked ? "Unlike" : "Like"}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors",
                        liked ? "text-pink-500 fill-pink-500" : "text-white/50"
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Index;
