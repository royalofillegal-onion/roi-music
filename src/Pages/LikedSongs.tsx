
import React, { useState, useEffect } from "react";
import { Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/data/songs";
import { uniqueSongs } from "@/data/allSongs";
import { supabase } from "@/integrations/supabase/client";

import AddToPlaylist from "@/components/AddToPlaylist";

const LikedSongs = () => {
  const { likedSongs, playPlaylist, playSong, addToQueue } = usePlayer();
  const [likedSongsList, setLikedSongsList] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLikedSongs = () => {
      if (likedSongs) {
        const fullSongDetails = uniqueSongs.filter(song => likedSongs.includes(song.id));
        setLikedSongsList(fullSongDetails);
      } else {
        setLikedSongsList([]);
      }
      setLoading(false);
    };

    getLikedSongs();
  }, [likedSongs]);

  const playAllLikedSongs = () => {
    if (likedSongsList.length > 0) {
      playPlaylist(likedSongsList);
    }
  };

  const handlePlaySong = (song: Song, index: number) => {
    // Play the selected song and add remaining songs to queue
    playSong(song);
    
    if (index < likedSongsList.length - 1) {
      const nextSongs = likedSongsList.slice(index + 1);
      nextSongs.forEach(nextSong => {
        addToQueue(nextSong);
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-music-accent"></div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Heart className="h-8 w-8 mr-3 text-music-accent" />
          <h1 className="text-3xl font-bold">Liked Songs</h1>
        </div>
        
        <Button 
          onClick={playAllLikedSongs} 
          disabled={likedSongsList.length === 0}
          className="bg-music-accent hover:bg-music-accent/90 text-black"
        >
          Play All
        </Button>
      </div>
      
      <Separator className="my-6 bg-gray-800" />
      
      {likedSongsList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">You haven't liked any songs yet.</p>
          <p className="text-gray-500 mt-2">
            Like songs by clicking the heart icon while playing.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 px-4 py-2 text-gray-400 text-sm font-medium">
            <div className="col-span-1">#</div>
            <div className="col-span-6">TITLE</div>
            <div className="col-span-3"></div>
            <div className="col-span-2 flex justify-end">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          
          <Separator className="bg-gray-800" />
          
          {likedSongsList.map((song, index) => (
            <div 
              key={song.id}
              className="grid grid-cols-12 px-4 py-2 rounded-md hover:bg-white/5 cursor-pointer"
              onClick={() => handlePlaySong(song, index)}
            >
              <div className="col-span-1 flex items-center text-gray-400">
                {index + 1}
              </div>
              <div className="col-span-6 flex items-center">
                <span className="truncate font-medium">{song.title}</span>
              </div>
              <div className="col-span-3"></div>
              <div className="col-span-2 flex items-center justify-end text-gray-400">
                {formatDuration(song.duration)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
