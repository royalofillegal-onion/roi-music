
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music2, ExternalLink, Heart, Search, Filter, Share2, Play, Copy, Award, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { songs } from "@/data/songs";
import { usePlayer } from "@/context/PlayerContext";
import ShareSong from "@/components/ShareSong";
import TermsAndConditions from "@/components/auth/TermsAndConditions";
import { teluguArtists } from "@/data/teluguArtists";

const Artists = () => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [expandedArtist, setExpandedArtist] = useState<number | null>(null);

  // Get all unique genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    teluguArtists.forEach(artist => {
      artist.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres);
  }, []);

  // Filter and sort artists
  const filteredAndSortedArtists = useMemo(() => {
    let filtered = teluguArtists.filter(artist => {
      const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.bio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === "all" || artist.genres.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });

    // Sort artists
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "songs":
          return b.totalSongs - a.totalSongs;
        case "genres":
          return a.genres.length - b.genres.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedGenre, sortBy]);

  const handleViewSongs = (artistName: string) => {
    navigate(`/search?artist=${encodeURIComponent(artistName)}`);
  };

  const handlePlaySong = (song: any) => {
    playSong(song);
    toast.success(`Now playing: ${song.title} by ${song.artist}`);
  };

  const copyCurrentPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Artists page URL copied to clipboard!');
  };

  // Get associated songs for an artist (mock data for demonstration)
  const getAssociatedSongs = (artistName: string) => {
    return songs.filter(song => 
      song.artist.toLowerCase().includes(artistName.toLowerCase()) ||
      artistName.toLowerCase().includes(song.artist.toLowerCase())
    ).slice(0, 3);
  };

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4 mt-2">Top 100 Telugu Artists</h1>
            <p className="text-gray-400 text-base md:text-lg">
              Discover legendary Telugu artists and their musical journey. Authentic artist information and achievements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copyCurrentPageUrl}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Page
            </Button>
            <TermsAndConditions>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white">
                Terms & Conditions
              </Button>
            </TermsAndConditions>
          </div>
        </div>
        
        <div className="mt-4 p-3 md:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs md:text-sm text-gray-300">
            <strong>Authentic Artist Database:</strong> Real information about Telugu music legends, their achievements, 
            and contributions to Telugu cinema and music industry. All credits and recognition belong to the respective artists.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Telugu artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="songs">Song Count</SelectItem>
                <SelectItem value="genres">Genres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          Showing {filteredAndSortedArtists.length} of {teluguArtists.length} Telugu artists
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredAndSortedArtists.map((artist) => {
          const associatedSongs = getAssociatedSongs(artist.name);
          
          return (
            <Card key={artist.id} className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-36 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">{artist.name}</h3>
                    <p className="text-xs md:text-sm text-gray-200">{artist.totalSongs} songs available</p>
                  </div>
                </div>
                
                <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                  <p className="text-xs md:text-sm text-gray-300 line-clamp-2 md:line-clamp-3">{artist.bio}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-200">Genres</h4>
                    <div className="flex flex-wrap gap-1">
                      {artist.genres.map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Career Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">Active: {artist.yearsActive}</span>
                    </div>
                  </div>

                  {/* Awards Section */}
                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-200 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Awards & Recognition
                    </h4>
                    <div className="space-y-1">
                      {artist.awards.slice(0, 2).map((award, index) => (
                        <div key={award} className="flex items-center gap-2 text-xs text-gray-400">
                          <Award className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                          <span className="truncate">{award}</span>
                        </div>
                      ))}
                      {artist.awards.length > 2 && (
                        <div className="text-xs text-gray-500">+{artist.awards.length - 2} more awards</div>
                      )}
                    </div>
                  </div>

                  {/* Available Songs Section */}
                  {associatedSongs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs md:text-sm font-semibold text-gray-200">Available Songs</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedArtist(expandedArtist === artist.id ? null : artist.id)}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          {expandedArtist === artist.id ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                      
                      {expandedArtist === artist.id && (
                        <div className="space-y-2 bg-gray-800/30 p-2 rounded">
                          {associatedSongs.map((song) => (
                            <div key={song.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <img src={song.imageUrl} alt={song.title} className="w-8 h-8 rounded object-cover" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-white truncate">{song.title}</p>
                                  <p className="text-gray-400 truncate">{song.artist}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePlaySong(song)}
                                  className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                <ShareSong song={song} className="h-6 w-6 p-0 text-gray-400 hover:text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-200">Top Songs</h4>
                    <div className="space-y-1">
                      {artist.topSongs.slice(0, 2).map((song, index) => (
                        <div key={song} className="flex items-center gap-2 text-xs text-gray-400">
                          <Music2 className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{song}</span>
                        </div>
                      ))}
                      {artist.topSongs.length > 2 && (
                        <div className="text-xs text-gray-500">+{artist.topSongs.length - 2} more</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-200">Music Labels</h4>
                    <div className="space-y-1">
                      {artist.sponsors.slice(0, 2).map((sponsor) => (
                        <div key={sponsor} className="flex items-center gap-2 text-xs text-gray-400">
                          <Heart className="h-3 w-3 text-red-500 flex-shrink-0" />
                          <span className="truncate">{sponsor}</span>
                        </div>
                      ))}
                      {artist.sponsors.length > 2 && (
                        <div className="text-xs text-gray-500">+{artist.sponsors.length - 2} more</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleViewSongs(artist.name)}
                      className="flex-1 bg-music-accent hover:bg-music-accent/90 text-black text-xs md:text-sm"
                      size="sm"
                    >
                      <Music2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="hidden sm:inline">View Songs</span>
                      <span className="sm:hidden">Songs</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 hover:bg-gray-800 px-2 md:px-3"
                      onClick={() => {
                        toast.success(`${artist.name} profile information copied!`);
                      }}
                    >
                      <Copy className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                    All content credits belong to {artist.name} • Telugu Music Legend
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredAndSortedArtists.length === 0 && (
        <div className="text-center py-12">
          <Music2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Telugu artists found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Support Section */}
      <div className="mt-8 md:mt-12 p-4 md:p-6 bg-gray-800/30 rounded-lg border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-2">Celebrating Telugu Music Heritage</h3>
            <p className="text-gray-300 text-sm mb-4">
              This platform celebrates the rich heritage of Telugu music and cinema. We honor the legendary artists, 
              musicians, lyricists, composers, and singers who have shaped Telugu entertainment industry. All information 
              is sourced from public records and represents authentic achievements and contributions of these remarkable artists.
            </p>
          </div>
          <TermsAndConditions>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white ml-4">
              View Terms
            </Button>
          </TermsAndConditions>
        </div>
        <p className="text-gray-400 text-xs">
          Platform for entertainment and artist recognition. All credits, achievements, and content rights belong to the respective artists and their estates.
        </p>
      </div>
    </div>
  );
};

export default Artists;
