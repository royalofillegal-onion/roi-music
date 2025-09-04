import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Heart, Plus, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Song } from '@/data/songs';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotifyLikeInteractiveSectionProps {
  title: string;
  songs: Song[];
  description?: string;
  gradient?: string;
  onViewAll?: () => void;
  className?: string;
}

const SpotifyLikeInteractiveSection = ({
  title,
  songs,
  description,
  gradient = 'from-purple-500/20 to-blue-500/20',
  onViewAll,
  className
}: SpotifyLikeInteractiveSectionProps) => {
  const { playSong, currentSong, isPlaying, addToQueue, toggleLikeSong, isLiked } = usePlayer();
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displaySongs = isExpanded ? songs.slice(0, 8) : songs.slice(0, 4);

  const handlePlay = (song: Song, index: number) => {
    playSong(song);
  };

  const handleLike = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLikeSong(song.id);
  };

  const handleAddToQueue = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br rounded-2xl p-6 border border-border/30 backdrop-blur-sm",
        gradient,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-background/50 hover:bg-background/70"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
          
          {onViewAll && (
            <Button
              variant="default"
              size="sm"
              onClick={onViewAll}
              className="bg-accent hover:bg-accent/90"
            >
              View All
            </Button>
          )}
        </div>
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        <AnimatePresence>
          {displaySongs.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            const isCurrentPlaying = isCurrentSong && isPlaying;
            const isHovered = hoveredSong === song.id;

            return (
              <motion.div
                key={song.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300",
                  isCurrentSong 
                    ? "bg-accent/20 border border-accent/30" 
                    : "hover:bg-background/30 border border-transparent hover:border-border/50"
                )}
                onMouseEnter={() => setHoveredSong(song.id)}
                onMouseLeave={() => setHoveredSong(null)}
                onClick={() => handlePlay(song, index)}
              >
                {/* Track Number / Play Indicator */}
                <div className="w-8 flex items-center justify-center">
                  {isCurrentPlaying ? (
                    <div className="flex items-center gap-1">
                      <motion.div 
                        className="w-1 h-3 bg-accent rounded-full"
                        animate={{ scaleY: [1, 1.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div 
                        className="w-1 h-2 bg-accent rounded-full"
                        animate={{ scaleY: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                      />
                      <motion.div 
                        className="w-1 h-4 bg-accent rounded-full"
                        animate={{ scaleY: [1, 1.8, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <span className={cn(
                        "text-sm font-medium transition-opacity",
                        isHovered ? "opacity-0" : "opacity-70"
                      )}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Play className={cn(
                        "w-4 h-4 text-accent absolute inset-0 transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0"
                      )} />
                    </div>
                  )}
                </div>

                {/* Album Art */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent/10 flex-shrink-0">
                  <img 
                    src={song.imageUrl} 
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm truncate transition-colors",
                    isCurrentSong ? "text-accent" : "text-foreground group-hover:text-accent"
                  )}>
                    {song.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>

                {/* Duration */}
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
                </div>

                {/* Action Buttons */}
                <div className={cn(
                  "flex items-center gap-1 transition-opacity",
                  isHovered || isCurrentSong ? "opacity-100" : "opacity-0"
                )}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleLike(song, e)}
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-accent/20",
                      isLiked(song.id) ? "text-red-500" : "text-muted-foreground"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isLiked(song.id) && "fill-current")} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleAddToQueue(song, e)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-accent hover:bg-accent/20"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Section Stats */}
      <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <span>{songs.length} songs • Updated hourly</span>
        <span>Curated for you</span>
      </div>
    </motion.div>
  );
};

export default SpotifyLikeInteractiveSection;