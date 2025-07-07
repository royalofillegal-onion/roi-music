
import React from "react";
import SliderRow from "@/components/SliderRow";
import { getAllSongs, getTrendingSongs, getPopularSongs } from "@/utils/searchUtils";

const Index = () => {
  // Get songs from both sources
  const allSongs = getAllSongs();
  const trendingSongs = getTrendingSongs();
  const popularSongs = getPopularSongs();
  const newReleases = allSongs.slice(0, 8); // First 8 songs as new releases

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-music-accent to-purple-400 bg-clip-text text-transparent">
            Welcome to RoyalStar Music
          </h1>
          <p className="text-gray-400 text-lg">
            Discover amazing music from {allSongs.length} songs across multiple collections
          </p>
        </div>
        
        <div className="space-y-8">
          <SliderRow 
            title="Trending Now" 
            songs={trendingSongs}
            description="Most popular tracks right now"
          />
          
          <SliderRow 
            title="Popular Music" 
            songs={popularSongs}
            description="Feel-good hits and energetic tracks"
          />
          
          <SliderRow 
            title="New Releases" 
            songs={newReleases}
            description="Latest additions to our collection"
          />
          
          <SliderRow 
            title="All Music" 
            songs={allSongs.slice(0, 12)}
            description="Browse our complete music library"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
