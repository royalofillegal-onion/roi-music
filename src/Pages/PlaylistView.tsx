import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Play, Trash2, MoreVertical, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SongRow from "@/components/SongRow";
import LanguageFilter from "@/components/LanguageFilter";
import { playlists, getUserPlaylists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";
import { toast } from "sonner";

const PlaylistView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playPlaylist, currentSong, playSong, toggleLikeSong, isLiked } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [isUserPlaylist, setIsUserPlaylist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  
  useEffect(() => {
    if (!id) return;
    
    const loadPlaylist = async () => {
      try {
        setLoading(true);
        
        // Check system playlists first
        const systemPlaylist = playlists.find((p) => p.id === id);
        if (systemPlaylist) {
          setPlaylist(systemPlaylist);
          setPlaylistSongs(systemPlaylist.songs);
          setIsUserPlaylist(false);
          setLoading(false);
          return;
        }
        
        // Check user playlists in localStorage
        const userPlaylists = getUserPlaylists();
        const userPlaylist = userPlaylists.find((p) => p.id === id);
        if (userPlaylist) {
          setPlaylist(userPlaylist);
          setPlaylistSongs(userPlaylist.songs);
          setIsUserPlaylist(true);
          setLoading(false);
          return;
        }
        
        // Check Supabase playlists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: supabasePlaylist, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();
          
          if (supabasePlaylist && !error) {
            // Fetch songs for this playlist
            const { data: playlistSongsData, error: songsError } = await supabase
              .from('playlist_songs')
              .select('song_id, position')
              .eq('playlist_id', id)
              .order('position', { ascending: true });
            
            if (!songsError && playlistSongsData) {
              const songsList = playlistSongsData
                .map(ps => uniqueSongs.find(s => s.id === ps.song_id))
                .filter(Boolean) as Song[];
              
              setPlaylist({
                id: supabasePlaylist.id,
                title: supabasePlaylist.name,
                description: supabasePlaylist.description,
                coverImage: supabasePlaylist.cover_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                songs: songsList
              });
              setPlaylistSongs(songsList);
              setIsUserPlaylist(true);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading playlist:', error);
        setLoading(false);
        navigate("/");
      }
    };
    
    loadPlaylist();
  }, [id, navigate]);
  
  const removeSongFromPlaylist = async (songId: string) => {
    if (!isUserPlaylist || !id) return;
    
    try {
      // Remove from Supabase if it's a cloud playlist
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('playlist_songs')
          .delete()
          .eq('playlist_id', id)
          .eq('song_id', songId);
        
        if (!error) {
          // Update local state
          const updatedSongs = playlistSongs.filter(song => song.id !== songId);
          setPlaylistSongs(updatedSongs);
          setPlaylist(prev => ({ ...prev, songs: updatedSongs }));
          toast.success('Song removed from playlist');
          return;
        }
      }
      
      // Handle localStorage playlists
      const userPlaylists = getUserPlaylists();
      const playlistIndex = userPlaylists.findIndex(p => p.id === id);
      
      if (playlistIndex !== -1) {
        userPlaylists[playlistIndex].songs = userPlaylists[playlistIndex].songs.filter(
          song => song.id !== songId
        );
        localStorage.setItem("userPlaylists", JSON.stringify(userPlaylists));
        
        const updatedSongs = userPlaylists[playlistIndex].songs;
        setPlaylistSongs(updatedSongs);
        setPlaylist(prev => ({ ...prev, songs: updatedSongs }));
        toast.success('Song removed from playlist');
      }
    } catch (error) {
      console.error('Error removing song:', error);
      toast.error('Failed to remove song');
    }
  };

  // Helper function to detect song language based on artist/title
  const detectSongLanguage = (song: Song): string => {
    const text = `${song.title} ${song.artist}`.toLowerCase();
    
    // Telugu detection patterns
    if (text.includes('telugu') || 
        /[\u0C00-\u0C7F]/.test(text) ||
        song.artist.toLowerCase().includes('tollywood') ||
        ['ntr', 'prabhas', 'allu arjun', 'ram charan', 'mahesh babu'].some(name => 
          text.includes(name.toLowerCase())
        )) {
      return 'telugu';
    }
    
    // Hindi detection patterns
    if (text.includes('hindi') || 
        text.includes('bollywood') ||
        /[\u0900-\u097F]/.test(text) ||
        ['shah rukh', 'salman khan', 'aamir khan', 'hrithik roshan', 'akshay kumar'].some(name => 
          text.includes(name.toLowerCase())
        )) {
      return 'hindi';
    }
    
    // Tamil detection patterns
    if (text.includes('tamil') || 
        text.includes('kollywood') ||
        /[\u0B80-\u0BFF]/.test(text) ||
        ['rajinikanth', 'kamal hassan', 'vijay', 'ajith', 'suriya'].some(name => 
          text.includes(name.toLowerCase())
        )) {
      return 'tamil';
    }
    
    // Kannada detection patterns
    if (text.includes('kannada') || 
        text.includes('sandalwood') ||
        /[\u0C80-\u0CFF]/.test(text) ||
        ['yash', 'puneeth rajkumar', 'sudeep'].some(name => 
          text.includes(name.toLowerCase())
        )) {
      return 'kannada';
    }
    
    return 'other';
  };

  // Filter songs based on selected language
  const filteredSongs = useMemo(() => {
    if (selectedLanguage === 'all') {
      return playlistSongs;
    }
    
    return playlistSongs.filter(song => {
      const songLanguage = detectSongLanguage(song);
      return songLanguage === selectedLanguage;
    });
  }, [playlistSongs, selectedLanguage]);
  
  if (loading) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-music-accent"></div>
        </div>
      </div>
    );
  }
  
  if (!playlist) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Playlist not found</h2>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  const totalDuration = filteredSongs.reduce((acc, song) => acc + song.duration, 0);
  const formatTotalDuration = () => {
    const minutes = Math.floor(totalDuration / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return hours > 0
      ? `${hours} hr ${remainingMinutes} min`
      : `${minutes} min`;
  };
  
  const handlePlayPlaylist = () => {
    if (filteredSongs.length > 0) {
      playPlaylist(filteredSongs);
    }
  };
  
  return (
    <div className="pb-32 md:pb-40 md:ml-16">
      {/* Header */}
      <div 
        className="relative flex flex-col md:flex-row items-end md:items-end p-4 md:p-8 pt-8 md:pt-12 text-white"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${playlist.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '280px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        
        <div className="hidden md:block mr-6">
          <img 
            src={playlist.coverImage} 
            alt={playlist.title}
            className="w-32 h-32 md:w-48 md:h-48 object-cover shadow-xl rounded"
          />
        </div>
        
        <div className="flex flex-col items-start justify-end h-full">
          <h5 className="text-xs uppercase font-medium mb-1">Playlist</h5>
          <h1 className="text-2xl md:text-5xl font-bold mb-1">{playlist.title}</h1>
          <p className="text-sm opacity-80 mb-3 line-clamp-2">{playlist.description}</p>
          <div className="flex items-center text-sm text-gray-300">
            <span className="font-medium">
              {selectedLanguage === 'all' ? playlistSongs.length : filteredSongs.length} 
              {selectedLanguage !== 'all' && ` of ${playlistSongs.length}`} songs
            </span>
            <span className="mx-2">•</span>
            <span>{formatTotalDuration()}</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons and filters */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between bg-gray-900/30">
        <Button 
          onClick={handlePlayPlaylist}
          className="rounded-full bg-music-accent hover:bg-music-accent/80 text-black font-medium h-12 w-12 md:h-14 md:w-14 p-0"
        >
          <Play className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
        
        <LanguageFilter
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>
      
      {/* Songs list */}
      <div className="px-4 md:px-8">
        {/* Table header - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="w-8 text-right">#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex items-center justify-end">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        
        {/* Songs */}
        <div className="mt-2 space-y-1">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>
                {selectedLanguage === 'all' 
                  ? 'This playlist is empty' 
                  : `No songs found for ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} language`
                }
              </p>
              {selectedLanguage !== 'all' && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedLanguage('all')}
                  className="mt-2 text-sm"
                >
                  Show all songs
                </Button>
              )}
            </div>
          ) : (
            filteredSongs.map((song, index) => (
              <div key={song.id} className="group">
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-4 rounded-lg hover:bg-gray-800/50 transition-colors">
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                      <button 
                        onClick={() => playSong(song)}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        {currentSong?.id === song.id ? (
                          <div className="w-2 h-2 bg-music-accent rounded-full animate-pulse"></div>
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    
                    <img 
                      src={song.imageUrl} 
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate text-sm">{song.title}</h4>
                      <p className="text-gray-400 truncate text-xs">{song.artist}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleLikeSong(song.id)}
                        className={`p-1 rounded-full transition-colors ${
                          isLiked(song.id) ? 'text-red-500' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked(song.id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      {isUserPlaylist && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => removeSongFromPlaylist(song.id)}
                              className="text-red-400 focus:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from playlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  
                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center w-full">
                    <div className="w-8 text-right text-gray-400 text-sm">
                      {currentSong?.id === song.id ? (
                        <div className="w-4 h-4 bg-music-accent rounded-full animate-pulse mx-auto"></div>
                      ) : (
                        <span className="group-hover:hidden">{index + 1}</span>
                      )}
                      <button 
                        onClick={() => playSong(song)}
                        className="hidden group-hover:block text-white hover:text-music-accent transition-colors"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-white">{song.title}</h4>
                        <p className="text-gray-400 text-sm">{song.artist}</p>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {song.album || '-'}
                    </div>
                    
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => toggleLikeSong(song.id)}
                        className={`p-1 rounded-full transition-colors ${
                          isLiked(song.id) ? 'text-red-500' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked(song.id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      <span className="text-gray-400 text-sm">
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </span>
                      
                      {isUserPlaylist && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => removeSongFromPlaylist(song.id)}
                              className="text-red-400 focus:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from playlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
