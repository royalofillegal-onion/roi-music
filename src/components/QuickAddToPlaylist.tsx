
import React, { useState, useEffect } from 'react';
import { Song } from '@/data/songs';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Playlist {
  id: string;
  name: string;
}

interface QuickAddToPlaylistProps {
  song: Song;
  className?: string;
}

const QuickAddToPlaylist = ({ song, className = '' }: QuickAddToPlaylistProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUserPlaylists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserPlaylists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setPlaylists([]);
        return;
      }

      const { data, error } = await supabase
        .from('playlists')
        .select('id, name')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    }
  };

  const addSongToPlaylist = async (playlistId: string) => {
    try {
      setIsLoading(true);
      
      // Check if song is already in the playlist
      const { data: existingSong } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_id', song.id)
        .maybeSingle();

      if (existingSong) {
        toast.error('Song already in playlist');
        return;
      }

      // Get the next position in the playlist
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

      setAddedPlaylists(prev => new Set([...prev, playlistId]));
      toast.success('Added to playlist');
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      toast.error('Failed to add song');
    } finally {
      setIsLoading(false);
    }
  };

  if (playlists.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded-full bg-black/50 hover:bg-black/70 text-white ${className}`}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
        {playlists.map((playlist) => (
          <DropdownMenuItem
            key={playlist.id}
            onClick={() => addSongToPlaylist(playlist.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">{playlist.name}</span>
            {addedPlaylists.has(playlist.id) && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickAddToPlaylist;
