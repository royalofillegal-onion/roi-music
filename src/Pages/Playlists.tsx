
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Plus, Play, Trash2, Edit, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreatePlaylistDialog from "@/components/playlist/CreatePlaylistDialog";
import { usePlayer } from "@/context/PlayerContext";
import { songs } from "@/data/songs";

interface UserPlaylist {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  song_count: number;
}

const Playlists = () => {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch playlists with song count
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select(`
          id, 
          name, 
          description, 
          cover_image, 
          created_at,
          playlist_songs (count)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (playlistError) throw playlistError;

      // Transform data to include song count
      const transformedPlaylists = playlistData?.map(playlist => ({
        ...playlist,
        song_count: playlist.playlist_songs?.[0]?.count || 0
      })) || [];

      setPlaylists(transformedPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      // First delete all songs from the playlist
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

      toast.success('Playlist deleted successfully');
      fetchUserPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const playPlaylist = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('song_id')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const firstSongId = data[0].song_id;
        const song = songs.find(s => s.id === firstSongId);
        
        if (song) {
          playSong(song);
          toast.success('Playing playlist');
        } else {
          toast.error('Song not found');
        }
      } else {
        toast.error('Playlist is empty');
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
      toast.error('Failed to play playlist');
    }
  };

  if (loading) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-music-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Music className="h-8 w-8 text-music-accent" />
                My Playlists
              </h1>
              <p className="text-gray-400 mt-1">
                {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <CreatePlaylistDialog onPlaylistCreated={fetchUserPlaylists} />
        </div>

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
            <p className="text-gray-400 mb-8">Create your first playlist to organize your favorite music</p>
            <CreatePlaylistDialog onPlaylistCreated={fetchUserPlaylists} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="bg-gray-900/50 border-gray-800 group hover:bg-gray-800/50 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden relative">
                    <img 
                      src={playlist.cover_image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'} 
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-music-accent hover:bg-music-accent/90 text-black"
                        onClick={() => playPlaylist(playlist.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg truncate">{playlist.name}</CardTitle>
                  <p className="text-sm text-gray-400">
                    {playlist.song_count} song{playlist.song_count !== 1 ? 's' : ''}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {playlist.description && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="flex-1 mr-2"
                    >
                      <Music className="h-3 w-3 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePlaylist(playlist.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlists;
