
import React from "react";
import EnhancedSearch from "@/components/EnhancedSearch";

const Search = () => {
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search Music</h1>
          <p className="text-gray-400">
            Find songs by name, artist, category, mood, or tags like "god", "trending", "sad", "love"
          </p>
        </div>
        
        <EnhancedSearch />
      </div>
    </div>
  );
};

export default Search;
