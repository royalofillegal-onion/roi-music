import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allSongs } from '@/data/allSongs';

interface ArtistGridProps {
  title: string;
  className?: string;
}

const ArtistGrid = ({ title, className = "" }: ArtistGridProps) => {
  const navigate = useNavigate();
  
  // Get unique artists with their first song image
  const getUniqueArtists = () => {
    const artistMap = new Map();
    
    allSongs.forEach(song => {
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          name: song.artist,
          image: song.imageUrl
        });
      }
    });
    
    return Array.from(artistMap.values()).slice(0, 12); // Show first 12 artists
  };

  const artists = getUniqueArtists();

  const handleArtistClick = (artistName: string) => {
    navigate(`/artist/${encodeURIComponent(artistName)}`);
  };

  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-bold mb-4 text-foreground">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className="group cursor-pointer"
            onClick={() => handleArtistClick(artist.name)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-square bg-accent/10 hover:bg-accent/20 transition-all duration-300 group-hover:scale-105">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="mt-2 text-center">
              <h3 className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                {artist.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistGrid;