import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/data/songs";
import ModernSongCard from "./ModernSongCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DynamicSectionProps {
  title: string;
  songs: Song[];
  className?: string;
  onViewAll?: () => void;
  cardSize?: "small" | "medium" | "large";
  showRankings?: boolean;
  layout?: "grid" | "horizontal" | "list" | "three-row";
}

const DynamicSection = ({ 
  title, 
  songs, 
  className, 
  onViewAll, 
  cardSize = "medium",
  showRankings = false,
  layout = "horizontal"
}: DynamicSectionProps) => {
  const isMobile = useIsMobile();

  if (!songs?.length) return null;

  const getGridCols = () => {
    switch (cardSize) {
      case "small":
        return "grid-cols-1";
      case "medium":
        return isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
      case "large":
        return isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-2 lg:grid-cols-4";
    }
  };

  const getHorizontalItemWidth = () => {
    switch (cardSize) {
      case "small":
        return "min-w-[300px] w-[300px]";
      case "medium":
        return "min-w-[180px] w-[180px]";
      case "large":
        return "min-w-[220px] w-[220px]";
      default:
        return "min-w-[180px] w-[180px]";
    }
  };

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">
          {title}
        </h2>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-muted-foreground hover:text-white gap-1 p-2"
          >
            <span className="text-sm font-medium">Show all</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      {layout === "list" ? (
        <div className="space-y-1">
          {songs.slice(0, 5).map((song, index) => (
            <ModernSongCard
              key={`${song.id}-${index}`}
              song={song}
              size="small"
              showIndex={showRankings}
              index={showRankings ? index + 1 : undefined}
              className="hover:bg-white/5"
            />
          ))}
        </div>
      ) : layout === "grid" ? (
        <div className={cn("grid gap-4", getGridCols())}>
          {songs.slice(0, isMobile ? 4 : 12).map((song, index) => (
            <ModernSongCard
              key={`${song.id}-${index}`}
              song={song}
              size={cardSize}
              showIndex={showRankings}
              index={showRankings ? index + 1 : undefined}
            />
          ))}
        </div>
      ) : layout === "three-row" ? (
        <div className="space-y-4">
          {/* First row with exactly 3 songs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.slice(0, 3).map((song, index) => (
              <ModernSongCard
                key={`${song.id}-${index}`}
                song={song}
                size={cardSize}
                showIndex={showRankings}
                index={showRankings ? index + 1 : undefined}
              />
            ))}
          </div>

          {/* Remaining songs in horizontal scroll */}
          {songs.length > 3 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {songs.slice(3).map((song, index) => (
                <ModernSongCard
                  key={`${song.id}-${index + 3}`}
                  song={song}
                  size={cardSize}
                  className={getHorizontalItemWidth()}
                  showIndex={showRankings}
                  index={showRankings ? index + 4 : undefined}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {songs.slice(0, 15).map((song, index) => (
            <ModernSongCard
              key={`${song.id}-${index}`}
              song={song}
              size={cardSize}
              className={getHorizontalItemWidth()}
              showIndex={showRankings}
              index={showRankings ? index + 1 : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default DynamicSection;