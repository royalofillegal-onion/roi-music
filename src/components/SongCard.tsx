
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Heart } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Song } from "@/data/songs";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { playlists } from "@/data/playlists";
import { supabase } from "@/integrations/supabase/client";
import ShareSong from "@/components/ShareSong";
import QuickAddToPlaylist from "@/components/QuickAddToPlaylist";
import { useGuestPlaylist } from "@/hooks/useGuestPlaylist";

interface SongCardProps {
  song: Song;
  className?: string;
  variant?: "default" | "compact" | "search" | "fullview";
}

const SongCard = ({ song, className, variant = "default" }: SongCardProps) => {
  const navigate = useNavigate();
  const { playSong, addToQueue, toggleLikeSong, isLiked } = usePlayer();
  const [isLikedState, setIsLikedState] = useState(() => isLiked(song.id));
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const { addToGuestPlaylist, isInGuestPlaylist } = useGuestPlaylist();

  const handleNavigateToDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/song-detail/${encodeURIComponent(song.id)}`);
  };
  
  const handlePlay = () => {
    playSong(song);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is logged in before liking
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      // For guest users, add to the "444" playlist
      addToGuestPlaylist(song);
      return;
    }

    setIsLoadingLike(true);
    const newLikedState = await toggleLikeSong(song.id);
    setIsLikedState(newLikedState);
    setIsLoadingLike(false);
  };
  
  if (variant === "compact") {
    return (
      <div 
        className={cn(
          "flex items-center p-2 hover:bg-gray-800/50 rounded-md group cursor-pointer",
          className
        )}
        onClick={handlePlay}
      >
        <div className="relative w-10 h-10 rounded overflow-hidden mr-3">
          <img 
            src={song.imageUrl} 
            alt={song.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="h-4 w-4" />
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-sm truncate">{song.title}</h3>
          <p className="text-gray-400 text-xs truncate">{song.artist}</p>
        </div>

        <button 
          className={cn(
            "p-1 rounded-full hover:bg-gray-700/50 transition-all",
            isLikedState ? "text-red-500" : "text-gray-400 opacity-0 group-hover:opacity-100"
          )}
          onClick={handleLike}
          disabled={isLoadingLike}
        >
          <Heart className={cn("h-4 w-4", isLikedState && "fill-current")} />
        </button>

        <ShareSong song={song} className="ml-1 opacity-0 group-hover:opacity-100" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="ml-2 p-1 text-gray-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
            <DropdownMenuItem 
              className="text-sm cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                addToQueue(song);
              }}
            >
              Add to Queue
            </DropdownMenuItem>
            {playlists.map((playlist) => (
              <DropdownMenuItem 
                key={playlist.id} 
                className="text-sm cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to playlist implementation
                }}
              >
                Add to {playlist.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  if (variant === "fullview") {
    return (
      <div 
        className={cn(
          "flex flex-col w-full aspect-square group transition-all duration-200 hover:bg-gray-800/30 p-2 rounded-md cursor-pointer relative",
          className
        )}
        onClick={handlePlay}
      >
        <div 
          className="relative w-full aspect-square overflow-hidden rounded-md shadow-lg mb-2"
        >
          <img 
            src={song.imageUrl} 
            alt={song.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-10 h-10 rounded-full bg-music-accent flex items-center justify-center">
              <Play className="h-5 w-5 text-black" />
            </div>
          </div>
        </div>
        <div className="mt-1">
          <h3 className="font-medium text-xs truncate">{song.title}</h3>
          <p className="text-gray-400 text-xs truncate mt-0.5">{song.artist}</p>
        </div>
      </div>
    );
  }

  if (variant === "search") {
    return (
      <div 
        className={cn(
          "flex flex-col w-full aspect-square group transition-all duration-200 hover:bg-gray-800/30 p-2 rounded-md cursor-pointer relative",
          className
        )}
        onClick={handlePlay}
      >
        <div 
          className="relative w-full aspect-square overflow-hidden rounded-md shadow-lg mb-2"
        >
          <img 
            src={song.imageUrl} 
            alt={song.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-10 h-10 rounded-full bg-music-accent flex items-center justify-center">
              <Play className="h-5 w-5 text-black" />
            </div>
          </div>
        </div>
        <div className="mt-1">
          <h3 className="font-medium text-xs truncate">{song.title}</h3>
          <p className="text-gray-400 text-xs truncate mt-0.5">{song.artist}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "flex flex-col w-full aspect-square group transition-all duration-200 hover:bg-gray-800/50 p-3 rounded-md cursor-pointer relative",
        className
      )}
      onClick={handlePlay}
    >
      <div 
        className="relative w-full aspect-square overflow-hidden rounded-md shadow-lg mb-2"
      >
        <img 
          src={song.imageUrl} 
          alt={song.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-music-accent flex items-center justify-center">
            <Play className="h-6 w-6 text-black" />
          </div>
        </div>

        <button 
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all",
            isLikedState ? "text-red-500" : "text-white opacity-0 group-hover:opacity-100"
          )}
          onClick={handleLike}
          disabled={isLoadingLike}
        >
          <Heart className={cn("h-4 w-4", isLikedState && "fill-current")} />
        </button>

        <ShareSong 
          song={song} 
          className="absolute top-2 left-2 p-2 rounded-full bg-black/50 hover:bg-black/70 opacity-0 group-hover:opacity-100" 
        />

        {/* Quick Add to Playlist - Bottom right corner */}
        <QuickAddToPlaylist 
          song={song}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="mt-1 flex items-start justify-between">
        <div className="flex-1 min-w-0" onClick={handleNavigateToDetail}>
          <h3 className="font-medium text-sm truncate hover:text-primary hover:underline cursor-pointer">{song.title}</h3>
          <p className="text-gray-400 text-xs truncate hover:text-primary hover:underline cursor-pointer">{song.artist}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="ml-1 p-1 text-gray-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-700/50 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
            <DropdownMenuItem 
              className="text-sm cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                addToQueue(song);
              }}
            >
              Add to Queue
            </DropdownMenuItem>
            {playlists.map((playlist) => (
              <DropdownMenuItem 
                key={playlist.id} 
                className="text-sm cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Add to {playlist.title}
              </DropdownMenuItem>  
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SongCard;
