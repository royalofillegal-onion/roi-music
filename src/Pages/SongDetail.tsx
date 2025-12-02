import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Heart, Clock, Calendar, Disc, Music, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uniqueSongs } from '@/data/allSongs';
import { teluguArtists } from '@/data/teluguArtists';
import { usePlayer } from '@/context/PlayerContext';
import SongCard from '@/components/SongCard';
import { cn } from '@/lib/utils';

const SongDetail = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { playSong, toggleLikeSong, isLiked } = usePlayer();

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

  const isLikedState = song ? isLiked(song.id) : false;

  const handlePlay = () => {
    if (song) {
      playSong(song);
    }
  };

  const handleLike = async () => {
    if (song) {
      await toggleLikeSong(song.id);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Song Not Found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-32">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate">{song.title}</h1>
        </div>
      </div>

      {/* Song Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 h-80 bg-gradient-to-b from-primary/20 to-background"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), hsl(var(--background))), url(${song.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
            opacity: 0.5
          }}
        />

        <div className="relative px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
            {/* Song Image */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
              <img
                src={song.imageUrl}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Song Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Song</p>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{song.title}</h1>
              <p 
                className="text-xl text-primary cursor-pointer hover:underline"
                onClick={() => navigate(`/artist/${encodeURIComponent(song.artist)}`)}
              >
                {song.artist}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                {song.album && (
                  <span className="flex items-center gap-1">
                    <Disc className="h-4 w-4" />
                    {song.album}
                  </span>
                )}
                {song.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {song.year}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(song.duration)}
                </span>
                {song.genre && (
                  <span className="flex items-center gap-1">
                    <Music className="h-4 w-4" />
                    {song.genre}
                  </span>
                )}
              </div>

              {/* Play and Like buttons */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8"
                  onClick={handlePlay}
                >
                  <Play className="h-5 w-5 fill-current" />
                  Play
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-12 w-12",
                    isLikedState && "text-red-500 border-red-500"
                  )}
                  onClick={handleLike}
                >
                  <Heart className={cn("h-5 w-5", isLikedState && "fill-current")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Info Section */}
      {artistInfo && (
        <div className="px-4 py-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">About the Artist</h2>
          <div 
            className="bg-card/50 rounded-xl p-6 border border-border/50 cursor-pointer hover:bg-card/70 transition-colors"
            onClick={() => navigate(`/artist/${encodeURIComponent(artistInfo.name)}`)}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Artist Image */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                <img
                  src={artistInfo.image}
                  alt={artistInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Artist Details */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-foreground mb-2">{artistInfo.name}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">{artistInfo.bio}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {artistInfo.genres?.map((genre, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Songs</p>
                    <p className="text-foreground font-semibold">{artistInfo.totalSongs}+</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Years Active</p>
                    <p className="text-foreground font-semibold">{artistInfo.yearsActive}</p>
                  </div>
                  {artistInfo.awards && artistInfo.awards.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Awards</p>
                      <p className="text-foreground font-semibold truncate">{artistInfo.awards.slice(0, 2).join(', ')}</p>
                    </div>
                  )}
                </div>

                {artistInfo.topSongs && artistInfo.topSongs.length > 0 && (
                  <div className="mt-4">
                    <p className="text-muted-foreground text-sm mb-2">Top Songs</p>
                    <div className="flex flex-wrap gap-2">
                      {artistInfo.topSongs.slice(0, 4).map((topSong, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-xs"
                        >
                          {topSong}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* More Songs from Artist Section */}
      {artistSongs.length > 0 && (
        <div className="px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              More from {song.artist}
            </h2>
            <Button 
              variant="ghost" 
              className="text-primary"
              onClick={() => navigate(`/artist/${encodeURIComponent(song.artist)}`)}
            >
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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

      {/* Song Details Card */}
      <div className="px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Song Details</h2>
        <div className="bg-card/50 rounded-xl p-6 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Title</p>
                <p className="text-foreground font-medium">{song.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Artist</p>
                <p className="text-foreground font-medium">{song.artist}</p>
              </div>
              {song.album && (
                <div>
                  <p className="text-muted-foreground text-sm">Album</p>
                  <p className="text-foreground font-medium">{song.album}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {song.year && (
                <div>
                  <p className="text-muted-foreground text-sm">Release Year</p>
                  <p className="text-foreground font-medium">{song.year}</p>
                </div>
              )}
              {song.genre && (
                <div>
                  <p className="text-muted-foreground text-sm">Genre</p>
                  <p className="text-foreground font-medium">{song.genre}</p>
                </div>
              )}
              {song.language && (
                <div>
                  <p className="text-muted-foreground text-sm">Language</p>
                  <p className="text-foreground font-medium capitalize">{song.language}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm">Duration</p>
                <p className="text-foreground font-medium">{formatDuration(song.duration)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
