
import React, { useState, useEffect } from 'react';
import { Play, Heart, Share2, Music, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareSong from '@/components/ShareSong';
import { usePlayer } from '@/context/PlayerContext';
import { Song } from '@/data/songs';
import { toast } from 'sonner';

interface SharedSongPlayerProps {
  song: Song;
  onExploreMusic: () => void;
}

const SharedSongPlayer = ({ song, onExploreMusic }: SharedSongPlayerProps) => {
  const { playSong, currentSong, isPlaying, toggleLikeSong, isLiked } = usePlayer();
  const [isLikedState, setIsLikedState] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  useEffect(() => {
    setIsLikedState(isLiked(song.id));
  }, [song.id, isLiked]);

  useEffect(() => {
    // Auto-play the song when component mounts
    if (!hasAutoPlayed) {
      console.log('🎵 Auto-playing shared song:', song.title);
      playSong(song);
      setHasAutoPlayed(true);
      toast.success(`Now playing: ${song.title}`, {
        description: `By ${song.artist} - Auto-started from shared link`
      });
    }
  }, [song, playSong, hasAutoPlayed]);

  useEffect(() => {
    // Update page metadata
    document.title = `${song.title} by ${song.artist} - RoyalStar Music`;
    
    // Update meta tags for social sharing
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMetaTag('og:title', `${song.title} - ${song.artist}`);
    updateMetaTag('og:description', `Listen to ${song.title} by ${song.artist} on RoyalStar Music`);
    updateMetaTag('og:image', song.imageUrl);
    updateMetaTag('og:url', window.location.href);
  }, [song]);

  const handleLike = async () => {
    const newLikedState = await toggleLikeSong(song.id);
    setIsLikedState(newLikedState);
  };

  const handlePlaySong = () => {
    console.log('🎵 Manual play button clicked for:', song.title);
    playSong(song);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Share link copied to clipboard!');
  };

  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md w-full">
        {/* Song Image */}
        <div className="mb-6">
          <div className="relative">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-64 h-64 rounded-lg mx-auto mb-4 shadow-2xl object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-white">{song.title}</h1>
          <p className="text-gray-400 text-xl mb-2">{song.artist}</p>
          {song.album && <p className="text-gray-500 text-sm">{song.album}</p>}
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-center space-x-2 text-green-400 mb-6">
          <Play className="h-5 w-5" />
          <span>
            {isCurrentlyPlaying ? 'Now Playing' : 'Ready to Play'}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-8">
          🎵 This song was shared with you and started automatically
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Button
            onClick={handlePlaySong}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>{isCurrentlyPlaying ? 'Playing' : 'Play'}</span>
          </Button>
          
          <Button
            onClick={handleLike}
            variant="outline"
            className={`border-gray-600 px-4 py-3 rounded-lg ${
              isLikedState ? 'text-red-500 border-red-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLikedState ? 'fill-current' : ''}`} />
          </Button>

          <ShareSong song={song} className="border-gray-600 px-4 py-3 rounded-lg" />
        </div>

        {/* Share URL */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share This Song
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={window.location.href}
              readOnly
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-gray-300"
            />
            <Button
              onClick={handleCopyUrl}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Copy
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">✅ Auto-plays when shared</p>
            <div className="flex items-center text-xs text-gray-500">
              <ExternalLink className="h-3 w-3 mr-1" />
              {window.location.host}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onExploreMusic}
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white px-6 py-3 rounded-lg w-full"
        >
          <Music className="h-4 w-4 mr-2" />
          Explore More Music
        </Button>
      </div>
    </div>
  );
};

export default SharedSongPlayer;
