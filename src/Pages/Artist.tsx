import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Heart, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/context/PlayerContext';
import { allSongs } from '@/data/allSongs';
import { Song } from '@/data/songs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Artist = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const navigate = useNavigate();
  const { playSong, currentSong, isPlaying, addToQueue, toggleLikeSong, isLiked, playPlaylist } = usePlayer();
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (artistName) {
      const decodedArtistName = decodeURIComponent(artistName);
      const songs = allSongs.filter(song => 
        song.artist.toLowerCase().includes(decodedArtistName.toLowerCase())
      );
      setArtistSongs(songs);
    }
  }, [artistName]);

  if (!artistName) {
    navigate('/');
    return null;
  }

  const decodedArtistName = decodeURIComponent(artistName);

  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      playPlaylist(artistSongs);
      toast.success(`Playing all songs by ${decodedArtistName}`);
    }
  };

  const handleSongPlay = (song: Song) => {
    playSong(song);
    toast.success(`Playing "${song.title}" by ${song.artist}`);
  };

  const handleLike = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikeSong(song.id);
  };

  const handleAddToQueue = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
    toast.success(`Added "${song.title}" to queue`);
  };

  return (
    <div className="pb-32 md:pb-40 md:ml-16">
      {/* Header */}
      <div 
        className="relative flex flex-col md:flex-row items-end md:items-end p-4 md:p-8 pt-8 md:pt-12 text-white"
        style={{
          backgroundImage: artistSongs.length > 0 
            ? `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${artistSongs[0].imageUrl})`
            : 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '280px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        
        {artistSongs.length > 0 && (
          <div className="hidden md:block mr-6">
            <img 
              src={artistSongs[0].imageUrl} 
              alt={decodedArtistName}
              className="w-32 h-32 md:w-48 md:h-48 object-cover shadow-xl rounded-full"
            />
          </div>
        )}
        
        <div className="flex flex-col items-start justify-end h-full">
          <h5 className="text-xs uppercase font-medium mb-1 text-accent">Artist</h5>
          <h1 className="text-2xl md:text-5xl font-bold mb-1">{decodedArtistName}</h1>
          <p className="text-sm opacity-80 mb-3">
            {artistSongs.length} song{artistSongs.length !== 1 ? 's' : ''} available
          </p>
          
          {artistSongs.length > 0 && (
            <Button
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-medium hover:bg-accent/90 transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Play All
            </Button>
          )}
        </div>
      </div>
      
      {/* Songs list */}
      <div className="px-4 md:px-8 py-6">
        {artistSongs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-2 text-foreground">No songs found</h2>
            <p className="text-muted-foreground">No songs available for this artist.</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              Go Back
            </Button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Songs</h3>
            
            {/* Table header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border text-muted-foreground text-sm">
              <div className="w-8 text-right">#</div>
              <div>Title</div>
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <div className="w-16">Actions</div>
            </div>
            
            <div className="space-y-2 mt-2">
              {artistSongs.map((song, index) => {
                const isCurrentSong = currentSong?.id === song.id;
                const isCurrentPlaying = isCurrentSong && isPlaying;

                return (
                  <div
                    key={song.id}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors group",
                      isCurrentSong 
                        ? "bg-accent/20 text-accent" 
                        : "hover:bg-accent/5 text-foreground"
                    )}
                    onClick={() => handleSongPlay(song)}
                  >
                    {/* Mobile layout */}
                    <div className="md:hidden flex items-center gap-3 flex-1">
                      <div className="w-8 flex items-center justify-center">
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

                      <div className="w-12 h-12 rounded-md overflow-hidden bg-accent/10">
                        <img 
                          src={song.imageUrl} 
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium truncate",
                          isCurrentSong ? "text-accent" : "text-foreground"
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
          </>
        )}
      </div>
    </div>
  );
};

export default Artist;