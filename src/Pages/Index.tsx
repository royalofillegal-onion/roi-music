
import React from "react";
import SliderRow from "@/components/SliderRow";
import SongCard from "@/components/SongCard";
import PlaylistCard from "@/components/PlaylistCard";
import SpotifyLikeSection from "@/components/SpotifyLikeSection";
import MusicVisualizer from "@/components/MusicVisualizer";
import GlowingButton from "@/components/GlowingButton";
import { trendingSongs, popularSongs, newReleases } from "@/data/songs";
import { playlists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { useNavigate } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import AnimatedHeader from "@/components/AnimatedHeader";
import { Play, Shuffle, Heart } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { recentlyPlayed, playSong } = usePlayer();
  const navigate = useNavigate();
  
  const shuffleAllSongs = () => {
    const allSongs = [...trendingSongs, ...popularSongs, ...newReleases];
    const randomSong = allSongs[Math.floor(Math.random() * allSongs.length)];
    playSong(randomSong);
    toast.success("Shuffling all songs!");
  };

  const playTrendingPlaylist = () => {
    if (trendingSongs.length > 0) {
      playSong(trendingSongs[0]);
      toast.success("Playing trending hits!");
    }
  };
  
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <MusicVisualizer />
      
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
      
      {/* Spotify-like main section */}
      <SpotifyLikeSection />
      
      {/* Original sections with improved spacing */}
      <div className="mt-12 space-y-8">
        <SliderRow title="Featured Playlists" className="animate-slide-up" style={{animationDelay: "200ms"}}>
          <div className="flex gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title="Popular Songs" className="animate-slide-up" style={{animationDelay: "300ms"}}>
          <div className="flex gap-4">
            {popularSongs.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
        
        <SliderRow title="New Releases" className="animate-slide-up" style={{animationDelay: "400ms"}}>
          <div className="flex gap-4">
            {newReleases.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
      </div>
    </div>
  );
};

export default Index;
