
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { trendingSongs } from '@/data/trendingSongs';
import { useIsMobile } from '@/hooks/use-mobile';
import { getDailyRotatedSongs, getTimeBasedGreeting } from '@/utils/dailyRotation';

const SpotifyLikeSection = () => {
  const { playSong } = usePlayer();
  const isMobile = useIsMobile();

  // Use daily rotated songs for quick picks
  const quickPicks = getDailyRotatedSongs(4);
  const trending = trendingSongs;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Greeting and Quick Picks */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">{getTimeBasedGreeting()}</h2>
        {isMobile ? (
          // Mobile: Small square grid layout
          <div className="grid grid-cols-2 gap-2">
            {quickPicks.map((song, index) => (
              <Card
                key={`quickpick-${song.id}-${index}`}
                className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer group"
                onClick={() => playSong(song)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center space-x-2 p-2">
                    <div className="relative">
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate text-xs">{song.title}</h3>
                      <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop: Original layout
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {quickPicks.map((song, index) => (
              <Card
                key={`quickpick-desktop-${song.id}-${index}`}
                className="bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer group"
                onClick={() => playSong(song)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4">
                    <div className="relative">
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-md object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <Play className="h-4 w-4 md:h-6 md:w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate text-sm md:text-base">{song.title}</h3>
                      <p className="text-gray-400 text-xs md:text-sm truncate">{song.artist}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trending - Mobile: Single row scroll, Desktop: Grid */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
          <h3 className="text-lg md:text-xl font-semibold">Trending Now</h3>
        </div>
        {isMobile ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((song, index) => (
              <Card
                key={`trending-mobile-${song.id}-${index}`}
                className="bg-gray-800/30 hover:bg-gray-700/50 transition-all cursor-pointer group min-w-[140px] w-[140px]"
                onClick={() => playSong(song)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="relative">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full aspect-square rounded-md object-cover"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-1 right-1 rounded-full bg-green-500 hover:bg-green-600 text-black opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <div className="absolute top-1 left-1">
                      <div className="bg-green-500 text-black text-xs px-1.5 py-0.5 rounded-full font-medium">
                        #{trending.indexOf(song) + 1}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-xs truncate">{song.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trending.map((song, index) => (
              <Card
                key={`trending-desktop-${song.id}-${index}`}
                className="bg-gray-800/30 hover:bg-gray-700/50 transition-all cursor-pointer group"
                onClick={() => playSong(song)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="relative">
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-full aspect-square rounded-md object-cover"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 rounded-full bg-green-500 hover:bg-green-600 text-black opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                        #{trending.indexOf(song) + 1}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm truncate">{song.title}</h4>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyLikeSection;
