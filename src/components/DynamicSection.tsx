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
  layout?: "grid" | "horizontal" | "list";
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
        return isMobile ? "min-w-[400px] w-[400px]" : "min-w-[300px] w-[300px]";
      case "medium":
        return isMobile ? "min-w-[420px] w-[420px]" : "min-w-[220px] w-[220px]";
      case "large":
        return isMobile ? "min-w-[450px] w-[450px]" : "min-w-[280px] w-[280px]";
      default:
        return isMobile ? "min-w-[420px] w-[420px]" : "min-w-[220px] w-[220px]";
    }
  };

  return (
    <section className={cn("space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8", className)}>
      {/* Section Header */}
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
          "flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide",
          "snap-x snap-mandatory"
        )}>
          {songs.slice(0, 20).map((song, index) => (
            <ModernSongCard
              key={`${song.id}-${index}`}
              song={song}
              size={cardSize}
              className={cn(
                getHorizontalItemWidth(),
                "snap-start flex-shrink-0"
              )}
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