import React, { useEffect, useState } from "react";
import SliderRow from "@/components/SliderRow";
import SongCard from "@/components/SongCard";
import PlaylistCard from "@/components/PlaylistCard";
import SpotifyLikeSection from "@/components/SpotifyLikeSection";
import MusicVisualizer from "@/components/MusicVisualizer";
import GlowingButton from "@/components/GlowingButton";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FloatingMusicInfo from "@/components/FloatingMusicInfo";
import { songs } from "@/data/songs";
import { enhancedSongs } from "@/data/songsData";
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

const Index = () => {
  const { recentlyPlayed, playSong } = usePlayer();
  const navigate = useNavigate();
  const { onboardingStatus, loading: onboardingLoading, markOnboardingComplete } = useOnboarding();
  const [timeBasedBanner, setTimeBasedBanner] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Combine and convert all songs to uniform format
  const convertedEnhancedSongs = enhancedSongs.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist,
    imageUrl: song.imageUrl,
    audioUrl: song.audioUrl,
    duration: song.duration,
    category: song.category,
    mood: song.mood,
    tags: song.tags,
    album: song.album,
    genre: song.genre
  }));

  // Combine all songs and remove duplicates
  const allSongs = [...songs, ...convertedEnhancedSongs];
  const uniqueSongs = allSongs.filter((song, index, self) => 
    index === self.findIndex(s => s.id === song.id)
  );

  // Create enhanced collections from combined songs
  const combinedTrending = uniqueSongs.filter(song => 
    song.category === 'trending' || (song.tags && song.tags.includes('trending'))
  ).slice(0, 12);

  const combinedPopular = uniqueSongs.filter(song => 
    (song.tags && song.tags.includes('popular')) || 
    song.category === 'love' || 
    song.mood === 'energetic' ||
    song.category === 'party'
  ).slice(0, 12);

  const combinedNewReleases = uniqueSongs.slice(-12); // Get the last 12 songs as new releases

  // Additional collections showing songs from enhanced collection
  const devotionalSongs = uniqueSongs.filter(song => 
    song.category === 'devotional' || song.category === 'god' || song.mood === 'spiritual'
  ).slice(0, 8);

  const workoutSongs = uniqueSongs.filter(song => 
    song.category === 'workout' || (song.tags && song.tags.includes('workout'))
  ).slice(0, 8);

  const chillSongs = uniqueSongs.filter(song => 
    song.category === 'chill' || song.mood === 'peaceful'
  ).slice(0, 8);

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
    // Fetch time-based banner content
    const fetchTimeBasedContent = async () => {
      try {
        const { data, error } = await supabase.rpc('get_time_based_content', {
          content_type_param: 'banner'
        });
        
        if (error) throw error;
        
        const currentBanner = data?.find((item: any) => item.is_current_period);
        if (currentBanner?.content_data && typeof currentBanner.content_data === 'object' && 'message' in currentBanner.content_data) {
          setTimeBasedBanner(currentBanner.content_data.message as string);
        }
      } catch (error) {
        console.error('Error fetching time-based content:', error);
      }
    };
    
    fetchTimeBasedContent();
  }, []);
  
  const shuffleAllSongs = () => {
    const randomSong = uniqueSongs[Math.floor(Math.random() * uniqueSongs.length)];
    playSong(randomSong);
    showNotification.nowPlaying(randomSong.title, randomSong.artist);
    showNotification.shuffleMode();
  };

  const playTrendingPlaylist = () => {
    if (combinedTrending.length > 0) {
      playSong(combinedTrending[0]);
      showNotification.nowPlaying(combinedTrending[0].title, combinedTrending[0].artist);
    }
  };

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
        <AnimatedHeader />
        <UserProfile />
      </div>
      
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <GlowingButton 
          variant="primary" 
          onClick={shuffleAllSongs}
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle All ({uniqueSongs.length} songs)
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
      
      <SpotifyLikeSection />
      
      {/* Enhanced sections with combined songs */}
      <div className="mt-12 space-y-8">
        <SliderRow title="Featured Playlists" className="animate-slide-up" style={{animationDelay: "200ms"}}>
          <div className="flex gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title={`Trending Songs (${combinedTrending.length})`} className="animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex gap-4">
            {combinedTrending.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title={`Popular Songs (${combinedPopular.length})`} className="animate-slide-up" style={{animationDelay: "400ms"}}>
          <div className="flex gap-4">
            {combinedPopular.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>

        {devotionalSongs.length > 0 && (
          <SliderRow title={`Devotional & Spiritual (${devotionalSongs.length})`} className="animate-slide-up" style={{animationDelay: "450ms"}}>
            <div className="flex gap-4">
              {devotionalSongs.map((song) => (
                <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
              ))}
            </div>
          </SliderRow>
        )}

        {workoutSongs.length > 0 && (
          <SliderRow title={`Workout & Energy (${workoutSongs.length})`} className="animate-slide-up" style={{animationDelay: "475ms"}}>
            <div className="flex gap-4">
              {workoutSongs.map((song) => (
                <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
              ))}
            </div>
          </SliderRow>
        )}

        {chillSongs.length > 0 && (
          <SliderRow title={`Chill & Peaceful (${chillSongs.length})`} className="animate-slide-up" style={{animationDelay: "500ms"}}>
            <div className="flex gap-4">
              {chillSongs.map((song) => (
                <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
              ))}
            </div>
          </SliderRow>
        )}
        
        <SliderRow title={`New Releases (${combinedNewReleases.length})`} className="animate-slide-up" style={{animationDelay: "525ms"}}>
          <div className="flex gap-4">
            {combinedNewReleases.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
      </div>

      {!onboardingLoading && showOnboarding && (
        <OnboardingFlow onComplete={markOnboardingComplete} />
      )}
    </div>
  );
};

export default Index;
