
import React, { useState, useEffect } from "react";
import { playlists, getUserPlaylists } from "@/data/playlists";
import PlaylistCard from "@/components/PlaylistCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPlaylist, Playlist } from "@/data/playlists";

const Playlists = () => {
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  // Load user playlists from localStorage
  useEffect(() => {
    setUserPlaylists(getUserPlaylists());
  }, []);

  const handleCreatePlaylist = () => {
    if (newPlaylistTitle.trim()) {
      createPlaylist(newPlaylistTitle.trim(), newPlaylistDescription.trim());
      setUserPlaylists(getUserPlaylists());
      setNewPlaylistTitle("");
      setNewPlaylistDescription("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-2">Your Playlists</h1>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="bg-music-accent hover:bg-music-accent/80 text-black font-medium"
        >
          <Plus className="h-5 w-5 mr-1" /> New Playlist
        </Button>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Featured Playlists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} className="w-full" />
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
        {userPlaylists.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-900/30 rounded-lg">
            <p className="mb-4">You don't have any custom playlists yet</p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              variant="outline"
              className="border-music-accent text-music-accent hover:bg-music-accent/10"
            >
              Create Your First Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {userPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} className="w-full" />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="My Awesome Playlist"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="Add an optional description for your playlist"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlaylist}
              className="bg-music-accent hover:bg-music-accent/80 text-black"
              disabled={!newPlaylistTitle.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Playlists;
