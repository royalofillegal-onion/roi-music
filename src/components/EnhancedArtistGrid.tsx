import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Play, ArrowRight, Filter, Shuffle } from 'lucide-react';
import { allSongs, uniqueSongs } from '@/data/allSongs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/context/PlayerContext';

interface EnhancedArtistGridProps {
  title: string;
  className?: string;
  showFilter?: boolean;
  maxArtists?: number;
  onArtistSectionLink?: (artistName: string, relatedSection: string) => void;
}

const EnhancedArtistGrid = ({ 
  title, 
  className = "", 
  showFilter = true,
  maxArtists = 12,
  onArtistSectionLink 
}: EnhancedArtistGridProps) => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [shuffleKey, setShuffleKey] = useState(0);
  
  // Get unique artists with enhanced data
  const getEnhancedArtists = () => {
    const artistMap = new Map();
    
    allSongs.forEach(song => {
      if (!artistMap.has(song.artist)) {
        const artistSongs = allSongs.filter(s => s.artist === song.artist);
        const genres = [...new Set(artistSongs.map(s => s.sync))];
        const totalSongs = artistSongs.length;
        
        artistMap.set(song.artist, {
          name: song.artist,
          image: song.imageUrl,
          totalSongs,
          genres: genres.slice(0, 2), // Top 2 genres
          popularSong: artistSongs[0],
          language: song.language,
          recentlyPlayed: Math.random() > 0.7 // Mock recently played
        });
      }
    });
    
    return Array.from(artistMap.values());
  };

  const allArtists = useMemo(() => getEnhancedArtists(), [shuffleKey]);
  
  const filteredArtists = useMemo(() => {
    let filtered = allArtists;
    
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(artist => 
        artist.genres.some(genre => genre.toLowerCase().includes(selectedGenre.toLowerCase()))
      );
    }
    
    return filtered.slice(0, maxArtists);
  }, [allArtists, selectedGenre, maxArtists]);

  const handleArtistClick = (artistName: string) => {
    navigate(`/artist/${encodeURIComponent(artistName)}`);
  };

  const handlePlayArtist = (e: React.MouseEvent, artist: any) => {
    e.stopPropagation();
    if (artist.popularSong) {
      playSong(artist.popularSong);
      toast.success(`Playing ${artist.name}`);
    }
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
        navigator.clipboard.writeText(shareUrl);
        toast.success('Artist link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Artist link copied to clipboard!');
    }
  };

  const handleShuffle = () => {
    setShuffleKey(prev => prev + 1);
    toast.success('Artists shuffled!');
  };

  const getRelatedSection = (artist: any): string => {
    if (artist.genres.includes('romantic') || artist.genres.includes('love')) return 'Romantic';
    if (artist.genres.includes('mass') || artist.genres.includes('rap')) return 'Mass & Rap';
    if (artist.genres.includes('dance') || artist.genres.includes('party')) return 'Dance Hits';
    if (artist.language === 'hindi') return 'Bollywood';
    return 'Popular';
  };

  const genres = ['all', 'romantic', 'mass', 'dance', 'devotional', 'rap'];
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {filteredArtists.length} artists • Discover more music
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {showFilter && (
            <div className="flex items-center gap-1 p-1 bg-card/50 rounded-lg border border-border/30">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                  className={cn(
                    "h-8 px-3 text-xs capitalize",
                    selectedGenre === genre ? "bg-accent text-accent-foreground" : ""
                  )}
                >
                  {genre}
                </Button>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            className="h-8 px-3"
          >
            <Shuffle className="w-3 h-3 mr-1" />
            Shuffle
          </Button>
        </div>
      </div>
      
      {/* Artists grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredArtists.map((artist, index) => (
          <div
            key={`${artist.name}-${shuffleKey}`}
            className="group cursor-pointer animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => handleArtistClick(artist.name)}
          >
            <div className="relative overflow-hidden rounded-xl aspect-square bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 transition-all duration-500 group-hover:scale-105 border border-border/30 group-hover:border-accent/30">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              {/* Recently played indicator */}
              {artist.recentlyPlayed && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-accent/90 text-accent-foreground text-xs font-medium rounded-full">
                  Recent
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  size="sm"
                  onClick={(e) => handlePlayArtist(e, artist)}
                  className="h-10 w-10 rounded-full p-0 bg-accent hover:bg-accent/90"
                >
                  <Play className="w-4 h-4 fill-current" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleShareArtist(e, artist.name)}
                  className="h-10 w-10 rounded-full p-0 bg-background/90 hover:bg-background"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Related section link */}
              {onArtistSectionLink && (
                <div 
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArtistSectionLink(artist.name, getRelatedSection(artist));
                  }}
                >
                  <div className="flex items-center gap-1 px-2 py-1 bg-background/90 text-xs rounded-full cursor-pointer hover:bg-accent/90 hover:text-accent-foreground transition-colors">
                    <span>{getRelatedSection(artist)}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Artist info */}
            <div className="mt-3 space-y-1">
              <h3 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors truncate">
                {artist.name}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{artist.totalSongs} songs</span>
                <div className="flex items-center gap-1">
                  {artist.genres.slice(0, 2).map((genre, i) => (
                    <span 
                      key={genre} 
                      className="px-1.5 py-0.5 bg-accent/10 text-accent rounded capitalize"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No artists found for "{selectedGenre}" genre.</p>
          <Button 
            variant="outline" 
            onClick={() => setSelectedGenre('all')}
            className="mt-2"
          >
            Show All Artists
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedArtistGrid;