
import React, { useEffect, useState } from "react";
import SliderRow from "@/components/SliderRow";
import SongCard from "@/components/SongCard";
import PlaylistCard from "@/components/PlaylistCard";
import SpotifyLikeSection from "@/components/SpotifyLikeSection";
import MusicVisualizer from "@/components/MusicVisualizer";
import GlowingButton from "@/components/GlowingButton";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import FloatingSettingsPanel from "@/components/FloatingSettingsPanel";
import FloatingSettingsToggle from "@/components/FloatingSettingsToggle";
import RecentlyPlayedSection from "@/components/RecentlyPlayedSection";
import ArtistGrid from "@/components/ArtistGrid";
import FestivalPopup from "@/components/FestivalPopup";
import TimeLighting from "@/components/TimeLighting";
import SectionFullView from "@/components/SectionFullView";
import { getCurrentSections } from "@/utils/sectionShuffle";

import { Button } from "@/components/ui/button";
import { trendingSongs, popularSongs, newReleases, uniqueSongs } from "@/data/allSongs";
import { massRapSongs } from "@/data/massRapSongs";
import { moreSongs } from "@/data/moreSongs";
import { HindiSongs } from "@/data/HindiSongs";
import { playlists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import UserProfile from "@/components/UserProfile";
import AnimatedHeader from "@/components/AnimatedHeader";
import { Play, Shuffle, Heart } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/data/songs";

const Index = () => {
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const { onboardingStatus, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const [timeBasedBanner, setTimeBasedBanner] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [showFestivalPopup, setShowFestivalPopup] = useState(false);
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);
  const [homepageSections, setHomepageSections] = useState<{
    goodMorning: Song | null;
    trendingNow: Song | null;
  }>({
    goodMorning: null,
    trendingNow: null,
  });
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
    // Fetch time-based banner content and homepage sections
    const fetchContent = async () => {
      try {
        // Fetch time-based banner
        const { data: bannerData, error: bannerError } = await supabase.rpc('get_time_based_content', {
          content_type_param: 'banner'
        });
        
        if (bannerError) throw bannerError;
        
        const currentBanner = bannerData?.find((item: any) => item.is_current_period);
        if (currentBanner?.content_data && typeof currentBanner.content_data === 'object' && 'message' in currentBanner.content_data) {
          setTimeBasedBanner(currentBanner.content_data.message as string);
        }

        // Fetch homepage sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('homepage_sections')
          .select('*')
          .order('position');
        
        if (sectionsError) throw sectionsError;
        
        // Process sections data and find songs
        const goodMorningSection = sectionsData?.find(section => section.section_name === 'Good Morning');
        const trendingNowSection = sectionsData?.find(section => section.section_name === 'Trending Now');
        
        const findSongById = (songId: string): Song | null => {
          return uniqueSongs.find(song => song.id === songId) || null;
        };
        
        setHomepageSections({
          goodMorning: goodMorningSection ? findSongById(goodMorningSection.song_id) : null,
          trendingNow: trendingNowSection ? findSongById(trendingNowSection.song_id) : null,
        });
        
      } catch (error) {
        console.error('Error fetching content:', error);
        // Set default songs on error
        setHomepageSections({
          goodMorning: null,
          trendingNow: null,
        });
      }
    };
    
    fetchContent();
  }, []);
  
  const shuffleAllSongs = () => {
    const randomSong = uniqueSongs[Math.floor(Math.random() * uniqueSongs.length)];
    playSong(randomSong);
  };

  const playTrendingPlaylist = () => {
    if (trendingSongs.length > 0) {
      const currentSong = trendingSongs[currentTrendingIndex];
      playSong(currentSong);
      // Cycle to next song for next click
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingSongs.length);
    }
  };

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
    <div className="relative pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      {/* Time-based lighting overlay */}
      <TimeLighting />
      
      <MusicVisualizer />
      
      {/* Floating Music Info Component */}
      <FloatingMusicInfo />
      
      
      {/* Festival Popup */}
      <FestivalPopup onClose={() => setShowFestivalPopup(false)} />
      
      {/* Time-based Banner */}
      {timeBasedBanner && (
        <div className="mb-6 p-4 bg-gradient-to-r from-music-accent/20 to-purple-600/20 rounded-lg border border-music-accent/30">
          <p className="text-center text-sm md:text-base font-medium text-music-accent">
            {timeBasedBanner}
          </p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-music-accent via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-slide-up">
            Welcome to ROI Music
          </h1>
          <p className="text-lg text-gray-400 animate-slide-up" style={{animationDelay: "200ms"}}>
            Discover your next favorite song
          </p>
        </div>
        <UserProfile />
      </div>
      
      {/* Toggle for Quick Actions */}
      {/* hide quick act
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="text-gray-400 hover:text-white"
        >
          {showQuickActions ? 'Show' : 'Hide'}
        </Button>
      </div>
       */}
      {/* Quick Action Buttons - Toggleable */}
       {/* hide quick act
      {showQuickActions && (
        <div className="flex flex-wrap gap-4 mb-8">
          <GlowingButton 
            variant="primary" 
            onClick={shuffleAllSongs}
            className="flex items-center gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle All
          </GlowingButton>
          
          <GlowingButton 
            variant="secondary" 
            onClick={playTrendingPlaylist}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Play Trending
          </GlowingButton>
          
          <GlowingButton 
            variant="accent" 
            onClick={() => navigate('/liked')}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            My Favorites
          </GlowingButton>
        </div>
      )}
       */}
      {/* Good Morning Section - Show only one song */}
      {homepageSections.goodMorning && (
        <SliderRow title="Good Morning" className="animate-slide-up mb-8" style={{animationDelay: "100ms"}}>
          <div className="flex gap-4">
            <SongCard 
              key={homepageSections.goodMorning.id} 
              song={homepageSections.goodMorning} 
              className="min-w-[180px] w-[180px]" 
            />
          </div>
        </SliderRow>
      )}
      
      {/* Spotify-like main section */}
      <SpotifyLikeSection />
      
      {/* Trending Now Section - Show only one song */}
      {homepageSections.trendingNow && (
        <SliderRow title="Trending Now" className="animate-slide-up mb-8" style={{animationDelay: "200ms"}}>
          <div className="flex gap-4">
            <SongCard 
              key={homepageSections.trendingNow.id} 
              song={homepageSections.trendingNow} 
              className="min-w-[180px] w-[180px]" 
            />
          </div>
        </SliderRow>
      )}

      {/* Original sections with improved spacing */}
      <div className="mt-12 space-y-8">

        {/* Dynamic sections with hourly shuffle */}
      <div className="mt-12 space-y-8">
        {getCurrentSections().map((section, index) => {
          let sectionSongs: Song[] = [];
          
          // Map section IDs to actual song arrays
          switch (section.id) {
            case 'trending':
              sectionSongs = trendingSongs.filter(Boolean);
              break;
            case 'popular':
              sectionSongs = popularSongs.filter(Boolean);
              break;
            case 'newReleases':
              sectionSongs = newReleases.filter(Boolean);
              break;
            case 'massRap':
              sectionSongs = massRapSongs.filter(Boolean);
              break;
            case 'hindi':
              sectionSongs = HindiSongs.filter(Boolean);
              break;
            case 'feelGood':
              sectionSongs = moreSongs.filter(Boolean);
              break;
          }
          
          const displayTitle = section.id === 'trending' ? 'Trending Now' :
                              section.id === 'popular' ? 'Popular Songs' :
                              section.id === 'newReleases' ? 'New Releases' :
                              section.id === 'massRap' ? 'Mass & Rap' :
                              section.id === 'hindi' ? 'Hindi & Tamil Songs' :
                              section.id === 'feelGood' ? 'Feel Good Vibes' :
                              section.title;

          return (
            <SliderRow
              key={`${section.id}-${index}`}
              title={displayTitle}
              className="animate-slide-up"
              style={{animationDelay: `${(index + 1) * 100}ms`}}
              onViewAll={() => openSectionFullView(displayTitle, sectionSongs)}
            >
              <div className="flex gap-4">
                {sectionSongs.slice(0, 15).map((song, songIndex) => (
                  <SongCard 
                    key={`${section.id}-${song.id}-${songIndex}`} 
                    song={song} 
                    className="min-w-[180px] w-[180px]" 
                  />
                ))}
              </div>
            </SliderRow>
          );
        })}

        <SliderRow title="Featured Playlists" className="animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>

        <SliderRow 
          title="Mass Rap" 
          className="animate-slide-up" 
          style={{animationDelay: "450ms"}}
          onViewAll={() => openSectionFullView("Mass Rap", massRapSongs.filter(Boolean))}
        >
          <div className="flex gap-4">
            {massRapSongs.filter(Boolean).map((song, index) => (
              <SongCard key={`mass-${song.id}-${index}`} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        

        <SliderRow 
          title="Hindi&Tamil&English Songs" 
          className="animate-slide-up" 
          style={{animationDelay: "500ms"}}
          onViewAll={() => openSectionFullView("Hindi&Tamil&English Songs", HindiSongs.filter(Boolean))}
        >
          <div className="flex gap-4">
            {HindiSongs.filter(Boolean).map((song, index) => (
              <SongCard key={`hindi-${song.id}-${index}`} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>

        <SliderRow 
          title="Romantic Melodies" 
          className="animate-slide-up" 
          style={{animationDelay: "550ms"}}
          onViewAll={() => openSectionFullView("Romantic Melodies", uniqueSongs.filter(song => song.sync === 'romantic' || song.sync === 'love').filter(Boolean))}
        >
          <div className="flex gap-4">
            {uniqueSongs.filter(song => song.sync === 'romantic' || song.sync === 'love').filter(Boolean).slice(0, 10).map((song, index) => (
              <SongCard key={`romantic-${song.id}-${index}`} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>

        <SliderRow 
          title="Dance Hits" 
          className="animate-slide-up" 
          style={{animationDelay: "600ms"}}
          onViewAll={() => openSectionFullView("Dance Hits", uniqueSongs.filter(song => song.sync === 'dance' || song.sync === 'party').filter(Boolean))}
        >
          <div className="flex gap-4">
            {uniqueSongs.filter(song => song.sync === 'dance' || song.sync === 'party').filter(Boolean).slice(0, 10).map((song, index) => (
              <SongCard key={`dance-${song.id}-${index}`} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>

        <SliderRow 
          title="Devotional Songs" 
          className="animate-slide-up" 
          style={{animationDelay: "650ms"}}
          onViewAll={() => openSectionFullView("Devotional Songs", uniqueSongs.filter(song => song.sync === 'devotional').filter(Boolean))}
        >
          <div className="flex gap-4">
            {uniqueSongs.filter(song => song.sync === 'devotional').filter(Boolean).slice(0, 10).map((song, index) => (
              <SongCard key={`devotional-${song.id}-${index}`} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>

        
        {/* Recently Played Section - Show only at the bottom */}
        <div className="mt-12">
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
