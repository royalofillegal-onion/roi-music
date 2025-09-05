import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { allSongs } from '@/data/allSongs';
import { featuredArtists } from '@/data/artists';
import { toast } from 'sonner';

interface ArtistGridProps {
  title: string;
  className?: string;
  showAll?: boolean;
}

const ArtistGrid = ({ title, className = "", showAll = false }: ArtistGridProps) => {
  const navigate = useNavigate();
  
  // Get artists from featured list with their images from songs
  const getArtistsWithImages = () => {
    return featuredArtists.map(artist => {
      const artistSong = allSongs.find(song => 
        song.artist.toLowerCase().includes(artist.name.toLowerCase())
      );
      
      return {
        name: artist.name,
        image: artist.image || artistSong?.imageUrl || '/roi-assets/default-artist.png'
      };
    });
  };

  const artists = getArtistsWithImages().slice(0, showAll ? undefined : 6);

  const handleArtistClick = (artistName: string) => {
    navigate(`/artist/${encodeURIComponent(artistName)}`);
  };

  const handleShareArtist = (e: React.MouseEvent, artistName: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/artist/${encodeURIComponent(artistName)}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Check out ${artistName}`,
        text: `Listen to songs by ${artistName}`,
        url: shareUrl
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        toast.success('Artist link copied to clipboard!');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Artist link copied to clipboard!');
    }
  };
  
  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-bold mb-4 text-foreground">{title}</h2>
      
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {artists.map((artist) => (
            <div
              key={artist.name}
              className="group cursor-pointer flex-shrink-0 w-32"
              onClick={() => handleArtistClick(artist.name)}
            >
              <div className="relative overflow-hidden rounded-lg aspect-square bg-accent/10 hover:bg-accent/20 transition-all duration-300 group-hover:scale-105">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               {/* Share button */}
                <button
                  onClick={(e) => handleShareArtist(e, artist.name)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                  aria-label={`Share ${artist.name}`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
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
    </div>
  );
};

export default ArtistGrid;
