
import React from "react";
import { trendingSongs } from "@/data/songs";
import SongRow from "@/components/SongRow";

const Trending = () => {
  return (
    <div className="pt-6 pb-32 md:pb-4 px-4 md:px-8 md:ml-16">
      <h1 className="text-3xl font-bold mb-6 mt-2">Trending</h1>
      <div className="space-y-1 bg-gray-900/30 rounded-md overflow-hidden">
        {trendingSongs.map((song, index) => (
          <SongRow key={song.id} song={song} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Trending;
