
import React from "react";
import SliderRow from "@/components/SliderRow";
import SongCard from "@/components/SongCard";
import PlaylistCard from "@/components/PlaylistCard";
import { trendingSongs, popularSongs, newReleases } from "@/data/songs";
import { playlists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import UserProfile from "@/components/UserProfile";

const Index = () => {
  const { recentlyPlayed } = usePlayer();
  
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <h1 className="text-3xl font-bold mb-6 mt-2 animate-slide-in">Welcome to RoyalStar Music <span className="text-music-accent">Pro Advanced Edition</span></h1>
        <UserProfile />
      </div>
      
      {recentlyPlayed.length > 0 && (
        <SliderRow title="Recently Played" className="animate-fade-in">
          <div className="flex gap-4">
            {recentlyPlayed.map((song) => (
              <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
            ))}
          </div>
        </SliderRow>
      )}
      
      <SliderRow title="Trending Now" className="animate-slide-up" style={{animationDelay: "100ms"}}>
        <div className="flex gap-4">
          {trendingSongs.map((song) => (
            <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
          ))}
        </div>
      </SliderRow>
      
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
      
      <SliderRow title="New Releases" className="animate-slide-up" style={{animationDelay: "400ms"}">
        <div className="flex gap-4">
          {newReleases.map((song) => (
            <SongCard key={song.id} song={song} className="min-w-[180px] w-[180px]" />
          ))}
        </div>
      </SliderRow>
    </div>
  );
};

export default Index;
