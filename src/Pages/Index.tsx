
import React, { useEffect, useState } from "react";
import SliderRow from "@/components/SliderRow";
import SongCard from "@/components/SongCard";
import PlaylistCard from "@/components/PlaylistCard";
import SpotifyLikeSection from "@/components/SpotifyLikeSection";
import MusicVisualizer from "@/components/MusicVisualizer";
import GlowingButton from "@/components/GlowingButton";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import RecentlyPlayedSection from "@/components/RecentlyPlayedSection";
import { Button } from "@/components/ui/button";
import { trendingSongs, popularSongs, newReleases, uniqueSongs } from "@/data/allSongs";
import { massRapSongs } from "@/data/massRapSongs";
import { playlists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";
import UserProfile from "@/components/UserProfile";
import AnimatedHeader from "@/components/AnimatedHeader";
import { Play, Shuffle, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { showNotification } from "@/utils/notificationUtils";
import { Song } from "@/data/songs";

const Index = () => {
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const { onboardingStatus, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const [timeBasedBanner, setTimeBasedBanner] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [homepageSections, setHomepageSections] = useState<{
    goodMorning: Song | null;
    trendingNow: Song | null;
  }>({
    goodMorning: null,
    trendingNow: null,
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
    showNotification.nowPlaying(randomSong.title, randomSong.artist);
    showNotification.shuffleMode();
  };

  const playTrendingPlaylist = () => {
    if (trendingSongs.length > 0) {
      const currentSong = trendingSongs[currentTrendingIndex];
      playSong(currentSong);
      showNotification.nowPlaying(currentSong.title, currentSong.artist);
      // Cycle to next song for next click
      setCurrentTrendingIndex((prev) => (prev + 1) % trendingSongs.length);
    }
  };

  // Only show onboarding for logged-in users who haven't completed it
  const showOnboarding = isLoggedIn && onboardingStatus && !onboardingStatus.completed;
  
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <MusicVisualizer />
      
      {/* Floating Music Info Component */}
      <FloatingMusicInfo />
      
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
        <SliderRow title="Featured Playlists" className="animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title="Popular Songs" className="animate-slide-up" style={{animationDelay: "400ms"}}>
          <div className="flex gap-4">
            {popularSongs.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title="Mass Rap" className="animate-slide-up" style={{animationDelay: "450ms"}}>
          <div className="flex gap-4">
            {massRapSongs.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title="New Releases" className="animate-slide-up" style={{animationDelay: "500ms"}}>
          <div className="flex gap-4">
            {newReleases.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
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
    </div>
  );
};

export default Index;
