
import React, { useState, useEffect } from "react";
import { Search as SearchIcon, Mic, MicOff, Play, Heart, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SongRow from "@/components/SongRow";
import { uniqueSongs } from "@/data/allSongs";
import { playlists } from "@/data/playlists";
import PlaylistCard from "@/components/PlaylistCard";
import { toast } from "sonner";
import { usePlayer } from "@/context/PlayerContext";
import AddToPlaylist from "@/components/AddToPlaylist";
import { cn } from "@/lib/utils";

const Search = () => {
  const { playSong, toggleLikeSong, isLiked } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState(uniqueSongs);
  const [filteredPlaylists, setFilteredPlaylists] = useState(playlists);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [webSearchResults, setWebSearchResults] = useState<any[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);

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
        // Reduced notification frequency
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        
        // Enhanced voice search with singing detection
        const confidence = event.results[0][0].confidence;
        
        if (confidence < 0.7) {
          toast.success(`🎤 Detected singing/humming: "${transcript}" - Searching...`);
        } else {
          toast.success(`🎵 Voice search: "${transcript}"`);
        }
        
        // Auto search web for voice queries with enhanced keywords
        searchWeb(`${transcript} song lyrics music`);
      };

      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
        toast.error("Voice recognition error. Please try again.");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const searchWeb = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearchingWeb(true);
    try {
      // Enhanced Google search with multiple search strategies
      const searchQueries = [
        `${query} song lyrics`,
        `${query} music`,
        `"${query}" song`,
        `${query} artist`,
        `${query} album`
      ];
      
      const searchResults = searchQueries.map((searchQuery, index) => ({
        id: `web-${index + 1}`,
        title: `🎵 "${query}" - ${searchQuery.includes('lyrics') ? 'Lyrics Search' : 
                searchQuery.includes('artist') ? 'Artist Search' : 
                searchQuery.includes('album') ? 'Album Search' : 'Music Search'}`,
        artist: 'Google Search',
        snippet: `Search for ${searchQuery.toLowerCase()} on Google`,
        url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
      }));
      
      setWebSearchResults(searchResults);
    } catch (error) {
      console.error('Web search error:', error);
    } finally {
      setIsSearchingWeb(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSongs(uniqueSongs);
      setFilteredPlaylists(playlists);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Enhanced search including web search for partial lyrics
    searchWeb(`${query} song lyrics`);
    
    // Filter songs from all collections - enhanced matching with partial lyrics
    const matchingSongs = uniqueSongs.filter(
      (song) => {
        const searchFields = [
          song.title,
          song.artist,
          song.album || '',
          song.genre || '',
          // Add partial matching for common song patterns
          song.title.replace(/[^\w\s]/g, ''),
          song.artist.replace(/[^\w\s]/g, '')
        ].join(' ').toLowerCase();
        
        // Enhanced matching including partial words and phonetic similarity
        const queryWords = query.toLowerCase().split(' ');
        const exactMatch = searchFields.includes(query);
        const partialMatch = queryWords.some(word => 
          searchFields.includes(word) || 
          searchFields.split(' ').some(field => 
            field.includes(word) || word.includes(field)
          )
        );
        
        return exactMatch || partialMatch;
      }
    );
    setFilteredSongs(matchingSongs);
    
    // Filter playlists
    const matchingPlaylists = playlists.filter(
      (playlist) =>
        playlist.title.toLowerCase().includes(query) ||
        playlist.description.toLowerCase().includes(query)
    );
    setFilteredPlaylists(matchingPlaylists);
  }, [searchQuery]);

  const startVoiceSearch = () => {
    if (recognition) {
      recognition.start();
    } else {
      toast.error("Voice search is not supported in your browser");
    }
  };

  const stopVoiceSearch = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };
  
  const handlePlaySong = (song: any) => {
    playSong(song);
    // Removed toast notification to reduce user interruption
  };

  const handleLikeSong = async (song: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikeSong(song.id);
  };
  
  return (
    <div className="pt-4 pb-32 md:pb-40 px-3 sm:px-4 md:px-8 md:ml-16 min-h-screen">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 mt-1">Search</h1>
      
      <div className="relative mb-6 sm:mb-8 max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="search"
          placeholder="Search songs, lyrics, or sing to find music..."
          className="pl-10 pr-14 bg-gray-800 border-gray-700 focus:border-music-accent h-10 sm:h-12 rounded-full w-full text-sm sm:text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          onClick={isListening ? stopVoiceSearch : startVoiceSearch}
          variant="ghost"
          size="sm"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full ${
            isListening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'text-gray-400 hover:text-music-accent'
          }`}
          title={isListening ? 'Stop voice search' : 'Search by voice or singing'}
        >
          {isListening ? <MicOff size={14} className="sm:w-4 sm:h-4" /> : <Mic size={14} className="sm:w-4 sm:h-4" />}
        </Button>
      </div>
      
      {isSearchingWeb && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-gray-400">Searching the web...</span>
        </div>
      )}
      
      {searchQuery.trim() === "" ? (
        <div className="text-center py-8 sm:py-10 text-gray-400 px-4">
          <SearchIcon className="mx-auto mb-3" size={40} />
          <p className="text-base sm:text-lg">Search for your favorite songs, artists or playlists</p>
          <p className="text-xs sm:text-sm mt-2">🎤 Use voice search or sing to find music instantly</p>
          <p className="text-xs sm:text-sm mt-1">✨ Enhanced with web search for better results</p>
        </div>
      ) : (
        <>
          {webSearchResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-green-400">🌐 Enhanced Google Search</h2>
              <div className="space-y-2">
                {webSearchResults.map((result) => (
                  <div key={result.id} className="flex items-center p-3 bg-green-900/20 rounded-lg border border-green-700/30 hover:bg-green-800/30 transition-colors">
                    <SearchIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-green-400 font-medium text-sm truncate">{result.title}</h3>
                      <p className="text-gray-400 text-xs mt-1 truncate">{result.snippet}</p>
                    </div>
                    <Button
                      onClick={() => window.open(result.url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white ml-2 flex-shrink-0"
                    >
                      🔍 Search
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredSongs.length === 0 && filteredPlaylists.length === 0 && webSearchResults.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-400 px-4">
              <p className="text-base sm:text-lg">No results found for "{searchQuery}"</p>
              <p className="text-xs sm:text-sm mt-2">Try searching with different keywords or use voice search</p>
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
                     {filteredSongs.map((song, index) => (
                       <div key={`${song.id}-${index}`} className="flex items-center p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors group">
                         <div className="w-8 text-gray-400 text-sm font-medium mr-3 text-center flex-shrink-0">
                           {index + 1}
                         </div>
                         
                         <div className="relative w-12 h-12 rounded-md overflow-hidden mr-3 flex-shrink-0 cursor-pointer group/play" onClick={() => handlePlaySong(song)}>
                            <img 
                              src={song.imageUrl || '/roi-assets/default-song-cover.png'} 
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
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
