
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
    <div className="relative pb-32 px-3 sm:px-4 md:px-6 py-4 md:py-8 min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Time-based lighting overlay */}
      <TimeLighting />
      
      <MusicVisualizer />
      
      {/* Floating Music Info Component */}
      <FloatingMusicInfo />
      
      {/* Festival Popup */}
      <FestivalPopup onClose={() => setShowFestivalPopup(false)} />
      
      {/* Header with Greeting */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 truncate">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Discover your next favorite song</p>
        </div>
        <UserProfile />
      </div>
      
      {/* Time-based Banner */}
      {timeBasedBanner && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-bloody rounded-lg md:rounded-xl border border-primary/30 backdrop-blur-sm shadow-crimson">
          <p className="text-center text-xs sm:text-sm md:text-base font-medium text-primary-glow">
            {timeBasedBanner}
          </p>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        {/* Hero Section with enhanced animations */}
        <HeroSection className="animate-fade-in -mx-3 sm:-mx-4 md:-mx-6" />

        {/* Quick Picks - Prominent placement */}
        <div className="animate-slide-up">
          <DynamicSection
            title="🎵 Made for you today"
            songs={quickPicks}
            layout={isMobile ? "grid" : "horizontal"}
            cardSize="medium"
            className="bg-gradient-to-b from-primary/5 to-transparent rounded-2xl p-4 md:p-6 border border-primary/10"
          />
        </div>

        {/* Trending Section - Featured */}
        <div className="animate-slide-up">
          <DynamicSection
            title="🔥 Trending Now"
            songs={trendingSongs}
            layout="grid"
            cardSize="small"
            showRankings={false}
            onViewAll={() => openSectionFullView("Trending Now", trendingSongs)}
            className="bg-gradient-to-br from-accent/10 via-primary/5 to-transparent rounded-2xl p-4 md:p-6 border border-accent/20"
          />
        </div>

        {/* Artist Grid */}
        <div className="animate-slide-up">
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl p-4 md:p-6 border border-secondary/20">
            <ArtistGrid title="⭐ Featured Artists" className="" />
          </div>
        </div>

        {/* Popular - List view */}
        <div className="animate-slide-up">
          <DynamicSection
            title="💎 Popular Right Now"
            songs={popularSongs}
            layout="list"
            cardSize="small"
            showRankings={true}
            onViewAll={() => openSectionFullView("Popular Right Now", popularSongs)}
            className="bg-card/50 rounded-2xl p-4 md:p-6 border border-border/50"
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
              layout={index % 2 === 0 ? "list" : "horizontal"}
              cardSize="small"
              showRankings={index % 2 === 0}
              onViewAll={() => openSectionFullView(section.title, section.songs)}
              className="bg-card/30 rounded-xl p-4 md:p-5 border border-border/30 hover:border-primary/30 transition-all"
            />
          </div>
        ))}

        {/* Featured Playlists Section */}
        <div className="animate-slide-up">
          <DynamicSection
            title="📚 Your Playlists"
            songs={[]}
            layout="grid"
            cardSize="medium"
            isPlaylistSection={true}
            onViewAll={() => navigate('/playlists')}
            className="bg-gradient-to-tl from-primary/10 to-accent/10 rounded-2xl p-4 md:p-6 border border-primary/20"
          />
        </div>

        {/* Recently Played with enhanced styling */}
        <div className="animate-slide-up mb-8">
          <div className="bg-card/40 rounded-2xl p-4 md:p-6 border border-border/40">
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
