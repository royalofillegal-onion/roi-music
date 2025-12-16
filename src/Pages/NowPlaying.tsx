import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Share2, Heart, SkipBack, Play, Pause, SkipForward, Search, Plus, ListMusic, User, Disc, Music, Award, Calendar, Star, Instagram, Youtube, Twitter, Info, Mic2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePlayer } from '@/context/PlayerContext';
import { uniqueSongs } from '@/data/allSongs';
import { teluguArtists } from '@/data/teluguArtists';
import { getOwnerByArtistName, getOrGenerateSongDescription, OwnerDetails, SongDescription } from '@/data/ownerDetails';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NowPlaying = () => {
  const navigate = useNavigate();
  const { 
    currentSong, 
    isPlaying, 
    pauseSong, 
    resumeSong, 
    nextSong, 
    previousSong, 
    queue, 
    addToQueue,
    toggleLikeSong,
    isLiked,
    currentTime,
    duration
  } = usePlayer();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);

  const isLikedState = currentSong ? isLiked(currentSong.id) : false;

  // Find owner details for current song's artist
  const ownerInfo = useMemo((): OwnerDetails | undefined => {
    if (!currentSong) return undefined;
    return getOwnerByArtistName(currentSong.artist);
  }, [currentSong]);

  // Get song description
  const songDescription = useMemo((): SongDescription | undefined => {
    if (!currentSong) return undefined;
    return getOrGenerateSongDescription(currentSong.id, currentSong.title, currentSong.artist);
  }, [currentSong]);

  // Find artist info (fallback)
  const artistInfo = useMemo(() => {
    if (!currentSong) return null;
    return teluguArtists.find(
      artist => artist.name.toLowerCase() === currentSong.artist.toLowerCase()
    );
  }, [currentSong]);

  // Get owner's songs that match their linkedSongIds, prioritized in queue display
  const ownerSongs = useMemo(() => {
    if (!ownerInfo) return [];
    return uniqueSongs.filter(song => 
      ownerInfo.linkedSongIds.includes(song.id) || 
      song.artist.toLowerCase() === ownerInfo.name.toLowerCase()
    );
  }, [ownerInfo]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return uniqueSongs.filter(
      song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToQueue = (song: typeof uniqueSongs[0]) => {
    addToQueue(song);
    toast.success(`"${song.title}" added to queue`, {
      icon: <Plus className="h-4 w-4" />
    });
    setSearchQuery('');
  };

  const handleLike = () => {
    if (currentSong) {
      toggleLikeSong(currentSong.id);
      toast.success(isLikedState ? 'Removed from Liked Songs' : 'Added to Liked Songs');
    }
  };

  const handleShare = () => {
    if (currentSong) {
      const url = `${window.location.origin}/song-detail/${currentSong.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleSongDescription = (songId: string) => {
    setExpandedSongId(expandedSongId === songId ? null : songId);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Song Playing</h2>
          <p className="text-muted-foreground mb-6">Play a song to see it here</p>
          <Button onClick={() => navigate('/')} className="rounded-full px-8">
            Browse Songs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${currentSong.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px) brightness(0.4)',
          transform: 'scale(1.2)',
        }}
      />
      <div className="absolute inset-0 bg-background/60 z-0" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col pb-24 md:pb-32">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Now Playing</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Song Info Section */}
        <div className="flex-1 px-6 pt-4 overflow-y-auto">
          {/* Album Art & Info */}
          <div className="flex items-start gap-4 mb-6">
            <img
              src={currentSong.imageUrl}
              alt={currentSong.title}
              className="w-16 h-16 rounded-lg object-cover shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">{currentSong.title}</h2>
              <button 
                className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                onClick={() => navigate(`/artist/${encodeURIComponent(currentSong.artist)}`)}
              >
                {currentSong.artist}
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn("rounded-full", isLikedState && "text-red-500")}
              onClick={handleLike}
            >
              <Heart className={cn("h-5 w-5", isLikedState && "fill-current")} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <Button variant="ghost" size="icon" onClick={previousSong} className="h-12 w-12">
              <SkipBack className="h-6 w-6" />
            </Button>
            <Button 
              size="icon" 
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-xl"
              onClick={() => isPlaying ? pauseSong() : resumeSong()}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 fill-current" />
              ) : (
                <Play className="h-8 w-8 fill-current ml-1" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSong} className="h-12 w-12">
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Current Song Description */}
          {songDescription && (
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">About This Song</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{songDescription.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {songDescription.mood && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Mood:</span>
                    <Badge variant="secondary" className="text-xs">{songDescription.mood}</Badge>
                  </div>
                )}
                {songDescription.composer && (
                  <div className="flex items-center gap-1">
                    <Mic2 className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">Composer:</span>
                    <span className="text-foreground">{songDescription.composer}</span>
                  </div>
                )}
                {songDescription.lyricist && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Lyricist:</span>
                    <span className="text-foreground truncate">{songDescription.lyricist}</span>
                  </div>
                )}
                {songDescription.producer && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Producer:</span>
                    <span className="text-foreground truncate">{songDescription.producer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Owner/Artist Details Section */}
          {ownerInfo && (
            <div className="bg-gradient-to-br from-primary/20 to-card/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-primary/30">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={ownerInfo.image}
                  alt={ownerInfo.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground">{ownerInfo.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{ownerInfo.yearsActive}</span>
                    <span>•</span>
                    <Music className="h-3 w-3" />
                    <span>{ownerInfo.totalSongs} songs</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ownerInfo.genres.map((genre, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-background/50">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{ownerInfo.bio}</p>
              
              {/* Awards */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-foreground">Awards</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ownerInfo.awards.map((award, idx) => (
                    <Badge key={idx} className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      {award}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top Songs */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Top Songs</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ownerInfo.topSongs.map((song, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {song}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sponsors */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-foreground">Associated Labels</span>
                </div>
                <p className="text-xs text-muted-foreground">{ownerInfo.sponsors.join(' • ')}</p>
              </div>

              {/* Social Links */}
              {ownerInfo.socialLinks && (
                <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                  {ownerInfo.socialLinks.instagram && (
                    <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-xs">
                      <Instagram className="h-4 w-4 mr-1" />
                      Instagram
                    </Button>
                  )}
                  {ownerInfo.socialLinks.youtube && (
                    <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-xs">
                      <Youtube className="h-4 w-4 mr-1" />
                      YouTube
                    </Button>
                  )}
                  {ownerInfo.socialLinks.twitter && (
                    <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-xs">
                      <Twitter className="h-4 w-4 mr-1" />
                      Twitter
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Song Credits & Details (Fallback if no owner info) */}
          {!ownerInfo && (
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-border/30">
              <h3 className="text-sm font-semibold text-foreground mb-3">Song Credits</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Artist</p>
                    <p className="text-foreground">{currentSong.artist}</p>
                  </div>
                </div>
                {currentSong.album && (
                  <div className="flex items-center gap-2">
                    <Disc className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Album</p>
                      <p className="text-foreground">{currentSong.album}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Label</p>
                    <p className="text-foreground">ROI Music</p>
                  </div>
                </div>
                {currentSong.year && (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 text-primary text-xs font-bold">©</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="text-foreground">{currentSong.year}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Artist & Song Links */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => navigate(`/artist/${encodeURIComponent(currentSong.artist)}`)}
                >
                  <User className="h-3 w-3 mr-1" />
                  View Artist
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => navigate(`/song-detail/${currentSong.id}`)}
                >
                  <Music className="h-3 w-3 mr-1" />
                  Song Details
                </Button>
              </div>
            </div>
          )}

          {/* Up Next Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Up Next</h3>
                <p className="text-xs text-muted-foreground">{queue.length} songs in queue</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-4 w-4 mr-1" />
                Add Songs
              </Button>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search songs to add to queue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card/50 border-border/50 rounded-full"
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 overflow-hidden max-h-64 overflow-y-auto">
                    {searchResults.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleAddToQueue(song)}
                      >
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Owner's Songs - Prioritized at Top */}
            {ownerInfo && ownerSongs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-primary font-semibold mb-2 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  More from {ownerInfo.name}
                </p>
                <div className="space-y-2">
                  {ownerSongs.slice(0, 3).map((song) => {
                    const desc = getOrGenerateSongDescription(song.id, song.title, song.artist);
                    return (
                      <div key={song.id} className="bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 overflow-hidden">
                        <div
                          className="flex items-center gap-3 p-3 cursor-pointer"
                          onClick={() => handleAddToQueue(song)}
                        >
                          <img
                            src={song.imageUrl}
                            alt={song.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSongDescription(song.id);
                              }}
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Plus className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        {expandedSongId === song.id && (
                          <div className="px-3 pb-3 pt-1 border-t border-primary/20">
                            <p className="text-xs text-muted-foreground">{desc.description}</p>
                            {desc.mood && (
                              <Badge variant="outline" className="mt-2 text-xs">{desc.mood}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Queue List */}
            {queue.length > 0 ? (
              <div className="space-y-2">
                {queue.slice(0, 5).map((song, index) => {
                  const desc = getOrGenerateSongDescription(song.id, song.title, song.artist);
                  return (
                    <div
                      key={`${song.id}-${index}`}
                      className="bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3">
                        <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleSongDescription(`queue-${song.id}-${index}`)}
                        >
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      {expandedSongId === `queue-${song.id}-${index}` && (
                        <div className="px-3 pb-3 pt-1 border-t border-border/30">
                          <p className="text-xs text-muted-foreground">{desc.description}</p>
                          {desc.mood && (
                            <Badge variant="outline" className="mt-2 text-xs">{desc.mood}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {queue.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{queue.length - 5} more songs
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ListMusic className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No songs in queue</p>
                <p className="text-xs text-muted-foreground mt-1">Add songs to your queue to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
