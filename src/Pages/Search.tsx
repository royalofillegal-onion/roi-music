
import React, { useState, useEffect } from "react";
import { Search as SearchIcon, Mic, MicOff, Play, Heart, Plus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SongRow from "@/components/SongRow";
import SongCard from "@/components/SongCard";
import { uniqueSongs, songsByArtist, songsBySync } from "@/data/allSongs";
import { additionalSongs } from "@/data/additionalSongs";
import { moreSongs } from "@/data/moreSongs";
import { trendingSongs } from "@/data/trendingSongs";
import { playlists } from "@/data/playlists";
import PlaylistCard from "@/components/PlaylistCard";

import { usePlayer } from "@/context/PlayerContext";
import AddToPlaylist from "@/components/AddToPlaylist";
import { cn } from "@/lib/utils";
import { enhanceAllSongs } from "@/utils/songEnhancer";

// Enhanced sync filter options
const SYNC_FILTERS = [
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'love', label: 'Love', emoji: '❤️' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'devotional', label: 'Devotional', emoji: '🙏' },
  { id: 'action', label: 'Action', emoji: '⚡' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'classical', label: 'Classical', emoji: '🎼' },
  { id: 'folk', label: 'Folk', emoji: '🎵' },
  { id: 'mass', label: 'Mass', emoji: '🔥' },
  { id: 'rap', label: 'Rap', emoji: '🎤' },
  { id: 'break', label: 'Break', emoji: '💔' },
] as const;

const Search = () => {
  const { playSong, toggleLikeSong, isLiked, currentSong, isPlaying } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState(uniqueSongs);
  const [filteredPlaylists, setFilteredPlaylists] = useState(playlists);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [selectedSync, setSelectedSync] = useState<string | null>(null);
  const [artistFilter, setArtistFilter] = useState<string | null>(null);
  const [availableArtists, setAvailableArtists] = useState<string[]>([]);
  const [isActivelySearching, setIsActivelySearching] = useState(false);

  // Daily shuffle function using date as seed
  const getDailyShuffledSongs = (songs: any[]) => {
    const today = new Date().toDateString(); // Gets date like "Mon Dec 25 2023"
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Seeded random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const shuffled = [...songs];
    let currentSeed = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280; // Linear congruential generator
      const j = Math.floor(seededRandom(currentSeed) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };

  // Combine all songs for display when not searching - shuffled daily
  const allDisplaySongs = getDailyShuffledSongs([
    ...additionalSongs,
    ...moreSongs, 
    ...trendingSongs,
    ...uniqueSongs
  ].filter((song, index, self) => 
    index === self.findIndex(s => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase())
  ));

  useEffect(() => {
    // Get all available artists
    const artists = Object.keys(songsByArtist).map(artist => 
      artist.charAt(0).toUpperCase() + artist.slice(1)
    ).sort();
    setAvailableArtists(artists);
  }, []);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setSelectedSync(null);
        setArtistFilter(null);
      };

      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);
  
  useEffect(() => {
    // Track if user is actively searching
    const isSearching = searchQuery.trim().length >= 3;
    setIsActivelySearching(isSearching);
    
    if (searchQuery.trim() === "" || searchQuery.trim().length < 3) {
      // If an artist filter is selected
      if (artistFilter) {
        const artistSongs = songsByArtist[artistFilter.toLowerCase()] || [];
        setFilteredSongs(artistSongs);
      }
      // If a sync filter is selected
      else if (selectedSync) {
        const syncSongs = songsBySync[selectedSync] || [];
        setFilteredSongs(syncSongs);
      } else {
        setFilteredSongs([]);
      }
      setFilteredPlaylists([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Enhanced search - includes all fields and better matching
    const matchingSongs = uniqueSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query)) ||
        (song.genre && song.genre.toLowerCase().includes(query)) ||
        (song.language && song.language.toLowerCase().includes(query)) ||
        (song.sync && song.sync.toLowerCase().includes(query)) ||
        // Partial word matching
        song.title.toLowerCase().split(' ').some(word => word.startsWith(query)) ||
        song.artist.toLowerCase().split(' ').some(word => word.startsWith(query))
    );
    setFilteredSongs(matchingSongs);
    
    // Filter playlists
    const matchingPlaylists = playlists.filter(
      (playlist) =>
        playlist.title.toLowerCase().includes(query) ||
        playlist.description.toLowerCase().includes(query)
    );
    setFilteredPlaylists(matchingPlaylists);
  }, [searchQuery, selectedSync, artistFilter]);

  const startVoiceSearch = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };
  
  const handlePlaySong = (song: any) => {
    // Play song directly without smart playback
    playSong(song);
  };

  const handleLikeSong = async (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikeSong(song.id);
  };

  const handleSyncFilter = (syncId: string) => {
    if (selectedSync === syncId) {
      setSelectedSync(null);
    } else {
      setSelectedSync(syncId);
      setArtistFilter(null);
    }
  };

  const handleArtistFilter = (artist: string) => {
    if (artistFilter === artist) {
      setArtistFilter(null);
    } else {
      setArtistFilter(artist);
      setSelectedSync(null);
    }
  };
  
  return (
    <div className="pt-4 pb-32 md:pb-40 px-3 sm:px-4 md:px-8 md:ml-16 min-h-screen">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 mt-1">Search</h1>
      
      <div className="relative mb-6 sm:mb-8 max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="search"
          placeholder="Search for songs, artists or playlists..."
          className="pl-10 pr-14 bg-gray-800 border-gray-700 focus:border-music-accent h-10 sm:h-12 rounded-full w-full text-sm sm:text-base"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedSync(null);
            setArtistFilter(null);
          }}
        />
        <Button
          onClick={isListening ? stopVoiceSearch : startVoiceSearch}
          variant="ghost"
          size="sm"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full ${
            isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-400 hover:text-music-accent'
          }`}
        >
          {isListening ? <MicOff size={14} className="sm:w-4 sm:h-4" /> : <Mic size={14} className="sm:w-4 sm:h-4" />}
        </Button>
      </div>
      
      {/* Search Results Section */}
      {searchQuery.trim() !== "" && searchQuery.trim().length >= 3 && (
        <>
          {filteredSongs.length === 0 && filteredPlaylists.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-400 px-4">
              <p className="text-base sm:text-lg">No results found for "{searchQuery}"</p>
              <p className="text-xs sm:text-sm mt-2">Try searching with different keywords</p>
            </div>
          ) : (
            <>
              {filteredPlaylists.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-3 text-white">Playlists</h2>
                  <div className="space-y-2">
                    {filteredPlaylists.map((playlist) => (
                      <div key={playlist.id} className="flex items-center p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <div className="w-12 h-12 rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={playlist.coverImage} 
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="relative overflow-hidden">
                            <h3 className="text-white font-medium text-sm whitespace-nowrap animate-marquee">
                              {playlist.title}
                            </h3>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">{playlist.songs.length} songs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {filteredSongs.length > 0 && (
                <div className="w-full">
                  <h2 className="text-lg font-bold mb-3 text-white">Songs</h2>
                  <div className="space-y-2">
                     {filteredSongs.map((song, index) => {
                       const isCurrentSong = currentSong?.id === song.id;
                       const isCurrentPlaying = isCurrentSong && isPlaying;
                       
                       return (
                       <div key={`${song.id}-${index}`} className="flex items-center p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors group">
                          <div className="w-8 text-gray-400 text-sm font-medium mr-3 text-center flex-shrink-0">
                            {isCurrentPlaying ? (
                              <div className="flex items-center gap-0.5 justify-center">
                                <div className="w-1 h-3 bg-orange-500 animate-pulse" />
                                <div className="w-1 h-2 bg-orange-500 animate-pulse" style={{ animationDelay: '0.1s' }} />
                                <div className="w-1 h-4 bg-orange-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                              </div>
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </div>
                         
                         <div className="relative w-12 h-12 rounded-md overflow-hidden mr-3 flex-shrink-0 cursor-pointer group/play" onClick={() => handlePlaySong(song)}>
                           <img 
                             src={song.imageUrl || '/lovable-uploads/a3cdc6ab-590f-4e71-b4c5-bdeec7e8189c.png'} 
                             alt={song.title}
                             className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-opacity">
                             <Play className="h-4 w-4 text-white" />
                           </div>
                         </div>
                         
                         <div className="flex-1 min-w-0 mr-3 cursor-pointer" onClick={() => handlePlaySong(song)}>
                           <div className="relative overflow-hidden">
                             <h3 className="text-white font-medium text-sm whitespace-nowrap animate-marquee">
                               {song.title}
                             </h3>
                           </div>
                           <div className="relative overflow-hidden mt-1">
                             <p className="text-gray-400 text-xs whitespace-nowrap animate-marquee">
                               {song.artist}
                             </p>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-2 mr-3">
                           <Button
                             variant="ghost"
                             size="sm"
                             className={cn(
                               "p-1 h-6 w-6 rounded-full hover:bg-gray-700/50 transition-all",
                               isLiked(song.id) ? "text-red-500" : "text-gray-400 opacity-0 group-hover:opacity-100"
                             )}
                             onClick={(e) => handleLikeSong(song, e)}
                           >
                             <Heart className={cn("h-3 w-3", isLiked(song.id) && "fill-current")} />
                           </Button>
                           
                           <AddToPlaylist 
                             song={song}
                             trigger={
                               <Button 
                                 variant="ghost" 
                                 size="sm"
                                 className="p-1 h-6 w-6 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-all"
                               >
                                 <Plus className="h-3 w-3" />
                               </Button>
                             }
                           />
                         </div>
                         
                         <div className="text-gray-400 text-xs flex-shrink-0">
                           {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        );
                     })}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* All Songs Section - Enhanced Display */}
      <div className="mt-8">
        {searchQuery.trim() === "" && (
          <div className="text-center py-8 text-gray-400 mb-8">
            <SearchIcon className="mx-auto mb-3" size={40} />
            <p className="text-base sm:text-lg">Search for songs, artists or playlists</p>
            <p className="text-xs sm:text-sm mt-2">Use the microphone to search with your voice</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">All Songs</h2>
          <div className="text-sm text-gray-400">
            {allDisplaySongs.length} songs available
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {allDisplaySongs.map((song, index) => (
            <SongCard 
              key={`${song.id}-${index}`} 
              song={song} 
              className="w-full"
              variant="search"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
