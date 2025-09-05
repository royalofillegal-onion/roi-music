
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
    { id: 'popular', title: 'Popular Right Now', songs: popularSongs },
    { id: 'trending', title: 'Trending Now', songs: trendingSongs },
    { id: 'newReleases', title: 'New Releases', songs: newReleases },
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
    <div className="relative pb-32 md:pb-40 px-4 md:px-8 md:ml-16 min-h-screen">
      {/* Time-based lighting overlay */}
      <TimeLighting />
      
      <MusicVisualizer />
      
      {/* Floating Music Info Component */}
      <FloatingMusicInfo />
      
      {/* Festival Popup */}
      <FestivalPopup onClose={() => setShowFestivalPopup(false)} />
      
      {/* Header with User Profile and Site Name */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-bloody rounded-full flex items-center justify-center shadow-bloody animate-bloody-glow">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-fire bg-clip-text text-transparent">ROI MUSIC</h1>
          </div>
        </div>
        <UserProfile />
      </div>
      
      {/* Time-based Banner */}
      {timeBasedBanner && (
        <div className="mb-6 p-4 bg-gradient-bloody rounded-xl border border-primary/30 backdrop-blur-sm shadow-crimson">
          <p className="text-center text-sm md:text-base font-medium text-primary-glow">
            {timeBasedBanner}
          </p>
        </div>
      )}

      <div className="space-y-6 md:space-y-8 lg:space-y-12">
        {/* Hero Section with enhanced animations */}
        <HeroSection className="animate-fade-in" />

        {/* Artist Grid */}
        <div className="animate-slide-up">
          <ArtistGrid title="Featured Artists" className="mb-6" />
        </div>

        {/* Quick Picks Grid - Enhanced for mobile */}
        <DynamicSection
          title="Made for you"
          songs={quickPicks}
          layout={isMobile ? "grid" : "horizontal"}
          cardSize={isMobile ? "small" : "medium"}
          className="animate-slide-up"
        />

        {/* Static Sections */}
        {staticSections.map((section, index) => (
          <div 
            key={section.id}
            className="animate-slide-up hover-scale transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <DynamicSection
              title={section.title}
              songs={section.songs}
              layout="list"
              cardSize="small"
              showRankings={true}
              onViewAll={() => openSectionFullView(section.title, section.songs)}
              className="transition-all duration-300 hover:shadow-bloody"
            />
          </div>
        ))}

        {/* Featured Playlists Section */}
        <div className="animate-slide-up">
          <DynamicSection
            title="Featured Playlists"
            songs={[]} // Will be handled differently in DynamicSection
            layout="grid"
            cardSize="medium"
            isPlaylistSection={true}
            onViewAll={() => navigate('/playlists')}
            className="transition-all duration-300"
          />
        </div>

        {/* Recently Played with enhanced styling */}
        <div className="animate-slide-up">
          <RecentlyPlayedSection />
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
