import React, { useState } from 'react';
import ArtistFullView from './ArtistFullView';
import ArtistButton from './ArtistButton';
import { allSongs } from '@/data/allSongs';

const ArtistFullViewDemo = () => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Get unique artists from all songs
  const uniqueArtists = Array.from(new Set(allSongs.map(song => song.artist)))
    .slice(0, 6); // Show first 6 artists for demo

  const handleArtistClick = (artistName: string) => {
    setSelectedArtist(artistName);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedArtist(null);
  };

  // Get an image for each artist from their first song
  const getArtistImage = (artistName: string) => {
    const artistSong = allSongs.find(song => song.artist === artistName);
    return artistSong?.imageUrl;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Artists</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueArtists.map((artist) => (
          <ArtistButton
            key={artist}
            artistName={artist}
            imageUrl={getArtistImage(artist)}
            onClick={handleArtistClick}
          />
        ))}
      </div>

      {selectedArtist && (
        <ArtistFullView
          artistName={selectedArtist}
          isOpen={isViewOpen}
          onClose={handleCloseView}
        />
      )}
    </div>
  );
};

export default ArtistFullViewDemo;