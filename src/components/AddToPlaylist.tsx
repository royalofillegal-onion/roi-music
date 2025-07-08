
import React, { useState, useEffect } from "react";
import { Song } from "@/data/songs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, ListPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddToPlaylistProps {
  song: Song;
  trigger?: React.ReactNode;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  user_id: string;
  song_count?: number;
}

const AddToPlaylist = ({ song, trigger }: AddToPlaylistProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  
  // Load user playlists
  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setPlaylists([]);
        return;
      }

      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs(count)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithCount = data?.map(playlist => ({
        ...playlist,
        song_count: playlist.playlist_songs?.[0]?.count || 0
      })) || [];

      setPlaylists(playlistsWithCount);
    } catch (error) {
      console.error('Error loading playlists:', error);
      toast.error('Failed to load playlists');
    }
  };

  const createNewPlaylist = async () => {
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

      const { data: newPlaylist, error: playlistError } = await supabase
        .from('playlists')
        .insert({
          user_id: session.user.id,
          name: newPlaylistName.trim(),
          cover_image: `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`
        })
        .select()
        .single();

      if (playlistError) throw playlistError;

      // Add the song to the new playlist
      const { error: songError } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: newPlaylist.id,
          song_id: song.id,
          position: 1
        });

      if (songError) throw songError;

      toast.success(`Created "${newPlaylistName}" and added "${song.title}"`);
      setNewPlaylistName("");
      setShowCreateForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Add song to the selected playlist
  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      setIsAdding(playlistId);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to add songs to playlists');
        return;
      }

      // Check if song already exists in playlist
      const { data: existingSong } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_id', song.id)
        .maybeSingle();

      if (existingSong) {
        toast.error('Song is already in this playlist');
        return;
      }

      // Get the next position
      const { data: lastSong } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition = (lastSong?.position || 0) + 1;

      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: song.id,
          position: nextPosition
        });

      if (error) throw error;

      const playlist = playlists.find(p => p.id === playlistId);
      toast.success(`Added "${song.title}" to "${playlist?.name}"`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error('Failed to add song to playlist');
    } finally {
      setIsAdding(null);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <ListPlus className="h-4 w-4" /> 
            <span>Add to Playlist</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <img 
                src={song.imageUrl || '/lovable-uploads/a3cdc6ab-590f-4e71-b4c5-bdeec7e8189c.png'} 
                alt={song.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div>
                <div className="font-medium text-sm">{song.title}</div>
                <div className="text-gray-400 text-xs">{song.artist}</div>
              </div>
            </div>
          </div>
          
          {!showCreateForm ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Your Playlists</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateForm(true)}
                  className="text-music-accent border-music-accent hover:bg-music-accent/10"
                >
                  <Plus className="h-3 w-3 mr-1" /> New
                </Button>
              </div>
              
              {playlists.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm mb-3">No playlists yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(true)}
                    className="border-music-accent text-music-accent hover:bg-music-accent/10"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Playlist
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-auto">
                  {playlists.map(playlist => (
                    <Button
                      key={playlist.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 hover:bg-gray-800"
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      disabled={isAdding === playlist.id}
                    >
                      <div className="flex items-center w-full">
                        <img 
                          src={playlist.cover_image || '/lovable-uploads/a3cdc6ab-590f-4e71-b4c5-bdeec7e8189c.png'} 
                          alt={playlist.name} 
                          className="w-8 h-8 object-cover rounded mr-3 flex-shrink-0" 
                        />
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{playlist.name}</div>
                          <div className="text-xs text-gray-400">
                            {playlist.song_count || 0} songs
                          </div>
                        </div>
                        {isAdding === playlist.id && (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Create New Playlist</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Back
                </Button>
              </div>
              
              <div>
                <Label htmlFor="playlist-name" className="text-sm">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="bg-gray-800 border-gray-700 mt-1"
                  maxLength={100}
                  onKeyPress={(e) => e.key === 'Enter' && createNewPlaylist()}
                />
              </div>
              
              <Button
                onClick={createNewPlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
                className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create & Add Song
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <DialogClose asChild>
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylist;
