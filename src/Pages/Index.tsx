
import React, { useEffect, useState, useMemo } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTimeBasedGreeting, getDailyRotatedSongs } from "@/utils/dailyRotation";
import { userPreferenceLearner } from "@/services/UserPreferenceLearner";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/data/songs";
import { uniqueSongs, shuffledTrendingSongs, popularSongs } from "@/data/allSongs";
import UserProfile from "@/components/UserProfile";
import RecentlyPlayedSection from "@/components/RecentlyPlayedSection";
import { 
  Play, Search, Radio, Heart, ListMusic, Clock, 
  TrendingUp, Music2, Headphones, Mic2, Disc3,
  Sparkles, ChevronRight, LayoutGrid, AlignJustify
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "tiles" | "content";
type FilterCategory = "all" | "music" | "podcasts" | "artists" | "playlists";

const Index = () => {
  const { playSong, recentlyPlayed, recommendations, currentSong } = usePlayer();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("tiles");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const greeting = getTimeBasedGreeting();
  const hasLearned = userPreferenceLearner.hasEnoughData();
  const quickPicks = getDailyRotatedSongs(8);

  const quickAccessSongs = useMemo(() => {
    const base = recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 8) : quickPicks;
    return hasLearned ? userPreferenceLearner.reorderSongs(base) : base;
  }, [recentlyPlayed, quickPicks, hasLearned]);

  const trendingSongs = useMemo(() => {
    return hasLearned ? userPreferenceLearner.reorderSongs(shuffledTrendingSongs).slice(0, 10) : shuffledTrendingSongs.slice(0, 10);
  }, [hasLearned]);

  const topPicks = useMemo(() => {
    if (recommendations.length > 0) return recommendations.slice(0, 6);
    return hasLearned ? userPreferenceLearner.reorderSongs(popularSongs).slice(0, 6) : popularSongs.slice(0, 6);
  }, [recommendations, hasLearned]);

  const filters: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "music", label: "Music" },
    { id: "podcasts", label: "Podcasts" },
    { id: "artists", label: "Artists" },
    { id: "playlists", label: "Playlists" },
  ];

  const shortcuts = [
    { icon: Heart, label: "Liked Songs", path: "/liked", color: "from-purple-600 to-indigo-600" },
    { icon: Radio, label: "Live", path: "/live", color: "from-red-600 to-orange-600" },
    { icon: ListMusic, label: "Playlists", path: "/playlists", color: "from-emerald-600 to-teal-600" },
    { icon: Search, label: "Search", path: "/search", color: "from-amber-500 to-yellow-500" },
    { icon: Mic2, label: "Artists", path: "/artists", color: "from-pink-600 to-rose-600" },
    { icon: Clock, label: "Recently Played", path: "#recent", color: "from-blue-600 to-cyan-600" },
  ];

  return (
    <div className="relative pb-24 md:pb-32 min-h-screen">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl bg-background/80 border-b border-border/20">
        <div className="px-4 md:px-6 py-3 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <Music2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                {greeting}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/search")}
                className="p-2 rounded-full hover:bg-card/80 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Search className="w-5 h-5" />
              </button>
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Filter Chips + View Toggle */}
        <div className="px-4 md:px-6 pb-3 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* View mode toggles - Spotify style */}
            <div className="flex items-center gap-1 mr-2 p-1 rounded-lg bg-card/50 border border-border/30 flex-shrink-0">
              <button
                onClick={() => setViewMode("tiles")}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  viewMode === "tiles" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Tiles"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("content")}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  viewMode === "content" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Content"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            {/* Filter chips */}
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border border-border/30"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-[1400px] mx-auto pt-4">
        {/* Quick Shortcuts Grid */}
        <div className={cn(
          "gap-2 md:gap-3 mb-6",
          viewMode === "tiles" 
            ? "grid grid-cols-2 md:grid-cols-3" 
            : "flex flex-col"
        )}>
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.label}
              onClick={() => shortcut.path.startsWith("#") ? document.getElementById("recent")?.scrollIntoView({ behavior: "smooth" }) : navigate(shortcut.path)}
              className={cn(
                "group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                viewMode === "tiles"
                  ? "flex items-center gap-3 bg-card/60 hover:bg-card/90 border border-border/20 h-14 md:h-16"
                  : "flex items-center gap-4 bg-card/40 hover:bg-card/70 border border-border/20 p-3 rounded-xl"
              )}
            >
              <div className={cn(
                "flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                shortcut.color,
                viewMode === "tiles" 
                  ? "w-14 h-14 md:w-16 md:h-16 rounded-l-lg" 
                  : "w-12 h-12 rounded-lg"
              )}>
                <shortcut.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm text-foreground truncate pr-3">
                {shortcut.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Top Picks For You */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                {hasLearned ? "Picked For You" : "Top Picks"}
              </h2>
            </div>
            <button 
              onClick={() => navigate("/live")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className={cn(
            "gap-3",
            viewMode === "tiles" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" 
              : "flex flex-col"
          )}>
            {topPicks.map((song, i) => (
              <div
                key={`pick-${song.id}-${i}`}
                onClick={() => playSong(song)}
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                  viewMode === "tiles"
                    ? "rounded-lg bg-card/40 hover:bg-card/80 p-3 border border-border/10"
                    : "flex items-center gap-4 rounded-xl bg-card/30 hover:bg-card/60 p-3 border border-border/10"
                )}
              >
                <div className={cn(
                  "relative overflow-hidden rounded-md flex-shrink-0",
                  viewMode === "tiles" ? "w-full aspect-square mb-3" : "w-14 h-14"
                )}>
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className={cn(viewMode === "content" && "flex-1 min-w-0")}>
                  <p className="font-semibold text-sm text-foreground truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Access - Recently Played */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-bold text-foreground">Jump Back In</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {quickAccessSongs.slice(0, 8).map((song, index) => (
              <div
                key={`recent-${song.id}-${index}`}
                className="flex items-center gap-3 rounded-md bg-card/50 hover:bg-card/80 cursor-pointer group transition-all duration-200 overflow-hidden h-14 border border-border/10"
                onClick={() => playSong(song)}
              >
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-14 h-14 object-cover flex-shrink-0"
                  loading="lazy"
                />
                <span className="font-medium text-xs md:text-sm text-foreground truncate pr-2 flex-1">
                  {song.title}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-all pr-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Play className="w-3 h-3 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">Trending</h2>
            </div>
            <button 
              onClick={() => navigate("/live")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {trendingSongs.map((song, i) => (
              <div
                key={`trend-${song.id}-${i}`}
                onClick={() => playSong(song)}
                className="group cursor-pointer flex-shrink-0 w-36 md:w-44"
              >
                <div className="relative overflow-hidden rounded-lg mb-2 aspect-square">
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                  {/* Rank badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{i + 1}</span>
                  </div>
                </div>
                <p className="font-semibold text-sm text-foreground truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse All - Category Cards */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Browse All</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "All Songs", icon: Disc3, color: "from-primary to-primary/60", path: "/live" },
              { label: "Artists", icon: Mic2, color: "from-pink-600 to-rose-500", path: "/artists" },
              { label: "Playlists", icon: ListMusic, color: "from-emerald-600 to-green-500", path: "/playlists" },
              { label: "Liked Songs", icon: Heart, color: "from-purple-600 to-indigo-500", path: "/liked" },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(cat.path)}
                className="relative overflow-hidden rounded-xl p-4 md:p-6 text-left transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] group"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity", cat.color)} />
                <div className="relative z-10">
                  <cat.icon className="w-8 h-8 text-white mb-2" />
                  <p className="font-bold text-white text-sm md:text-base">{cat.label}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recently Played Section */}
        <div id="recent" className="mb-8">
          <RecentlyPlayedSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
