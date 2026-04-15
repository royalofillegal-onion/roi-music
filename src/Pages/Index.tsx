
import React, { useEffect, useState, useMemo } from "react";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import FloatingSettingsPanel from "@/components/FloatingSettingsPanel";
import RecentlyPlayedSection from "@/components/RecentlyPlayedSection";
import FestivalPopup from "@/components/FestivalPopup";
import TimeLighting from "@/components/TimeLighting";
import SectionFullView from "@/components/SectionFullView";
import DynamicSection from "@/components/DynamicSection";
import { Music2, Play, Sparkles } from "lucide-react";

import { 
  shuffledTrendingSongs, 
  popularSongs, 
  uniqueSongs, 
  shuffledMoreSongs, 
  shuffledMassRapSongs, 
  shuffledHindiSongs 
} from "@/data/allSongs";
import MovieAlbumsGrid from "@/components/MovieAlbumsGrid";
import SingersGrid from "@/components/SingersGrid";
import FeaturedPlaylistsGrid from "@/components/FeaturedPlaylistsGrid";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import UserProfile from "@/components/UserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDailyRotatedSongs, getTimeBasedGreeting } from "@/utils/dailyRotation";
import { userPreferenceLearner } from "@/services/UserPreferenceLearner";

import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/data/songs";

const Index = () => {
  const { playSong, recentlyPlayed, recommendations } = usePlayer();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { onboardingStatus, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);
  const [currentFullViewSection, setCurrentFullViewSection] = useState<{
    title: string;
    songs: Song[];
    isOpen: boolean;
  }>({
    title: '',
    songs: [],
    isOpen: false,
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const greeting = getTimeBasedGreeting();
  const quickPicks = getDailyRotatedSongs(6);
  const hasLearned = userPreferenceLearner.hasEnoughData();

  // Reorder quick access based on preferences
  const quickAccessSongs = useMemo(() => {
    const base = recentlyPlayed.length > 0 
      ? recentlyPlayed.slice(0, 6) 
      : quickPicks;
    return hasLearned ? userPreferenceLearner.reorderSongs(base) : base;
  }, [recentlyPlayed, quickPicks, hasLearned]);

  // Adaptively reorder song sections based on user preferences
  const reorderedTrending = useMemo(
    () => hasLearned ? userPreferenceLearner.reorderSongs(shuffledTrendingSongs) : shuffledTrendingSongs,
    [hasLearned]
  );
  const reorderedMassRap = useMemo(
    () => hasLearned ? userPreferenceLearner.reorderSongs(shuffledMassRapSongs) : shuffledMassRapSongs,
    [hasLearned]
  );
  const reorderedMore = useMemo(
    () => hasLearned ? userPreferenceLearner.reorderSongs(shuffledMoreSongs) : shuffledMoreSongs,
    [hasLearned]
  );
  const reorderedHindi = useMemo(
    () => hasLearned ? userPreferenceLearner.reorderSongs(shuffledHindiSongs) : shuffledHindiSongs,
    [hasLearned]
  );
  const reorderedPopular = useMemo(
    () => hasLearned ? userPreferenceLearner.reorderSongs(popularSongs) : popularSongs,
    [hasLearned]
  );
  const romanticSongs = useMemo(() => {
    const base = uniqueSongs.filter(s => s.sync === 'romantic' || s.sync === 'love');
    return hasLearned ? userPreferenceLearner.reorderSongs(base) : base;
  }, [hasLearned]);
  const devotionalSongs = useMemo(() => {
    const base = uniqueSongs.filter(s => s.sync === 'devotional');
    return hasLearned ? userPreferenceLearner.reorderSongs(base) : base;
  }, [hasLearned]);

  // Dynamically order sections based on learned mood preferences
  const sectionOrder = useMemo(() => {
    if (!hasLearned) return ['trending', 'massrap', 'romantic', 'hindi', 'more', 'devotional', 'popular'];
    return userPreferenceLearner.getSectionOrder({
      trending: ['happy', 'dance', 'party'],
      massrap: ['mass', 'rap', 'action'],
      romantic: ['romantic', 'love'],
      hindi: ['happy', 'love', 'dance'],
      more: ['feel1', 'normal', 'good'],
      devotional: ['devotional'],
      popular: ['happy', 'dance', 'mass'],
    });
  }, [hasLearned]);

  const sectionDataMap: Record<string, { title: string; songs: Song[] }> = {
    trending: { title: 'Trending Now', songs: reorderedTrending },
    massrap: { title: 'Mass & Rap Hits', songs: reorderedMassRap },
    romantic: { title: 'Romantic Melodies', songs: romanticSongs },
    hindi: { title: 'Hindi Hits', songs: reorderedHindi },
    more: { title: 'More Hits', songs: reorderedMore },
    devotional: { title: 'Devotional Songs', songs: devotionalSongs },
    popular: { title: 'Popular Right Now', songs: reorderedPopular },
  };

  const openSectionFullView = (title: string, songs: Song[]) => {
    setCurrentFullViewSection({ title, songs, isOpen: true });
  };

  const closeSectionFullView = () => {
    setCurrentFullViewSection(prev => ({ ...prev, isOpen: false }));
  };

  const showOnboarding = isLoggedIn && onboardingStatus && !onboardingStatus.completed;
  
  return (
    <div className="relative pb-24 md:pb-32 min-h-screen">
      <TimeLighting />
      <FloatingMusicInfo />
      <FestivalPopup onClose={() => {}} />
      
      {/* Spotify-like Header */}
      <div className="sticky top-0 z-30 px-4 md:px-6 py-3 backdrop-blur-xl bg-background/70 border-b border-border/30">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <Music2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ROI MUSIC
            </h1>
          </div>
          <UserProfile />
        </div>
      </div>

      <div className="px-4 md:px-6 max-w-[1400px] mx-auto">
        {/* Greeting Section - Spotify style */}
        <div className="pt-6 pb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{greeting}</h2>
        </div>

        {/* Quick Access Grid - Spotify's 2-column compact cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-8">
          {quickAccessSongs.map((song, index) => (
            <div
              key={`quick-${song.id}-${index}`}
              className="flex items-center gap-3 rounded-md bg-card/80 hover:bg-card cursor-pointer group transition-all duration-200 overflow-hidden h-14 md:h-16"
              onClick={() => playSong(song)}
            >
              <img
                src={song.imageUrl}
                alt={song.title}
                className="w-14 h-14 md:w-16 md:h-16 object-cover flex-shrink-0"
              />
              <span className="font-semibold text-sm md:text-base text-foreground truncate pr-2 flex-1">
                {song.title}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {/* Made For You - AI-learned Recommendations */}
          {recommendations.length > 0 && (
            <div className="animate-slide-up">
              <DynamicSection
                title={hasLearned ? "✨ Personalized For You" : "Made For You"}
                songs={recommendations.slice(0, 12)}
                layout="horizontal"
                cardSize="small"
              />
              {hasLearned && (
                <p className="text-xs text-muted-foreground mt-1 px-4 sm:px-6 lg:px-8">
                  Based on your listening history
                </p>
              )}
            </div>
          )}

          {/* Movie Albums */}
          <div className="animate-slide-up">
            <MovieAlbumsGrid title="Movie Albums" className="mb-2" />
          </div>

          {/* Dynamically ordered sections based on user preferences */}
          {sectionOrder.slice(0, 2).map((sectionId) => {
            const section = sectionDataMap[sectionId];
            if (!section || !section.songs.length) return null;
            return (
              <DynamicSection
                key={sectionId}
                title={section.title}
                songs={section.songs}
                layout="horizontal"
                cardSize="small"
                onViewAll={() => openSectionFullView(section.title, section.songs)}
                className="animate-slide-up"
              />
            );
          })}

          {/* Popular Singers */}
          <div className="animate-slide-up">
            <SingersGrid title="Popular Singers" type="singers" className="mb-2" />
          </div>

          {/* Middle sections */}
          {sectionOrder.slice(2, 4).map((sectionId) => {
            const section = sectionDataMap[sectionId];
            if (!section || !section.songs.length) return null;
            return (
              <DynamicSection
                key={sectionId}
                title={section.title}
                songs={section.songs}
                layout="horizontal"
                cardSize="small"
                onViewAll={() => openSectionFullView(section.title, section.songs)}
                className="animate-slide-up"
              />
            );
          })}

          {/* Featured Playlists */}
          <div className="animate-slide-up">
            <FeaturedPlaylistsGrid title="Featured Playlists" />
          </div>

          {/* Recently Played */}
          <div className="animate-slide-up">
            <RecentlyPlayedSection />
          </div>

          {/* Music Directors */}
          <div className="animate-slide-up">
            <SingersGrid title="Music Directors" type="music-directors" className="mb-2" />
          </div>

          {/* Remaining sections */}
          {sectionOrder.slice(4).map((sectionId) => {
            const section = sectionDataMap[sectionId];
            if (!section || !section.songs.length) return null;
            return (
              <DynamicSection
                key={sectionId}
                title={section.title}
                songs={section.songs}
                layout="horizontal"
                cardSize="small"
                onViewAll={() => openSectionFullView(section.title, section.songs)}
                className="animate-slide-up"
              />
            );
          })}
        </div>
      </div>

      {/* Onboarding */}
      {!onboardingLoading && showOnboarding && (
        <OnboardingFlow onComplete={markOnboardingComplete} />
      )}
      
      <FloatingSettingsPanel 
        isVisible={showFloatingSettings}
        onToggle={setShowFloatingSettings}
      />

      <SectionFullView
        title={currentFullViewSection.title}
        songs={currentFullViewSection.songs}
        isOpen={currentFullViewSection.isOpen}
        onClose={closeSectionFullView}
      />
    </div>
  );
};

export default Index;
