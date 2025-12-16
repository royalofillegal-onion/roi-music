import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Users, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface EnhancedLivePlayerProps {
  isLive: boolean;
  viewerCount: number;
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;
  onShare: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

const EnhancedLivePlayer: React.FC<EnhancedLivePlayerProps> = ({
  isLive,
  viewerCount,
  likesCount,
  isLiked,
  onLike,
  onShare,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute
}) => {
  const [showControls, setShowControls] = useState(true);
  const [mouseActive, setMouseActive] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (mouseActive) {
      setShowControls(true);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [mouseActive]);

  const handleMouseMove = () => {
    setMouseActive(true);
    setTimeout(() => setMouseActive(false), 100);
  };

  return (
    <div 
      className="relative w-full h-full group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Live Status Overlay */}
      <div className={`absolute top-4 left-4 z-20 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {isLive && (
          <Badge className="bg-gradient-to-r from-red-600 to-red-500 text-white border-0 shadow-xl animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <span className="font-bold">LIVE</span>
            </div>
          </Badge>
        )}
      </div>

      {/* Top Right Controls */}
      <div className={`absolute top-4 right-4 z-20 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <Card className="bg-black/60 backdrop-blur-md border-white/10 p-2">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onLike}
              className={`text-white hover:bg-white/10 rounded-full transition-all duration-300 ${
                isLiked ? 'text-red-500 bg-red-500/10' : ''
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform duration-300 ${
                isLiked ? 'fill-current scale-110' : 'hover:scale-110'
              }`} />
              <span className="ml-1 text-xs">{likesCount}</span>
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onShare}
              className="text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-4 left-4 right-4 z-20 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <Card className="bg-black/60 backdrop-blur-md border-white/10 p-3">
          <div className="flex items-center justify-between">
            {/* Volume Controls */}
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleMute}
                className="text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              {!isMuted && (
                <div className="w-24">
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => onVolumeChange(value[0])}
                    className="h-2"
                  />
                </div>
              )}
            </div>

            {/* Viewer Count */}
            <div className="flex items-center space-x-2 bg-green-500/20 rounded-full px-3 py-1">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">{viewerCount}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedLivePlayer;