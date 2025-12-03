import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Heart, Clock, Calendar, Disc, Music, User, Share2, ListMusic, MoreHorizontal, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uniqueSongs } from '@/data/allSongs';
import { teluguArtists } from '@/data/teluguArtists';
import { usePlayer } from '@/context/PlayerContext';
import SongCard from '@/components/SongCard';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const SongDetail = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { playSong, pauseSong, toggleLikeSong, isLiked, currentSong, isPlaying, addToQueue, playPlaylist } = usePlayer();
  const [isHoveringPlay, setIsHoveringPlay] = useState(false);

  // Find the song by ID
  const song = useMemo(() => {
    return uniqueSongs.find(s => s.id === songId);
  }, [songId]);

  // Find artist info from teluguArtists by matching name
  const artistInfo = useMemo(() => {
    if (!song) return null;
    return teluguArtists.find(
      artist => artist.name.toLowerCase() === song.artist.toLowerCase()
    );
  }, [song]);

  // Get more songs from the same artist
  const artistSongs = useMemo(() => {
    if (!song) return [];
    return uniqueSongs.filter(
      s => s.artist.toLowerCase() === song.artist.toLowerCase() && s.id !== song.id
    ).slice(0, 12);
  }, [song]);

  // Sample data for enhanced details
  const songDetails = useMemo(() => {
    if (!song) return null;
    return {
      playCount: Math.floor(Math.random() * 10000000) + 1000000,
      monthlyListeners: Math.floor(Math.random() * 5000000) + 500000,
      releaseDate: song.year ? `${song.year}` : '2024',
      label: 'ROI Music Entertainment',
      producer: artistInfo?.name || song.artist,
      composer: artistInfo?.name || song.artist,
      lyricist: artistInfo?.name || song.artist,
      quality: '320kbps',
      format: 'MP3'
    };
  }, [song, artistInfo]);

  const isLikedState = song ? isLiked(song.id) : false;
  const isCurrentSong = currentSong?.id === song?.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlay = () => {
    if (song) {
      if (isCurrentlyPlaying) {
        pauseSong();
      } else {
        playSong(song);
      }
    }
  };

  const handlePlayAll = () => {
    if (song) {
      const allSongs = [song, ...artistSongs];
      playPlaylist(allSongs);
      toast.success('Playing all songs');
    }
  };

  const handleShuffle = () => {
    if (song) {
      const allSongs = [song, ...artistSongs];
      const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
      playPlaylist(shuffled);
      toast.success('Shuffling songs');
    }
  };

  const handleAddToQueue = () => {
    if (song) {
      addToQueue(song);
      toast.success(`"${song.title}" added to queue`, {
        icon: <ListMusic className="h-4 w-4" />
      });
    }
  };

  const handleLike = async () => {
    if (song) {
      await toggleLikeSong(song.id);
      toast.success(isLikedState ? 'Removed from Liked Songs' : 'Added to Liked Songs');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Song Not Found</h2>
          <p className="text-muted-foreground mb-6">The song you're looking for doesn't exist</p>
          <Button onClick={() => navigate('/')} className="rounded-full px-8">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-32">
      {/* Hero Section with Gradient */}
      <div className="relative">
        {/* Dynamic gradient background based on song image */}
        <div 
          className="absolute inset-0 h-[450px] md:h-[500px]"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent, hsl(var(--background))), linear-gradient(to bottom right, hsl(var(--primary) / 0.3), hsl(var(--background)))`,
          }}
        />
        <div 
          className="absolute inset-0 h-[450px] md:h-[500px] opacity-30"
          style={{
            backgroundImage: `url(${song.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px)',
          }}
        />

        {/* Header */}
        <div className="sticky top-0 z-20 bg-transparent">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-card border-border">
                <DropdownMenuItem onClick={handleAddToQueue} className="gap-2">
                  <ListMusic className="h-4 w-4" />
                  Add to Queue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate(`/artist/${encodeURIComponent(song.artist)}`)}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  View Artist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Song Info */}
        <div className="relative px-4 pt-4 pb-8">
          <div className="flex flex-col items-center md:flex-row md:items-end gap-6 max-w-4xl mx-auto">
            {/* Album Art */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsHoveringPlay(true)}
              onMouseLeave={() => setIsHoveringPlay(false)}
            >
              <div className={cn(
                "w-56 h-56 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-2xl transform transition-all duration-300",
                isHoveringPlay && "scale-[1.02]"
              )}>
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Play overlay */}
              <div 
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg transition-opacity cursor-pointer",
                  isHoveringPlay ? "opacity-100" : "opacity-0"
                )}
                onClick={handlePlay}
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform">
                  {isCurrentlyPlaying ? (
                    <Pause className="h-8 w-8 text-primary-foreground fill-current" />
                  ) : (
                    <Play className="h-8 w-8 text-primary-foreground fill-current ml-1" />
                  )}
                </div>
              </div>

              {/* Now playing indicator */}
              {isCurrentSong && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-primary rounded-full">
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "w-1 bg-primary-foreground rounded-full",
                          isPlaying ? "animate-pulse" : "h-2"
                        )}
                        style={{
                          height: isPlaying ? `${Math.random() * 8 + 4}px` : '8px',
                          animationDelay: `${i * 0.15}s`
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-primary-foreground ml-1">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </span>
                </div>
              )}
            </div>

            {/* Song Details */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Song</span>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-2 mb-3 line-clamp-2">{song.title}</h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
                <button 
                  className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                  onClick={() => navigate(`/artist/${encodeURIComponent(song.artist)}`)}
                >
                  {song.artist}
                </button>
                {song.album && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{song.album}</span>
                  </>
                )}
                {song.year && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{song.year}</span>
                  </>
                )}
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{formatDuration(song.duration)}</span>
              </div>

              {/* Stats */}
              {songDetails && (
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{formatNumber(songDetails.playCount)} plays</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8 shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all"
                  onClick={handlePlay}
                >
                  {isCurrentlyPlaying ? (
                    <>
                      <Pause className="h-5 w-5 fill-current" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 fill-current" />
                      Play
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-12 w-12 transition-all hover:scale-105",
                    isLikedState && "text-red-500 border-red-500/50 bg-red-500/10"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn("h-5 w-5", isLikedState && "fill-current")} />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 hover:scale-105 transition-all"
                  onClick={handleShuffle}
                >
                  <Shuffle className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 hover:scale-105 transition-all"
                  onClick={handleAddToQueue}
                >
                  <ListMusic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Info Section */}
      {artistInfo && (
        <div className="px-4 py-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-4">About the Artist</h2>
          <div 
            className="bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-5 border border-border/50 cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group"
            onClick={() => navigate(`/artist/${encodeURIComponent(artistInfo.name)}`)}
          >
            <div className="flex gap-5 items-start">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                  <img
                    src={artistInfo.image}
                    alt={artistInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">{artistInfo.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Artist</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{artistInfo.bio}</p>
                
                <div className="flex flex-wrap gap-1.5">
                  {artistInfo.genres?.slice(0, 3).map((genre, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-accent/50 text-accent-foreground rounded-full text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex gap-6 mt-3 text-sm">
                  <div>
                    <span className="text-foreground font-semibold">{artistInfo.totalSongs}+</span>
                    <span className="text-muted-foreground ml-1">Songs</span>
                  </div>
                  <div>
                    <span className="text-foreground font-semibold">{artistInfo.yearsActive}</span>
                    <span className="text-muted-foreground ml-1">Years Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Song Details Card */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-4">Song Info</h2>
        <div className="bg-card/50 rounded-2xl p-5 border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {song.album && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Disc className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Album</p>
                  <p className="text-sm font-medium text-foreground">{song.album}</p>
                </div>
              </div>
            )}
            
            {song.year && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Released</p>
                  <p className="text-sm font-medium text-foreground">{song.year}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium text-foreground">{formatDuration(song.duration)}</p>
              </div>
            </div>

            {song.genre && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Genre</p>
                  <p className="text-sm font-medium text-foreground">{song.genre}</p>
                </div>
              </div>
            )}

            {song.language && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">A</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="text-sm font-medium text-foreground capitalize">{song.language}</p>
                </div>
              </div>
            )}

            {songDetails && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">HD</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quality</p>
                  <p className="text-sm font-medium text-foreground">{songDetails.quality}</p>
                </div>
              </div>
            )}
          </div>

          {/* Credits */}
          {songDetails && (
            <div className="mt-5 pt-5 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3">Credits</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Producer</p>
                  <p className="text-foreground">{songDetails.producer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Composer</p>
                  <p className="text-foreground">{songDetails.composer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Label</p>
                  <p className="text-foreground">{songDetails.label}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* More Songs from Artist Section */}
      {artistSongs.length > 0 && (
        <div className="px-4 py-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              More from {song.artist}
            </h2>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary/80"
              onClick={() => navigate(`/artist/${encodeURIComponent(song.artist)}`)}
            >
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {artistSongs.map((artistSong) => (
              <SongCard 
                key={artistSong.id} 
                song={artistSong}
                variant="default"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongDetail;
