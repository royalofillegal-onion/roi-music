
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import SongRow from "@/components/SongRow";
import { playlists, getUserPlaylists } from "@/data/playlists";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PlaylistView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playSong, addToQueue, currentSong } = usePlayer();
  const [playlist, setPlaylist] = useState(playlists.find((p) => p.id === id));
  
  // Fetch playlist - from system playlists or user playlists
  useEffect(() => {
    if (!id) return;
    
    // Check system playlists first
    const systemPlaylist = playlists.find((p) => p.id === id);
    if (systemPlaylist) {
      setPlaylist(systemPlaylist);
      return;
    }
    
    // Then check user playlists
    const userPlaylists = getUserPlaylists();
    const userPlaylist = userPlaylists.find((p) => p.id === id);
    if (userPlaylist) {
      setPlaylist(userPlaylist);
      return;
    }
    
    // Playlist not found
    navigate("/");
  }, [id, navigate]);
  
  if (!playlist) {
    return <div className="p-8">Loading...</div>;
  }
  
  const totalDuration = playlist.songs.reduce((acc, song) => acc + song.duration, 0);
  const formatTotalDuration = () => {
    const minutes = Math.floor(totalDuration / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return hours > 0
      ? `${hours} hr ${remainingMinutes} min`
      : `${minutes} min`;
  };
  
  // Enhanced playPlaylist function that adds all playlist songs to queue
  const playPlaylist = () => {
    if (playlist.songs.length > 0) {
      const firstSong = playlist.songs[0];
      const remainingSongs = playlist.songs.slice(1);
      
      // Play the first song immediately
      playSong(firstSong);
      
      // Add all remaining songs to the queue
      remainingSongs.forEach(song => {
        addToQueue(song);
      });
      
      toast.success(`Playing playlist: ${playlist.title}`);
      console.log(`Playing playlist: ${playlist.title} with ${playlist.songs.length} songs`);
    }
  };
  
  return (
    <div className="pb-32 md:pb-40 md:ml-16">
      {/* Header */}
      <div 
        className="relative flex flex-col md:flex-row items-end md:items-end p-8 pt-12 md:p-8 text-white"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${playlist.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="hidden md:block mr-6">
          <img 
            src={playlist.coverImage} 
            alt={playlist.title}
            className="w-48 h-48 object-cover shadow-xl"
          />
        </div>
        
        <div className="flex flex-col items-start justify-end h-full">
          <h5 className="text-xs uppercase font-medium mb-1">Playlist</h5>
          <h1 className="text-5xl font-bold mb-1">{playlist.title}</h1>
          <p className="text-sm opacity-80 mb-3">{playlist.description}</p>
          <div className="flex items-center text-sm text-gray-300">
            <span className="font-medium">{playlist.songs.length} songs</span>
            <span className="mx-2">•</span>
            <span>{formatTotalDuration()}</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="px-8 py-4 flex items-center bg-gray-900/30">
        <Button 
          onClick={playPlaylist}
          className="rounded-full bg-music-accent hover:bg-music-accent/80 text-black font-medium h-14 w-14 p-0 mr-4"
        >
          <Play className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Songs list */}
      <div className="px-8">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 border-b border-gray-800 text-gray-400 text-sm">
          <div className="w-8 text-right">#</div>
          <div>Title</div>
          <div className="hidden md:block">Album</div>
          <div className="flex items-center justify-end">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        
        {/* Table body */}
        <div className="mt-2 space-y-1">
          {playlist.songs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>This playlist is empty</p>
            </div>
          ) : (
            playlist.songs.map((song, index) => (
              <SongRow 
                key={song.id} 
                song={song} 
                index={index}
                isActive={currentSong?.id === song.id} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistView;
