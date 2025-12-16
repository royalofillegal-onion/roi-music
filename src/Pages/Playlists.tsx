
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Music, Loader2, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreatePlaylistDialog from '@/components/playlist/CreatePlaylistDialog';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  song_count?: number;
}

const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetchPlaylists();
  }, []);

  const checkAuthAndFetchPlaylists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await fetchPlaylists();
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Fetch playlists with song count
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select(`
          id, 
          name, 
          description, 
          cover_image,
          playlist_songs(count)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;

      // Transform data to include song count
      const playlistsWithCount = playlistsData?.map(playlist => ({
        ...playlist,
        song_count: playlist.playlist_songs?.[0]?.count || 0
      })) || [];

      setPlaylists(playlistsWithCount);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const deletePlaylist = async (playlistId: string, playlistName: string) => {
    if (!confirm(`Are you sure you want to delete "${playlistName}"?`)) return;

    try {
      // Delete playlist songs first
      await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId);

      // Then delete the playlist
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Music className="h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-gray-400 mb-6">Please sign in to view and create playlists</p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-music-accent hover:bg-music-accent/90 text-black"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Playlists</h1>
          <p className="text-gray-400 text-sm md:text-base">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 w-full sm:w-64"
            />
          </div>
          <CreatePlaylistDialog onPlaylistCreated={fetchPlaylists} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No playlists found' : 'No playlists yet'}
          </h2>
          <p className="text-gray-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Create your first playlist to get started'
            }
          </p>
          {!searchQuery && (
            <CreatePlaylistDialog onPlaylistCreated={fetchPlaylists} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {filteredPlaylists.map(playlist => (
            <div
              key={playlist.id}
              className="group bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              onClick={() => handlePlaylistClick(playlist.id)}
            >
              <div className="relative mb-4">
                <img
                  src={playlist.cover_image || `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`}
                  alt={playlist.name}
                  className="w-full aspect-square rounded-lg object-cover"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id, playlist.name);
                    }}
                    className="h-8 w-8 p-0 bg-black/50 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm md:text-base truncate group-hover:text-music-accent transition-colors">
                  {playlist.name}
                </h3>
                
                {playlist.description && (
                  <p className="text-gray-400 text-xs md:text-sm line-clamp-2">
                    {playlist.description}
                  </p>
                )}
                
                <p className="text-gray-500 text-xs">
                  {playlist.song_count} song{playlist.song_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
