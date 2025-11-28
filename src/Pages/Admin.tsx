import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { LogOut, Music, Plus, Radio, Users, Search, Filter } from "lucide-react";
import AdminSongForm from "@/components/admin/AdminSongForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import all songs from data files
import { uniqueSongs } from "@/data/allSongs";

const Admin = () => {
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "artist" | "genre" | "language" | "sync">("all");
  const [filterValue, setFilterValue] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  // Get all songs from data files
  const allSongs = uniqueSongs;

  // Filter and search songs
  const filteredSongs = allSongs.filter((song) => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!filterValue || filterBy === "all") return matchesSearch;

    switch (filterBy) {
      case "artist":
        return matchesSearch && song.artist.toLowerCase().includes(filterValue.toLowerCase());
      case "genre":
        return matchesSearch && song.genre && song.genre.toLowerCase().includes(filterValue.toLowerCase());
      case "language":
        return matchesSearch && song.language === filterValue;
      case "sync":
        return matchesSearch && song.sync === filterValue;
      default:
        return matchesSearch;
    }
  });

  // Get unique values for filters
  const uniqueArtists = [...new Set(allSongs.map(song => song.artist))].sort();
  const uniqueGenres = [...new Set(allSongs.map(song => song.genre).filter(Boolean))].sort();
  const uniqueLanguages = [...new Set(allSongs.map(song => song.language).filter(Boolean))].sort();
  const uniqueSyncs = [...new Set(allSongs.map(song => song.sync).filter(Boolean))].sort();

  // Get stats by categories
  const statsByLanguage = allSongs.reduce((acc, song) => {
    const lang = song.language || 'other';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsByGenre = allSongs.reduce((acc, song) => {
    const genre = song.genre || 'other';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400">Manage songs, playlists, and homepage content</p>
        </div>
        <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
          <LogOut size={16} />
          Logout
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Songs</h3>
          <p className="text-2xl font-bold text-green-400">{allSongs.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Telugu Songs</h3>
          <p className="text-2xl font-bold text-blue-400">{statsByLanguage.telugu || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Hindi Songs</h3>
          <p className="text-2xl font-bold text-purple-400">{statsByLanguage.hindi || 0}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Other Languages</h3>
          <p className="text-2xl font-bold text-orange-400">
            {Object.keys(statsByLanguage).reduce((acc, key) => {
              if (key !== 'telugu' && key !== 'hindi') {
                acc += statsByLanguage[key];
              }
              return acc;
            }, 0)}
          </p>
        </div>
      </div>

      {/* Genre Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Songs by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(statsByGenre).slice(0, 12).map(([genre, count]) => (
            <div key={genre} className="bg-gray-800 p-3 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-300 capitalize">{genre}</p>
              <p className="text-lg font-bold text-cyan-400">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Homepage Content Management */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Homepage Content Management</h2>
          <Link to="/admin/homepage">
            <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
              <Music size={16} />
              Manage Homepage Sections
            </Button>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 mb-4">
            Control which songs appear in homepage sections and manage live content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
              <h4 className="font-medium text-purple-400 mb-1">Morning Section</h4>
              <p className="text-gray-400">Time-based morning content</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
              <h4 className="font-medium text-blue-400 mb-1">Trending Section</h4>
              <p className="text-gray-400">Popular and trending songs</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
              <h4 className="font-medium text-red-400 mb-1">Live Management</h4>
              <p className="text-gray-400">Live streams and events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Songs Database</h2>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            {showForm ? "Cancel" : <><Plus size={16} /> Add New Song</>}
          </Button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <AdminSongForm onComplete={() => setShowForm(false)} />
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={(value: "all" | "artist" | "genre" | "language" | "sync") => {
                setFilterBy(value);
                setFilterValue("");
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="genre">Genre</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="sync">Sync</SelectItem>
                </SelectContent>
              </Select>

              {filterBy !== "all" && (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={`Select ${filterBy}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All {filterBy}s</SelectItem>
                    {(filterBy === "artist" ? uniqueArtists :
                      filterBy === "genre" ? uniqueGenres :
                      filterBy === "language" ? uniqueLanguages :
                      uniqueSyncs).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredSongs.length} of {allSongs.length} songs
          </div>
        </div>

        {/* Songs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Artist</th>
                  <th className="py-3 px-4 text-left">Album</th>
                  <th className="py-3 px-4 text-left">Genre</th>
                  <th className="py-3 px-4 text-left">Language</th>
                  <th className="py-3 px-4 text-left">Sync</th>
                  <th className="py-3 px-4 text-left">Duration</th>
                  <th className="py-3 px-4 text-left">Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.slice(0, 100).map((song) => ( // Limit to 100 for performance
                  <tr key={song.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                        <img src={song.imageUrl} alt={song.title} className="h-full w-full object-cover" />
                      </div>
                      <span className="truncate max-w-[200px]">{song.title}</span>
                    </td>
                    <td className="py-3 px-4 truncate max-w-[150px]">{song.artist}</td>
                    <td className="py-3 px-4 truncate max-w-[150px]">{song.album || "-"}</td>
                    <td className="py-3 px-4 truncate max-w-[100px]">{song.genre || "-"}</td>
                    <td className="py-3 px-4 capitalize">{song.language || "-"}</td>
                    <td className="py-3 px-4 capitalize">{song.sync || "-"}</td>
                    <td className="py-3 px-4">
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4">{song.year || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSongs.length > 100 && (
            <div className="p-4 border-t border-gray-700 text-center text-gray-400">
              Showing first 100 results. Use filters to narrow down your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;