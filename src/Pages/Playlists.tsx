import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play, Heart, MoreHorizontal, Star, Music } from "lucide-react";
import PlaylistCard from "@/components/PlaylistCard";
import CreatePlaylistDialog from "@/components/playlist/CreatePlaylistDialog";
import { usePlayer } from "@/context/PlayerContext";
import { playlists } from "@/data/playlists";
import { getUserPlaylists } from "@/data/playlists";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Playlists = () => {
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { playPlaylist } = usePlayer();

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session) {
        loadUserPlaylists();
      } else {
        // Load from localStorage for non-logged in users
        const localPlaylists = getUserPlaylists();
        setUserPlaylists(localPlaylists);
      }
    };
    
    checkAuth();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        loadUserPlaylists();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const loadUserPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
      toast.error('Failed to load playlists');
    }
  };

  const handlePlayFeaturedPlaylist = (playlist: any) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playPlaylist(playlist.songs);
      toast.success(`Playing ${playlist.title}`);
    } else {
      toast.error('This playlist is empty');
    }
  };

  const handleCreatePlaylist = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to create playlists');
      return;
    }
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Music Library</h1>
          <p className="text-gray-400">Create and manage your personal playlists</p>
        </div>
        <Button 
          onClick={handleCreatePlaylist}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {/* Featured Playlists Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Star className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Featured Playlists</h2>
          <span className="text-gray-400 text-sm">Curated by RoyalStar</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group relative">
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="relative mb-4">
                  <img
                    src={playlist.coverImage}
                    alt={playlist.title}
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => handlePlayFeaturedPlaylist(playlist)}
                      className="bg-green-600 hover:bg-green-700 rounded-full w-12 h-12 p-0"
                    >
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-white truncate">{playlist.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{playlist.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{playlist.songs.length} tracks</span>
                    <span>by {playlist.createdBy}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Playlists Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Music className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold">Your Playlists</h2>
          {userPlaylists.length > 0 && (
            <span className="text-gray-400 text-sm">({userPlaylists.length} playlists)</span>
          )}
        </div>

        {userPlaylists.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
              <p className="text-gray-400 mb-4">
                {isLoggedIn 
                  ? "Create your first playlist to organize your favorite songs"
                  : "Sign in to create and manage your personal playlists"
                }
              </p>
              <Button 
                onClick={handleCreatePlaylist}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoggedIn ? "Create Your First Playlist" : "Sign In to Create Playlists"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Dialog */}
      <CreatePlaylistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPlaylistCreated={loadUserPlaylists}
      />
    </div>
  );
};

export default Playlists;
