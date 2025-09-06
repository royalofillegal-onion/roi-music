import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Heart, Plus, ListMusic, Search } from 'lucide-react';
import { Song } from '@/data/songs';
import { usePlayer } from '@/context/PlayerContext';
import { allSongs } from '@/data/allSongs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';

interface ArtistFullViewProps {
  artistName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ArtistFullView = ({ artistName, isOpen, onClose }: ArtistFullViewProps) => {
  const { playSong, currentSong, isPlaying, addToQueue, toggleLikeSong, isLiked, playArtistSongs } = usePlayer();
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [otherArtists, setOtherArtists] = useState<Array<{name: string, image: string}>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && artistName) {
      const songs = allSongs.filter(song => 
        song.artist.toLowerCase().includes(artistName.toLowerCase())
      );
      setArtistSongs(songs);

      // Get other artists (excluding current artist)
      const artistMap = new Map();
      allSongs.forEach(song => {
        if (!artistMap.has(song.artist) && song.artist.toLowerCase() !== artistName.toLowerCase()) {
          artistMap.set(song.artist, {
            name: song.artist,
            image: song.imageUrl
          });
        }
      });
      setOtherArtists(Array.from(artistMap.values()));
    }
  }, [artistName, isOpen]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle swipe gestures
  useEffect(() => {
    if (!isOpen) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // If horizontal swipe is more significant than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 100) {
        if (diffX > 0) {
          // Left swipe - next artist
          if (otherArtists.length > 0) {
            const currentIndex = otherArtists.findIndex(artist => 
              artist.name.toLowerCase() === artistName.toLowerCase()
            );
            const nextIndex = currentIndex < otherArtists.length - 1 ? currentIndex + 1 : 0;
            handleArtistClick(otherArtists[nextIndex].name);
          }
        } else {
          // Right swipe - close
          handleClose();
        }
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, artistName, otherArtists]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleSongPlay = (song: Song) => {
    playSong(song);
  };

  const handleLike = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikeSong(song.id);
  };

  const handleAddToQueue = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  const handleArtistClick = (artistName: string) => {
    navigate(`/artist/${encodeURIComponent(artistName)}`);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-out flex flex-col",
      isClosing ? "translate-x-full" : "translate-x-0"
    )}>
      {/* Header with close button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <button
            onClick={(e) => handleClose(e)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-accent group-hover:translate-x-[-2px] transition-transform" />
          </button>
          
          <div className="text-center flex-1 mx-2 sm:mx-4">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate px-2">
              {artistName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{artistSongs.length} songs</p>
          </div>
          
          <div className="w-8 h-8 sm:w-10 sm:h-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Artist info section */}
      {artistSongs.length > 0 && (
        <div className="relative h-40 sm:h-48 md:h-64 bg-gradient-to-b from-primary/20 to-background">
          <img 
            src={artistSongs[0].imageUrl} 
            alt={artistName}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="relative h-full flex flex-col justify-end p-3 sm:p-4 md:p-6">
            <div className="mb-2 sm:mb-3 md:mb-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                {artistName}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm md:text-base">{artistSongs.length} songs available</p>
            </div>
            <button
              onClick={() => playArtistSongs(artistName, allSongs)}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-medium hover:bg-accent/90 transition-colors w-fit text-xs sm:text-sm md:text-base"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current" />
              Play All
            </button>
          </div>
        </div>
      )}

      {/* Content area with scroll */}
      <div className="flex-1 overflow-auto pb-20">
        {/* Songs list */}
        <div className="px-3 sm:px-4 py-4 sm:py-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Songs</h3>
          <div className="space-y-2 sm:space-y-3">
            {artistSongs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrentSong && isPlaying;

              return (
                <div
                  key={song.id}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors group",
                    isCurrentSong 
                      ? "bg-accent/20 text-accent" 
                      : "hover:bg-accent/5 text-foreground"
                  )}
                  onClick={() => handleSongPlay(song)}
                >
                  {/* Song number / Play indicator */}
                  <div className="w-6 sm:w-8 flex items-center justify-center flex-shrink-0">
                    {isCurrentPlaying ? (
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-accent animate-pulse" />
                        <div className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-accent animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 sm:w-1 h-3 sm:h-4 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="text-xs sm:text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0" />
                      </div>
                    )}
                  </div>

                  {/* Song artwork */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-accent/10 flex-shrink-0">
                    <img 
                      src={song.imageUrl} 
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song info */}
                  <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                    <h4 className={cn(
                      "font-medium text-sm sm:text-base leading-tight mb-0.5 sm:mb-1",
                      isCurrentSong ? "text-accent" : "text-foreground",
                      "truncate"
                    )}>
                      {song.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleLike(song, e)}
                      className={cn(
                        "p-1.5 sm:p-2 rounded-full hover:bg-accent/20 transition-colors",
                        isLiked(song.id) ? "text-red-500" : "text-muted-foreground"
                      )}
                    >
                      <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5", isLiked(song.id) && "fill-current")} />
                    </button>
                    
                    <button
                      onClick={(e) => handleAddToQueue(song, e)}
                      className="p-1.5 sm:p-2 rounded-full hover:bg-accent/20 transition-colors text-muted-foreground"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Helper text */}
          {artistSongs.length > 0 && (
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6 mb-3 sm:mb-4">
              Select a song to play
            </p>
          )}
        </div>

        {/* Related Artists Section */}
        {otherArtists.length > 0 && (
          <div className="px-3 sm:px-4 py-4 sm:py-6 border-t border-border">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Related Artists</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {otherArtists.length} artists
              </span>
            </div>
            
            {/* Grid layout for larger screens, scroll for mobile */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {otherArtists.slice(0, 12).map((artist) => (
                <div
                  key={artist.name}
                  className="group cursor-pointer flex-shrink-0"
                  onClick={() => handleArtistClick(artist.name)}
                >
                  <div className="relative overflow-hidden rounded-lg aspect-square bg-accent/10 hover:bg-accent/20 transition-all duration-300 group-hover:scale-105">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="mt-1.5 sm:mt-2">
                    <h4 className="font-medium text-foreground text-xs sm:text-sm truncate group-hover:text-accent transition-colors text-center">
                      {artist.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
            
            {/* See more artists link */}
            {otherArtists.length > 12 && (
              <div className="mt-4 sm:mt-6 text-center">
                <button 
                  onClick={() => navigate('/artists')}
                  className="text-accent hover:text-accent/80 text-sm sm:text-base font-medium transition-colors"
                >
                  View All Artists ({otherArtists.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation to other sections */}
        <div className="px-3 sm:px-4 py-4 sm:py-6 border-t border-border">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Explore More</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/playlists')}
              className="p-3 sm:p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <ListMusic className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                    Playlists
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Curated collections</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/search')}
              className="p-3 sm:p-4 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-foreground group-hover:text-accent transition-colors">
                    Search
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Find your music</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistFullView;
