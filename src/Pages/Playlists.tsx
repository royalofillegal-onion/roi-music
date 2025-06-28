
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Music, Play, Trash2, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  song_count?: number;
}

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setPlaylists([]);
        return;
      }

      // First get playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;

      // Then get song counts for each playlist
      const playlistsWithCounts = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { count } = await supabase
            .from('playlist_songs')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', playlist.id);
          
          return {
            ...playlist,
            song_count: count || 0
          };
        })
      );

      setPlaylists(playlistsWithCounts);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      setIsCreating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to create playlists');
        return;
      }

      const { error } = await supabase
        .from('playlists')
        .insert({
          user_id: session.user.id,
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || null,
          cover_image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`
        });

      if (error) throw error;

      toast.success('Playlist created successfully');
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setIsCreateDialogOpen(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    if (!confirm(`Are you sure you want to delete "${playlistName}"?`)) {
      return;
    }

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
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    toast.success(`Playing ${playlist.name}`);
    // TODO: Implement playlist playback
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Navbar />
        <div className="pt-20 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
          </div>
        </div>
        <Player />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      
      <div className="pt-16 md:pt-20 pb-32 md:pb-40 px-3 md:px-8 md:ml-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2">Your Playlists</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Create and manage your personal music collections
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-music-accent hover:bg-music-accent/90 text-black w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </DialogTrigger>
              
              <DialogContent className="bg-gray-900 border-gray-800 max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <div>
                    <Label htmlFor="playlist-name">Playlist Name</Label>
                    <Input
                      id="playlist-name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="My Awesome Playlist"
                      className="bg-gray-800 border-gray-700 mt-1"
                      maxLength={100}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="playlist-description">Description (Optional)</Label>
                    <Textarea
                      id="playlist-description"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Describe your playlist..."
                      className="bg-gray-800 border-gray-700 mt-1"
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="bg-music-accent hover:bg-music-accent/90 text-black"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Playlist'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Playlists Grid */}
          {playlists.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <Music className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No playlists yet</h3>
              <p className="text-gray-400 mb-6 text-sm md:text-base">
                Create your first playlist to organize your favorite songs
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-music-accent hover:bg-music-accent/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Playlist
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-all group">
                  <CardHeader className="p-3 md:p-4">
                    <div className="relative">
                      <img
                        src={playlist.cover_image || `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`}
                        alt={playlist.name}
                        className="w-full aspect-square object-cover rounded-md mb-3"
                      />
                      
                      {/* Play button overlay */}
                      <button
                        onClick={() => handlePlayPlaylist(playlist)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-music-accent rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 md:h-6 md:w-6 text-black ml-1" />
                        </div>
                      </button>
                    </div>
                    
                    <CardTitle className="text-sm md:text-base font-semibold truncate">
                      {playlist.name}
                    </CardTitle>
                    
                    {playlist.description && (
                      <p className="text-xs md:text-sm text-gray-400 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {playlist.song_count || 0} songs
                    </p>
                  </CardHeader>
                  
                  <CardContent className="p-3 md:p-4 pt-0">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayPlaylist(playlist)}
                        className="text-xs md:text-sm hover:text-music-accent"
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Play
                      </Button>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info('Edit functionality coming soon')}
                          className="p-1 md:p-2 hover:text-music-accent"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                          className="p-1 md:p-2 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Player />
    </div>
  );
};

export default Playlists;
