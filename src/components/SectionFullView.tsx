import React, { useEffect, useState } from 'react';
import { X, Play, Heart, Plus, Clock } from 'lucide-react';
import { Song } from '@/data/songs';
import { usePlayer } from '@/context/PlayerContext';
import { allSongs } from '@/data/allSongs';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SectionFullViewProps {
  title: string;
  songs: Song[];
  isOpen: boolean;
  onClose: () => void;
}

const SectionFullView = ({ title, songs, isOpen, onClose }: SectionFullViewProps) => {
  const { playSong, currentSong, isPlaying, addToQueue, toggleLikeSong, isLiked } = usePlayer();
  const navigate = useNavigate();
  const [otherArtists, setOtherArtists] = useState<Array<{name: string, image: string}>>([]);

  // Get artists from the section songs
  useEffect(() => {
    if (isOpen && songs.length > 0) {
      const artistMap = new Map();
      allSongs.forEach(song => {
        if (!artistMap.has(song.artist)) {
          artistMap.set(song.artist, {
            name: song.artist,
            image: song.imageUrl
          });
        }
      });
      setOtherArtists(Array.from(artistMap.values()));
    }
  }, [songs, isOpen]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle swipe gestures to close
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
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Swipe left or right with sufficient distance (100px threshold)
        if (Math.abs(diffX) > 100) {
          onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in" style={{ pointerEvents: 'auto' }}>
      <div className="container mx-auto px-4 py-6" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close full view"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Songs List - Artist page style */}
        <div className="max-w-6xl mx-auto">
          {/* Table header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border text-muted-foreground text-sm mb-2">
            <div className="w-8 text-right">#</div>
            <div>Title</div>
            <div className="flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <div className="w-16">Actions</div>
          </div>
          
          <div className="space-y-2">
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrentSong && isPlaying;

              return (
                <div
                  key={`${song.title}-${index}`}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors group animate-scale-in",
                    isCurrentSong 
                      ? "bg-accent/20 text-accent" 
                      : "hover:bg-accent/5 text-foreground"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleSongPlay(song)}
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-center gap-3 flex-1">
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {isCurrentPlaying ? (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-3 bg-accent animate-pulse" />
                          <div className="w-1 h-2 bg-accent animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1 h-4 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <Play className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0" />
                        </div>
                      )}
                    </div>

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/10 flex-shrink-0">
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className={cn(
                        "font-medium text-base leading-tight mb-1",
                        isCurrentSong ? "text-accent" : "text-foreground",
                        song.title.length > 20 ? "animate-marquee whitespace-nowrap" : "truncate"
                      )}>
                        {song.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleLike(song, e)}
                        className={cn(
                          "p-2 rounded-full hover:bg-accent/20 transition-colors",
                          isLiked(song.id) ? "text-red-500" : "text-muted-foreground"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isLiked(song.id) && "fill-current")} />
                      </button>
                      
                      <button
                        onClick={(e) => handleAddToQueue(song, e)}
                        className="p-2 rounded-full hover:bg-accent/20 transition-colors text-muted-foreground"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center w-full">
                    <div className="w-8 text-right text-muted-foreground text-sm">
                      {isCurrentPlaying ? (
                        <div className="flex items-center gap-1 justify-center">
                          <div className="w-1 h-3 bg-accent animate-pulse" />
                          <div className="w-1 h-2 bg-accent animate-pulse" style={{ animationDelay: '0.1s' }} />
                          <div className="w-1 h-4 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="h-4 w-4 text-accent hidden group-hover:block mx-auto" />
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <h4 className={cn(
                          "font-medium",
                          isCurrentSong ? "text-accent" : "text-foreground"
                        )}>
                          {song.title}
                        </h4>
                        <p className="text-muted-foreground text-sm">{song.artist}</p>
                      </div>
                    </div>
                    
                    <div className="text-muted-foreground text-sm text-center">
                      {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                    </div>
                    
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        onClick={(e) => handleLike(song, e)}
                        className={cn(
                          "p-1 rounded-full hover:bg-accent/20 transition-colors",
                          isLiked(song.id) ? "text-red-500" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isLiked(song.id) && "fill-current")} />
                      </button>
                      
                      <button
                        onClick={(e) => handleAddToQueue(song, e)}
                        className="p-1 rounded-full hover:bg-accent/20 transition-colors text-muted-foreground opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Helper text */}
          {songs.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6 mb-4">
              Select a song to play
            </p>
          )}
        </div>

        {/* Artists Section */}
        {otherArtists.length > 0 && (
          <div className="px-4 py-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Artists</h3>
            <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 scrollbar-hide">
              {otherArtists.map((artist) => (
                <div
                  key={artist.name}
                  className="group cursor-pointer flex-shrink-0 w-24 md:w-32"
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
                    <h4 className="font-medium text-foreground text-xs md:text-sm truncate group-hover:text-accent transition-colors">
                      {artist.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {songs.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No songs available in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionFullView;