
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Song } from '@/data/songs';
import CreatePlaylistDialog from './CreatePlaylistDialog';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
}

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: Song;
}

const AddToPlaylistDialog = ({ open, onOpenChange, song }: AddToPlaylistDialogProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchUserPlaylists();
    }
  }, [open]);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to view playlists');
        return;
      }

      const { data, error } = await supabase
        .from('playlists')
        .select('id, name, description, cover_image')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const addSongToPlaylist = async (playlistId: string) => {
    try {
      setAddingToPlaylist(playlistId);
      
      // Check if song is already in the playlist
      const { data: existingSong } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_id', song.id)
        .single();

      if (existingSong) {
        toast.error('Song is already in this playlist');
        return;
      }

      // Get the next position in the playlist
      const { data: lastSong } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const nextPosition = (lastSong?.position || 0) + 1;

      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: song.id,
          position: nextPosition
        });

      if (error) throw error;

      toast.success('Song added to playlist');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error('Failed to add song to playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Add "{song.title}" to Playlist
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-400">Your Playlists</h3>
            <CreatePlaylistDialog onPlaylistCreated={fetchUserPlaylists} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-music-accent" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No playlists yet</p>
              <p className="text-sm">Create your first playlist to get started</p>
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={playlist.cover_image || `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`}
                        alt={playlist.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-sm">{playlist.name}</h4>
                        {playlist.description && (
                          <p className="text-xs text-gray-400 truncate max-w-32">
                            {playlist.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => addSongToPlaylist(playlist.id)}
                      disabled={addingToPlaylist === playlist.id}
                      className="bg-music-accent hover:bg-music-accent/90 text-black"
                    >
                      {addingToPlaylist === playlist.id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistDialog;
