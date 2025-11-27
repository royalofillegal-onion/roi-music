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
    <div className={cn("relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl", className)}>
      {/* Background with current song image */}
      <div className="absolute inset-0">
        <img
          src={currentSong.imageUrl}
          alt={currentSong.title}
          className="w-full h-full object-cover scale-110 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse-fire" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-8 md:p-12 min-h-[320px] sm:min-h-[360px] md:min-h-[420px] flex flex-col justify-end">
        <div className="space-y-3 md:space-y-4 max-w-3xl">
          {/* Greeting */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 animate-fade-in">
            <TrendingUp className="h-4 w-4 animate-bounce" />
            <span className="font-medium">{getTimeBasedGreeting()}</span>
          </div>

          {/* Song info */}
          <div className="space-y-2 animate-slide-up">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
              {currentSong.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-semibold">
              by {currentSong.artist}
            </p>
            <p className="text-xs sm:text-sm text-white/70 flex items-center gap-2 flex-wrap">
              {currentSong.album && (
                <span className="bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                  {currentSong.album}
                </span>
              )}
              <span className="bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">
                {currentSong.year}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3 pt-3 md:pt-4 animate-scale-in">
            <Button
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-accent to-accent-glow hover:from-accent/90 hover:to-accent text-black font-bold gap-2 rounded-full shadow-fire hover:shadow-bloody transition-all hover:scale-105"
              onClick={() => playSong(currentSong)}
            >
              <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />
              <span className="text-sm md:text-base">Play Now</span>
            </Button>

            <Button
              size={isMobile ? "default" : "lg"}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-md gap-2 rounded-full font-semibold hover:scale-105 transition-all"
              onClick={shuffleAllSongs}
            >
              <Shuffle className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base hidden sm:inline">Shuffle All</span>
              <span className="text-sm md:text-base sm:hidden">Shuffle</span>
            </Button>

            <Button
              size={isMobile ? "default" : "lg"}
              variant="ghost"
              className="text-white hover:bg-white/20 hover:text-primary-glow rounded-full hover:scale-110 transition-all"
              onClick={playTrending}
            >
              <Heart className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>

          {/* Song indicators */}
          <div className="flex gap-2 pt-3 md:pt-4">
            {heroSongs.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-1.5 md:h-2 rounded-full transition-all duration-500",
                  index === currentHeroSong
                    ? "w-8 md:w-10 bg-gradient-to-r from-primary to-accent shadow-crimson"
                    : "w-1.5 md:w-2 bg-white/30 hover:bg-white/60 hover:w-4"
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