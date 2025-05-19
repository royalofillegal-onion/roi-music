
import React, { useState, useEffect } from "react";
import { Song } from "@/data/songs";
import { Playlist, getUserPlaylists, addSongToPlaylist } from "@/data/playlists";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, ListPlus } from "lucide-react";

interface AddToPlaylistProps {
  song: Song;
  trigger?: React.ReactNode;
}

const AddToPlaylist = ({ song, trigger }: AddToPlaylistProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Load user playlists
  useEffect(() => {
    if (isOpen) {
      const userPlaylists = getUserPlaylists();
      setPlaylists(userPlaylists);
    }
  }, [isOpen]);
  
  // Add song to the selected playlist
  const handleAddToPlaylist = (playlistId: string) => {
    const result = addSongToPlaylist(playlistId, song);
    
    if (result) {
      toast.success(`Added ${song.title} to playlist`);
      setIsOpen(false);
    } else {
      toast.error("Failed to add song to playlist");
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
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-2 text-sm">
            <span className="font-medium">{song.title}</span>
            <span className="text-gray-400"> • {song.artist}</span>
          </div>
          
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>You don't have any playlists yet.</p>
              <Button 
                variant="outline" 
                className="mt-2 border-music-accent text-music-accent hover:bg-music-accent/10"
                onClick={() => window.location.href = '/playlists'}
              >
                <Plus className="h-4 w-4 mr-2" /> Create a Playlist
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 mt-4 max-h-64 overflow-auto">
              {playlists.map(playlist => (
                <Button
                  key={playlist.id}
                  variant="outline"
                  className="justify-start h-auto py-3 hover:bg-gray-800"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <div className="flex items-center">
                    <img 
                      src={playlist.coverImage} 
                      alt={playlist.title} 
                      className="w-10 h-10 object-cover rounded mr-3" 
                    />
                    <div className="text-left">
                      <div className="font-medium">{playlist.title}</div>
                      <div className="text-xs text-gray-400">
                        {playlist.songs.length} songs
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
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
