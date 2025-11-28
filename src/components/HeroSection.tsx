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
    <div className={cn("relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl", className)}>
      {/* Background with current song image */}
      <div className="absolute inset-0">
        <img
          src={currentSong.imageUrl}
          alt={currentSong.title}
          className="w-full h-full object-cover scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-7 md:p-10 lg:p-12 min-h-[360px] sm:min-h-[400px] md:min-h-[440px] flex flex-col justify-end">
        <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-3xl">
          {/* Greeting */}
          <div className="flex items-center gap-2 text-sm sm:text-base text-white/90 animate-fade-in">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-bounce" />
            <span className="font-semibold">{getTimeBasedGreeting()}</span>
          </div>

          {/* Song info */}
          <div className="space-y-2 sm:space-y-3 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
              {currentSong.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 font-bold">
              by {currentSong.artist}
            </p>
            <p className="text-sm sm:text-base text-white/80 flex items-center gap-2 sm:gap-3 flex-wrap">
              {currentSong.album && (
                <span className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-md font-medium">
                  {currentSong.album}
                </span>
              )}
              <span className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-md font-medium">
                {currentSong.year}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 sm:pt-5 animate-scale-in">
            <Button
              size={isMobile ? "lg" : "lg"}
              className="bg-primary hover:bg-primary/90 text-black font-bold gap-2 sm:gap-3 rounded-full shadow-spotify hover:scale-105 transition-all touch-target px-6 sm:px-8"
              onClick={() => playSong(currentSong)}
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
              <span className="text-base sm:text-lg font-bold">Play Now</span>
            </Button>

            <Button
              size={isMobile ? "lg" : "lg"}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-md gap-2 sm:gap-3 rounded-full font-bold hover:scale-105 transition-all touch-target px-5 sm:px-7"
              onClick={shuffleAllSongs}
            >
              <Shuffle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-base sm:text-lg font-bold hidden sm:inline">Shuffle All</span>
              <span className="text-base font-bold sm:hidden">Shuffle</span>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 hover:text-primary rounded-full hover:scale-110 transition-all touch-target h-11 w-11 sm:h-12 sm:w-12"
              onClick={playTrending}
            >
              <Heart className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>
          </div>

          {/* Song indicators */}
          <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-5">
            {heroSongs.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 sm:h-2.5 rounded-full transition-all duration-500",
                  index === currentHeroSong
                    ? "w-10 sm:w-12 bg-primary shadow-spotify"
                    : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70 hover:w-5"
                )}
                onClick={() => setCurrentHeroSong(index)}
                aria-label={`Go to song ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;