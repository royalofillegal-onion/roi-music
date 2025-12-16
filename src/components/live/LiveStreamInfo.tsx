import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface LiveStreamInfoProps {
  title: string;
  description?: string;
  userInfo: {
    name: string;
    avatar_url?: string;
  };
  scheduledAt: string;
  stats: {
    likesCount: number;
    commentsCount: number;
    viewerCount: number;
  };
  currentSong?: {
    title: string;
    artist: string;
  };
  isMobile?: boolean;
}

const LiveStreamInfo: React.FC<LiveStreamInfoProps> = ({
  title,
  description,
  userInfo,
  scheduledAt,
  stats,
  currentSong,
  isMobile = false
}) => {
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl animate-fade-in">
      <div className="p-6">
        {/* Title */}
        <h1 className={`font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent ${
          isMobile ? 'text-xl' : 'text-2xl'
        }`}>
          {title}
        </h1>

        {/* User Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={userInfo.avatar_url || '/roi-assets/default-avatar.png'}
                alt={userInfo.name}
                className={`rounded-full border-2 border-music-accent/50 ${
                  isMobile ? 'h-10 w-10' : 'h-12 w-12'
                }`}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <p className={`font-semibold text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                {userInfo.name}
              </p>
              <div className="flex items-center space-x-1 text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Started {format(new Date(scheduledAt), "MMM d, h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-600/30">
            <p className="text-gray-200">{description}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-red-500/20 rounded-full px-3 py-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-400">{stats.likesCount}</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-500/20 rounded-full px-3 py-1">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-400">{stats.commentsCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/20 rounded-full px-3 py-1">
            <Users className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">{stats.viewerCount}</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Now Playing */}
        {currentSong && (
          <div className="bg-gradient-to-r from-music-accent/20 to-purple-500/20 rounded-xl p-4 border border-music-accent/30">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-music-accent rounded-full animate-pulse"></div>
              <div>
                <p className="text-music-accent font-semibold text-sm">Now Playing</p>
                <p className="text-white font-medium">{currentSong.title}</p>
                <p className="text-gray-400 text-sm">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LiveStreamInfo;