
import React, { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import SongRow from "@/components/SongRow";
import { songs } from "@/data/songs";
import { playlists } from "@/data/playlists";
import PlaylistCard from "@/components/PlaylistCard";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [filteredPlaylists, setFilteredPlaylists] = useState(playlists);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSongs(songs);
      setFilteredPlaylists(playlists);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Filter songs
    const matchingSongs = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.album && song.album.toLowerCase().includes(query))
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
  
  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <h1 className="text-3xl font-bold mb-6 mt-2">Search</h1>
      
      <div className="relative mb-8 max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="search"
          placeholder="Search for songs, artists or playlists..."
          className="pl-10 bg-gray-800 border-gray-700 focus:border-music-accent h-12 rounded-full w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {searchQuery.trim() === "" ? (
        <div className="text-center py-10 text-gray-400">
          <SearchIcon className="mx-auto mb-3" size={48} />
          <p className="text-lg">Search for your favorite songs, artists or playlists</p>
        </div>
      ) : (
        <>
          {filteredSongs.length === 0 && filteredPlaylists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-lg">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {filteredPlaylists.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Playlists</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPlaylists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} className="w-full" />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredSongs.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Songs</h2>
                  <div className="space-y-1 bg-gray-900/30 rounded-md overflow-hidden">
                    {filteredSongs.map((song, index) => (
                      <SongRow key={song.id} song={song} index={index} />
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
