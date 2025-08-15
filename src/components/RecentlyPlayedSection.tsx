
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';

const RecentlyPlayedSection = () => {
  const { recentlyPlayed, playSong } = usePlayer();
  const isMobile = useIsMobile();

  if (recentlyPlayed.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-gray-400" />
        <h3 className="text-xl font-semibold">Recently Played</h3>
      </div>
      
      {isMobile ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recentlyPlayed.slice(0, 6).map((song) => (
            <Card
              key={song.id}
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
          {recentlyPlayed.slice(0, 6).map((song) => (
            <Card
              key={song.id}
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
  );
};

export default RecentlyPlayedSection;
