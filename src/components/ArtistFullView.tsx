import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Heart, Plus } from 'lucide-react';
import { Song } from '@/data/songs';
import { usePlayer } from '@/context/PlayerContext';
import { allSongs } from '@/data/allSongs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
        <div className="flex items-center justify-between p-3 md:p-4">
          <button
            onClick={(e) => handleClose(e)}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-accent group-hover:translate-x-[-2px] transition-transform" />
          </button>
          
          <div className="text-center flex-1 mx-2 md:mx-4">
            <h1 className={cn(
              "text-lg md:text-xl font-bold text-foreground",
              artistName.length > 20 ? "animate-marquee whitespace-nowrap" : "truncate"
            )}>{artistName}</h1>
            <p className="text-xs md:text-sm text-muted-foreground">{artistSongs.length} songs</p>
          </div>
          
          <div className="w-8 h-8 md:w-10 md:h-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Artist info section */}
      {artistSongs.length > 0 && (
        <div className="relative h-48 md:h-64 bg-gradient-to-b from-primary/20 to-background">
          <img 
            src={artistSongs[0].imageUrl} 
            alt={artistName}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="relative h-full flex flex-col justify-end p-4 md:p-6">
            <div className="mb-3 md:mb-4">
              <h2 className={cn(
                "text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2",
                artistName.length > 20 ? "animate-marquee whitespace-nowrap" : "truncate"
              )}>{artistName}</h2>
              <p className="text-white/80 text-sm md:text-base">{artistSongs.length} songs available</p>
            </div>
            <button
              onClick={() => handleSongPlay(artistSongs[0])}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-4 md:px-6 py-2 md:py-3 rounded-full font-medium hover:bg-accent/90 transition-colors w-fit text-sm md:text-base"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              Play All
            </button>
          </div>
        </div>
      )}

      {/* Content area with scroll */}
      <div className="flex-1 overflow-auto pb-20">
        {/* Songs list */}
        <div className="px-3 md:px-6 py-4 md:py-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Songs</h3>
          <div className="space-y-1 md:space-y-2">
            {artistSongs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              const isCurrentPlaying = isCurrentSong && isPlaying;

              return (
                <div
                  key={song.id}
                  className={cn(
                    "flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg cursor-pointer transition-colors group",
                    isCurrentSong 
                      ? "bg-accent/20 text-accent" 
                      : "hover:bg-accent/5 text-foreground"
                  )}
                  onClick={() => handleSongPlay(song)}
                >
                  {/* Song number / Play indicator */}
                  <div className="w-6 md:w-8 flex items-center justify-center">
                    {isCurrentPlaying ? (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-3 bg-accent animate-pulse" />
                        <div className="w-1 h-2 bg-accent animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-4 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="text-xs md:text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <Play className="w-3 md:w-4 h-3 md:h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0" />
                      </div>
                    )}
                  </div>

                  {/* Song artwork */}
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-md overflow-hidden bg-accent/10 flex-shrink-0">
                    <img 
                      src={song.imageUrl} 
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Song info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium text-sm md:text-base",
                      isCurrentSong ? "text-accent" : "text-foreground",
                      song.title.length > 25 ? "animate-marquee whitespace-nowrap" : "truncate"
                    )}>
                      {song.title}
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>

                  {/* Duration */}
                  <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                    {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleLike(song, e)}
                      className={cn(
                        "p-1.5 md:p-2 rounded-full hover:bg-accent/20 transition-colors",
                        isLiked(song.id) ? "text-red-500" : "text-muted-foreground"
                      )}
                    >
                      <Heart className={cn("w-3 md:w-4 h-3 md:h-4", isLiked(song.id) && "fill-current")} />
                    </button>
                    
                    <button
                      onClick={(e) => handleAddToQueue(song, e)}
                      className="p-1.5 md:p-2 rounded-full hover:bg-accent/20 transition-colors text-muted-foreground"
                    >
                      <Plus className="w-3 md:w-4 h-3 md:h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Artists Section */}
        {otherArtists.length > 0 && (
          <div className="px-3 md:px-6 py-4 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Other Artists</h3>
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
      </div>
    </div>
  );
};

export default ArtistFullView;