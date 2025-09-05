import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { allSongs } from '@/data/allSongs';
import { featuredArtists } from '@/data/artists';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ArtistGridProps {
  title: string;
  className?: string;
  showAll?: boolean;
}

const ArtistGrid = ({ title, className = "", showAll = false }: ArtistGridProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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
        {/* Mobile Grid - 2 columns for mobile, horizontal scroll for desktop */}
        {isMobile ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {artists.map((artist) => (
              <div
                key={artist.name}
                className="group cursor-pointer"
                onClick={() => handleArtistClick(artist.name)}
              >
                <div className="relative overflow-hidden rounded-xl aspect-square bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Share button - always visible on mobile */}
                  <button
                    onClick={(e) => handleShareArtist(e, artist.name)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 text-foreground transition-all duration-200 z-10"
                    aria-label={`Share ${artist.name}`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Artist name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-medium text-white text-sm truncate drop-shadow-sm">
                      {artist.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop - horizontal scroll */
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {artists.map((artist) => (
              <div
                key={artist.name}
                className="group cursor-pointer flex-shrink-0 w-36"
                onClick={() => handleArtistClick(artist.name)}
              >
                <div className="relative overflow-hidden rounded-xl aspect-square bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Share button - hover on desktop */}
                  <button
                    onClick={(e) => handleShareArtist(e, artist.name)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                    aria-label={`Share ${artist.name}`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                    {artist.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistGrid;
