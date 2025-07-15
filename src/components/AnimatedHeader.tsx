
import React from 'react';
import { cn } from '@/lib/utils';

const AnimatedHeader = () => {
  return (
    <div className="relative overflow-hidden">
      <h1 className={cn(
        "text-3xl font-bold mb-6 mt-2 animate-slide-in",
        "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500",
        "bg-clip-text text-transparent bg-size-200 animate-rainbow-slide",
        "glitch-text relative"
      )}>
        Welcome to RoyalStar Music{" "}
        <span className="text-music-accent animate-pulse">Pro Advanced Edition</span>
      </h1>
      
      {/* Glitch effect layers */}
      <div className="absolute inset-0 pointer-events-none">
        <h1 className={cn(
          "text-3xl font-bold mb-6 mt-2",
          "text-red-500 opacity-30 animate-glitch-1"
        )}>
          Welcome to RoyalStar Music{" "}
          <span className="text-music-accent">Pro Advanced Edition</span>
        </h1>
        <h1 className={cn(
          "text-3xl font-bold mb-6 mt-2",
          "text-blue-500 opacity-30 animate-glitch-2"
        )}>
          Welcome to RoyalStar Music{" "}
          <span className="text-music-accent">Pro Advanced Edition</span>
        </h1>
      </div>
    </div>
  );
};

export default AnimatedHeader;
