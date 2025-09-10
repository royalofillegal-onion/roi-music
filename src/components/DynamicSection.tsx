import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/data/songs";
import ModernSongCard from "./ModernSongCard";
import PlaylistCard from "./PlaylistCard";
import { playlists } from "@/data/playlists";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlayer } from "@/context/PlayerContext";
import { cn } from "@/lib/utils";

interface DynamicSectionProps {
  title: string;
  songs: Song[];
  className?: string;
  onViewAll?: () => void;
  cardSize?: "small" | "medium" | "large";
  showRankings?: boolean;
  layout?: "grid" | "horizontal" | "list";
  isPlaylistSection?: boolean;
  onSongPlay?: (song: Song) => void;
}

const DynamicSection = ({ 
  title, 
  songs, 
  className, 
  onViewAll, 
  cardSize = "medium",
  showRankings = false,
  layout = "horizontal",
  isPlaylistSection = false,
  onSongPlay
}: DynamicSectionProps) => {
  const isMobile = useIsMobile();
  const { playSong } = usePlayer();

  const handlePlay = (song: Song) => {
    if (onSongPlay) {
      onSongPlay(song);
    } else {
      playSong(song);
    }
  };

  // Handle playlist section
  if (isPlaylistSection) {
    const featuredPlaylists = playlists.slice(0, 6);
    
    return (
      <section className={cn("space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-responsive-xl md:text-responsive-2xl font-bold text-white hover:underline cursor-pointer">
            {title}
          </h2>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-muted-foreground hover:text-white gap-1 p-2 flex-shrink-0"
            >
              <span className="text-responsive-sm font-medium">Show all</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
        </div>
        <div className={cn(
          "flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide",
          "snap-x snap-mandatory"
        )}>
          {featuredPlaylists.map((playlist) => (
            <div key={playlist.id} className="snap-start flex-shrink-0">
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!songs?.length) return null;

  const getGridCols = () => {
    switch (cardSize) {
      case "small":
        return "grid-cols-1";
      case "medium":
        return "grid-responsive-cards";
      case "large":
        return isMobile ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-responsive-cards";
    }
  };

  const getHorizontalItemWidth = () => {
    switch (cardSize) {
      case "small":
        return isMobile ? "min-w-[160px] w-[160px]" : "min-w-[140px] w-[140px]";
      case "medium":
        return isMobile ? "min-w-[180px] w-[180px]" : "min-w-[160px] w-[160px]";
      case "large":
        return isMobile ? "min-w-[200px] w-[200px]" : "min-w-[180px] w-[180px]";
      default:
        return isMobile ? "min-w-[180px] w-[180px]" : "min-w-[160px] w-[160px]";
    }
  };

  return (
    <section className={cn("space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-responsive-xl md:text-responsive-2xl font-bold bg-gradient-fire bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
          {title}
        </h2>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-muted-foreground hover:text-primary-glow gap-1 p-2 flex-shrink-0 hover:bg-primary/10 border border-transparent hover:border-primary/20"
          >
            <span className="text-responsive-sm font-medium">Show all</span>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      {layout === "list" ? (
        <div className="space-y-1">
          {songs.slice(0, 10).map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all group hover:bg-primary/5 border border-transparent hover:border-primary/20 hover:shadow-crimson"
              onClick={() => handlePlay(song)}
            >
              {/* Ranking number */}
              {showRankings && (
                <div className="w-8 text-right">
                  <span className="text-lg font-bold text-primary-glow group-hover:text-accent transition-colors">
                    {index + 1}
                  </span>
                </div>
              )}
              
              {/* Album artwork */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0 border border-primary/20">
                <img 
                  src={song.imageUrl} 
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Song info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground group-hover:text-primary-glow transition-colors truncate">
                  {song.title}
                </h4>
                <p className="text-muted-foreground text-sm truncate group-hover:text-accent/70 transition-colors">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : layout === "grid" ? (
        <div className={cn("grid gap-3 sm:gap-4 lg:gap-6", getGridCols())}>
          {songs.slice(0, isMobile ? 6 : 16).map((song, index) => (
            <ModernSongCard
              key={`${song.id}-${index}`}
              song={song}
              size={cardSize}
              showIndex={showRankings}
              index={showRankings ? index + 1 : undefined}
            />
          ))}
        </div>
      ) : (
        <div className={cn(
          "flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide",
          "snap-x snap-mandatory"
        )}>
          {songs.slice(0, 20).map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className={cn(
                getHorizontalItemWidth(),
                "snap-start flex-shrink-0 group cursor-pointer"
              )}
              onClick={() => handlePlay(song)}
            >
              <div className="relative overflow-hidden rounded-lg aspect-square bg-accent/10 hover:bg-accent/20 transition-all duration-300 group-hover:scale-105">
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-2 text-center px-1">
                <h3 className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                  {song.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DynamicSection;