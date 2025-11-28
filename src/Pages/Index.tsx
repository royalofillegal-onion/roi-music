
import React, { useEffect, useState } from "react";
import MusicVisualizer from "@/components/MusicVisualizer";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import FloatingSettingsPanel from "@/components/FloatingSettingsPanel";
import RecentlyPlayedSection from "@/components/RecentlyPlayedSection";
import FestivalPopup from "@/components/FestivalPopup";
import TimeLighting from "@/components/TimeLighting";
import SectionFullView from "@/components/SectionFullView";
import HeroSection from "@/components/HeroSection";
import DynamicSection from "@/components/DynamicSection";
import ModernSongCard from "@/components/ModernSongCard";
import { Music2 } from "lucide-react";

import { trendingSongs, popularSongs, newReleases, uniqueSongs, moreSongs, massRapSongs, HindiSongs } from "@/data/allSongs";
import ArtistGrid from "@/components/ArtistGrid";
import { playlists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import UserProfile from "@/components/UserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDailyRotatedSongs } from "@/utils/dailyRotation";
import { getGreeting } from "@/utils/timeGreeting";

import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/data/songs";

const Index = () => {
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { onboardingStatus, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const [timeBasedBanner, setTimeBasedBanner] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);
  const [showFestivalPopup, setShowFestivalPopup] = useState(false);
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
    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Simplified banner content fetching
    const fetchContent = async () => {
      try {
        const { data: bannerData, error: bannerError } = await supabase.rpc('get_time_based_content', {
          content_type_param: 'banner'
        });
        
        if (bannerError) throw bannerError;
        
        const currentBanner = bannerData?.find((item: any) => item.is_current_period);
        if (currentBanner?.content_data && typeof currentBanner.content_data === 'object' && 'message' in currentBanner.content_data) {
          setTimeBasedBanner(currentBanner.content_data.message as string);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    
    fetchContent();
  }, []);
  
  // Static sections - all showing as numbered lists like Spotify
  const staticSections = [
    { id: 'trending', title: 'Trending Now', songs: trendingSongs },
    { id: 'popular', title: 'Popular Right Now', songs: popularSongs },
    { id: 'massRap', title: 'Mass & Rap Hits', songs: massRapSongs },
    { id: 'hindi', title: 'Hindi, Tamil & English', songs: HindiSongs },
    { id: 'moreSongs', title: 'More Hits', songs: moreSongs },
    { id: 'romantic', title: 'Romantic Melodies', songs: uniqueSongs.filter(song => song.sync === 'romantic' || song.sync === 'love') },
    { id: 'dance', title: 'Dance & Party', songs: uniqueSongs.filter(song => song.sync === 'dance' || song.sync === 'party') },
    { id: 'devotional', title: 'Devotional Songs', songs: uniqueSongs.filter(song => song.sync === 'devotional') }
  ];

  const quickPicks = getDailyRotatedSongs(6);

  const openSectionFullView = (title: string, songs: Song[]) => {
    setCurrentFullViewSection({
      title,
      songs,
      isOpen: true,
    });
  };

  const closeSectionFullView = () => {
    setCurrentFullViewSection(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Only show onboarding for logged-in users who haven't completed it
  const showOnboarding = isLoggedIn && onboardingStatus && !onboardingStatus.completed;
  
  return (
    <div className="relative pb-36 px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Time-based lighting overlay */}
      <TimeLighting />
      
      <MusicVisualizer />
      
      {/* Floating Music Info Component */}
      <FloatingMusicInfo />
      
      {/* Festival Popup */}
      <FestivalPopup onClose={() => setShowFestivalPopup(false)} />
      
      {/* Header with Greeting */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 md:mb-8 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1.5 sm:mb-2 truncate">
            {getGreeting()}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Discover your next favorite song</p>
        </div>
        <UserProfile />
      </div>
      
      {/* Time-based Banner */}
      {timeBasedBanner && (
        <div className="mb-4 sm:mb-5 md:mb-6 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl md:rounded-2xl border border-primary/30 backdrop-blur-sm shadow-spotify">
          <p className="text-center text-sm sm:text-base md:text-lg font-semibold text-primary-glow">
            {timeBasedBanner}
          </p>
        </div>
      )}

      <div className="space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10">
        {/* Hero Section with enhanced animations */}
        <HeroSection className="animate-fade-in -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8" />

        {/* Quick Picks - Prominent placement */}
        <div className="animate-slide-up">
          <DynamicSection
            title="🎵 Made for you today"
            songs={quickPicks}
            layout={isMobile ? "grid" : "horizontal"}
            cardSize={isMobile ? "large" : "medium"}
            className="bg-gradient-to-b from-primary/10 to-transparent rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-primary/20"
          />
        </div>

        {/* Trending Section - Featured */}
        <div className="animate-slide-up">
          <DynamicSection
            title="🔥 Trending Now"
            songs={trendingSongs}
            layout="grid"
            cardSize={isMobile ? "large" : "medium"}
            showRankings={false}
            onViewAll={() => openSectionFullView("Trending Now", trendingSongs)}
            className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-primary/20"
          />
        </div>

        {/* Artist Grid */}
        <div className="animate-slide-up">
          <div className="bg-gradient-to-r from-muted/50 to-primary/10 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/30">
            <ArtistGrid title="⭐ Featured Artists" className="" />
          </div>
        </div>

        {/* Popular - List view */}
        <div className="animate-slide-up">
          <DynamicSection
            title="💎 Popular Right Now"
            songs={popularSongs}
            layout={isMobile ? "grid" : "list"}
            cardSize={isMobile ? "large" : "medium"}
            showRankings={!isMobile}
            onViewAll={() => openSectionFullView("Popular Right Now", popularSongs)}
            className="bg-card/50 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/50"
          />
        </div>

        {/* Static Sections - Alternating layouts */}
        {staticSections.slice(2).map((section, index) => (
          <div 
            key={section.id}
            className="animate-slide-up transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <DynamicSection
              title={section.title}
              songs={section.songs}
              layout={isMobile ? "grid" : (index % 2 === 0 ? "list" : "horizontal")}
              cardSize={isMobile ? "large" : "medium"}
              showRankings={!isMobile && index % 2 === 0}
              onViewAll={() => openSectionFullView(section.title, section.songs)}
              className="bg-card/30 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/30 hover:border-primary/30 transition-all"
            />
          </div>
        ))}

        {/* Featured Playlists Section */}
        <div className="animate-slide-up">
          <DynamicSection
            title="📚 Your Playlists"
            songs={[]}
            layout="grid"
            cardSize={isMobile ? "large" : "medium"}
            isPlaylistSection={true}
            onViewAll={() => navigate('/playlists')}
            className="bg-gradient-to-tl from-primary/10 to-accent/10 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-primary/20"
          />
        </div>

        {/* Recently Played with enhanced styling */}
        <div className="animate-slide-up mb-6 sm:mb-8 md:mb-10">
          <div className="bg-card/40 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/40">
            <RecentlyPlayedSection />
          </div>
        </div>
      </div>

      {/* Onboarding Flow - Only show for logged-in users */}
      {!onboardingLoading && showOnboarding && (
        <OnboardingFlow onComplete={markOnboardingComplete} />
      )}
      
      {/* Floating Settings Components */}
      <FloatingSettingsPanel 
        isVisible={showFloatingSettings}
        onToggle={setShowFloatingSettings}
      />

      {/* Section Full View */}
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
