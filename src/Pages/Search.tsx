
import React, { useState, useEffect } from "react";
import { Search as SearchIcon, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SongRow from "@/components/SongRow";
import { uniqueSongs } from "@/data/allSongs";
import { playlists } from "@/data/playlists";
import PlaylistCard from "@/components/PlaylistCard";
import { toast } from "sonner";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState(uniqueSongs);
  const [filteredPlaylists, setFilteredPlaylists] = useState(playlists);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

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
        toast.success("Listening... Speak now!");
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        toast.success(`Searching for: "${transcript}"`);
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
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSongs(uniqueSongs);
      setFilteredPlaylists(playlists);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Filter songs from all collections
    const matchingSongs = uniqueSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query)) ||
        (song.genre && song.genre.toLowerCase().includes(query)) ||
        (song.category && song.category.toLowerCase().includes(query)) ||
        (song.mood && song.mood.toLowerCase().includes(query)) ||
        (song.tags && song.tags.some(tag => tag.toLowerCase().includes(query)))
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
  
  return (
    <div className="pt-6 pb-32 md:pb-40 px-2 sm:px-4 md:px-8 md:ml-16">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 mt-2">Search</h1>
      
      <div className="relative mb-6 sm:mb-8 max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="search"
          placeholder="Search for songs, artists or playlists..."
          className="pl-10 pr-14 bg-gray-800 border-gray-700 focus:border-music-accent h-10 sm:h-12 rounded-full w-full text-sm sm:text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
      
      {searchQuery.trim() === "" ? (
        <div className="text-center py-8 sm:py-10 text-gray-400 px-4">
          <SearchIcon className="mx-auto mb-3" size={40} />
          <p className="text-base sm:text-lg">Search for your favorite songs, artists or playlists</p>
          <p className="text-xs sm:text-sm mt-2">Use the microphone to search with your voice</p>
          <p className="text-xs sm:text-sm mt-1 text-music-accent">
            {uniqueSongs.length} songs available to search
          </p>
        </div>
      ) : (
        <>
          {filteredSongs.length === 0 && filteredPlaylists.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-400 px-4">
              <p className="text-base sm:text-lg">No results found for "{searchQuery}"</p>
              <p className="text-xs sm:text-sm mt-2">Try searching with different keywords</p>
            </div>
          ) : (
            <>
              {filteredPlaylists.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Playlists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                    {filteredPlaylists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} className="w-full" />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredSongs.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                    Songs ({filteredSongs.length} results)
                  </h2>
                  <div className="space-y-1 bg-gray-900/30 rounded-md overflow-hidden">
                    {filteredSongs.map((song, index) => (
                      <SongRow key={`${song.id}-${index}`} song={song} index={index} />
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
