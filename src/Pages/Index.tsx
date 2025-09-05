
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
import { shuffleManager } from "@/utils/hourlyShuffleManager";
import { getCurrentSections } from "@/utils/sectionShuffle";
import { Music2 } from "lucide-react";

import { trendingSongs, popularSongs, newReleases, uniqueSongs } from "@/data/allSongs";
import ArtistGrid from "@/components/ArtistGrid";
import { massRapSongs } from "@/data/massRapSongs";
import { moreSongs } from "@/data/moreSongs";
import { HindiSongs } from "@/data/HindiSongs";
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
  
  // Enhanced dynamic content with hourly shuffling
  const getShuffledSectionData = () => {
    const baseSections = [
      { id: 'popular', title: 'Popular Right Now', songs: popularSongs, priority: 1 },
      { id: 'newReleases', title: 'New Releases', songs: newReleases, priority: 3 },
      { id: 'massRap', title: 'Mass & Rap Hits', songs: massRapSongs, priority: 4 },
      { id: 'hindi', title: 'Hindi, Tamil & English', songs: HindiSongs, priority: 5 },
      { id: 'romantic', title: 'Romantic Melodies', songs: uniqueSongs.filter(song => song.sync === 'romantic' || song.sync === 'love'), priority: 6 },
      { id: 'dance', title: 'Dance & Party', songs: uniqueSongs.filter(song => song.sync === 'dance' || song.sync === 'party'), priority: 7 },
      { id: 'devotional', title: 'Devotional Songs', songs: uniqueSongs.filter(song => song.sync === 'devotional'), priority: 8 }
    ].map(section => ({
      ...section,
      lastShuffled: 0
    }));

    return shuffleManager.getShuffledSections(baseSections);
  };

  const quickPicks = getDailyRotatedSongs(6);
  const shuffledSections = getShuffledSectionData();

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
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-purple-600 rounded-full flex items-center justify-center">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">ROI MUSIC</h1>
          </div>
        </div>
        <UserProfile />
      </div>
      
      {/* Time-based Banner */}
      {timeBasedBanner && (
        <div className="mb-6 p-4 bg-gradient-to-r from-accent/20 to-purple-600/20 rounded-xl border border-accent/30 backdrop-blur-sm">
          <p className="text-center text-sm md:text-base font-medium text-accent">
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

        {/* Dynamic Shuffled Sections */}
        {shuffledSections.slice(0, 8).map((section, index) => (
          <div 
            key={`${section.id}-${section.lastShuffled}`}
            className="animate-slide-up hover-scale transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <DynamicSection
              title={section.title}
              songs={section.songs}
              layout="three-row"
              cardSize={isMobile ? "small" : "medium"}
              showRankings={index === 0}
              onViewAll={() => openSectionFullView(section.title, section.songs)}
              className="transition-all duration-300"
            />
          </div>
        ))}

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
