import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Shuffle, Heart, TrendingUp } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { trendingSongs, popularSongs, uniqueSongs } from "@/data/allSongs";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTimeBasedGreeting } from "@/utils/dailyRotation";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

const HeroSection = ({ className }: HeroSectionProps) => {
  const { playSong } = usePlayer();
  const isMobile = useIsMobile();
  const [currentHeroSong, setCurrentHeroSong] = useState(0);

  // Rotate hero songs every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSong((prev) => (prev + 1) % Math.min(trendingSongs.length, 3));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const shuffleAllSongs = () => {
    const randomSong = uniqueSongs[Math.floor(Math.random() * uniqueSongs.length)];
    playSong(randomSong);
  };

  const playTrending = () => {
    if (trendingSongs.length > 0) {
      playSong(trendingSongs[0]);
    }
  };

  const heroSongs = trendingSongs.slice(0, 3);
  const currentSong = heroSongs[currentHeroSong];

  if (!currentSong) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl", className)}>
      {/* Background with current song image */}
      <div className="absolute inset-0">
        <img
          src={currentSong.imageUrl}
          alt={currentSong.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-12 min-h-[300px] md:min-h-[400px] flex flex-col justify-end">
        <div className="space-y-4 max-w-2xl">
          {/* Greeting */}
          <div className="flex items-center gap-2 text-sm text-white/70">
            <TrendingUp className="h-4 w-4" />
            <span>{getTimeBasedGreeting()}</span>
          </div>

          {/* Song info */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {currentSong.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              by {currentSong.artist}
            </p>
            <p className="text-sm text-white/60">
              {currentSong.album && `From "${currentSong.album}"`} • {currentSong.year}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              size={isMobile ? "default" : "lg"}
              className="bg-accent hover:bg-accent/90 text-black font-semibold gap-2 rounded-full shadow-xl"
              onClick={() => playSong(currentSong)}
            >
              <Play className="h-4 w-4 fill-current" />
              Play Now
            </Button>

            <Button
              size={isMobile ? "default" : "lg"}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm gap-2 rounded-full"
              onClick={shuffleAllSongs}
            >
              <Shuffle className="h-4 w-4" />
              Shuffle All
            </Button>

            <Button
              size={isMobile ? "sm" : "lg"}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={playTrending}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Song indicators */}
          <div className="flex gap-2 pt-2">
            {heroSongs.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === currentHeroSong
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                )}
                onClick={() => setCurrentHeroSong(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;