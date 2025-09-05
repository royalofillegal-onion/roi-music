import React, { useState } from "react";
import { Play, Heart, MoreHorizontal, Plus, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Song } from "@/data/songs";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useGuestPlaylist } from "@/hooks/useGuestPlaylist";
import QuickAddToPlaylist from "@/components/QuickAddToPlaylist";
import ShareButton from "@/components/ShareButton";

interface ModernSongCardProps {
  song: Song;
  className?: string;
  size?: "small" | "medium" | "large";
  showIndex?: boolean;
  index?: number;
}

const ModernSongCard = ({ 
  song, 
  className, 
  size = "medium", 
  showIndex = false, 
  index 
}: ModernSongCardProps) => {
  const { playSong, addToQueue, toggleLikeSong, isLiked } = usePlayer();
  const [isLikedState, setIsLikedState] = useState(() => isLiked(song.id));
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToGuestPlaylist } = useGuestPlaylist();

  const handlePlay = () => {
    playSong(song);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      addToGuestPlaylist(song);
      return;
    }

    setIsLoadingLike(true);
    const newLikedState = await toggleLikeSong(song.id);
    setIsLikedState(newLikedState);
    setIsLoadingLike(false);
  };

  const sizeClasses = {
    small: {
      card: "group cursor-pointer transition-all duration-300 hover:bg-white/5 rounded-lg p-3",
      image: "w-16 h-16",
      playButton: "w-8 h-8",
      playIcon: "w-3 h-3",
      title: "text-sm font-medium",
      artist: "text-xs text-muted-foreground"
    },
    medium: {
      card: "group cursor-pointer transition-all duration-300 hover:bg-white/5 rounded-xl p-4",
      image: "w-full aspect-square",
      playButton: "w-12 h-12",
      playIcon: "w-4 h-4",
      title: "text-sm md:text-base font-semibold",
      artist: "text-xs md:text-sm text-muted-foreground"
    },
    large: {
      card: "group cursor-pointer transition-all duration-300 hover:bg-white/5 rounded-2xl p-6",
      image: "w-full aspect-square",
      playButton: "w-14 h-14",
      playIcon: "w-5 h-5",
      title: "text-base md:text-lg font-bold",
      artist: "text-sm md:text-base text-muted-foreground"
    }
  };

  const currentSize = sizeClasses[size];

  if (size === "small") {
    return (
      <div 
        className={cn(currentSize.card, className)}
        onClick={handlePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3">
          {showIndex && (
            <div className="w-4 text-center">
              <span className={cn(
                "text-muted-foreground text-sm transition-opacity",
                isHovered && "opacity-0"
              )}>
                {index}
              </span>
              <Play className={cn(
                "w-4 h-4 text-white transition-opacity absolute",
                !isHovered && "opacity-0"
              )} />
            </div>
          )}
          
          <div className={cn("relative rounded-lg overflow-hidden", currentSize.image)}>
            <img 
              src={song.imageUrl} 
              alt={song.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(currentSize.title, "truncate text-white")}>{song.title}</h3>
            <p className={cn(currentSize.artist, "truncate")}>{song.artist}</p>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShareButton song={song} />
            <QuickAddToPlaylist song={song} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900/95 backdrop-blur-md border-gray-700">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(song);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Queue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(currentSize.card, className)}
      onClick={handlePlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-4">
        <div className="relative group/image">
          <div className={cn("rounded-lg overflow-hidden shadow-2xl", currentSize.image)}>
            <img 
              src={song.imageUrl} 
              alt={song.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-center justify-center">
            <Button
              size="sm"
              className={cn(
                "rounded-full bg-accent hover:bg-accent/90 text-black shadow-xl transform transition-all duration-200",
                currentSize.playButton,
                "translate-y-2 group-hover:translate-y-0 scale-90 group-hover:scale-100"
              )}
            >
              <Play className={cn(currentSize.playIcon, "fill-current")} />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-1">
              <ShareButton song={song} />
              <QuickAddToPlaylist song={song} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900/95 backdrop-blur-md border-gray-700">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Queue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="space-y-1 px-1">
          <h3 className={cn(currentSize.title, "truncate text-white leading-tight")}>{song.title}</h3>
          <p className={cn(currentSize.artist, "truncate leading-tight")}>{song.artist}</p>
        </div>
      </div>
    </div>
  );
};

export default ModernSongCard;