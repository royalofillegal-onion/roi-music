
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'sonner';
import { Loader2, Music, Play, Heart, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShareSong from '@/components/ShareSong';
import { SongUrlGenerator } from '@/utils/songUrlGenerator';
import { Song } from '@/data/songs';

const SharedSong = () => {
  const { hashCode } = useParams<{ hashCode?: string }>();
  const { playSong, currentSong, isPlaying, toggleLikeSong, isLiked } = usePlayer();
  const navigate = useNavigate();
  const [isLikedState, setIsLikedState] = useState(false);
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 SharedSong component mounted');
    console.log('🔑 Hash code from URL:', hashCode);
    console.log('🌐 Current URL:', window.location.href);
    
    const loadSharedSong = async () => {
      if (!hashCode) {
        console.error('❌ No hash code found in URL parameters');
        setError('Invalid share link - no song identifier found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔎 Attempting to load song with identifier:', hashCode);
        
        // Try to get song from hash code
        const foundSong = await SongUrlGenerator.getSongFromHash(hashCode);
        
        if (!foundSong) {
          console.error('❌ Song not found for identifier:', hashCode);
          setError(`Song not found. The shared link may be invalid.`);
          setIsLoading(false);
          return;
        }

        console.log('✅ Successfully found song:', foundSong.title, 'by', foundSong.artist);
        setSong(foundSong);
        setIsLoading(false);
        
        // Update page metadata
        document.title = `${foundSong.title} by ${foundSong.artist} - RoyalStar Music`;
        
        // Increment click count for analytics
        try {
          await SongUrlGenerator.incrementClickCount(hashCode);
        } catch (clickError) {
          console.log('Could not track click:', clickError);
        }
        
        // Auto-play the song after a short delay
        setTimeout(() => {
          console.log('🎵 Auto-playing shared song:', foundSong.title);
          playSong(foundSong);
          toast.success(`Now playing: ${foundSong.title}`, {
            description: `By ${foundSong.artist} - Shared song started`
          });
        }, 1000);

      } catch (error) {
        console.error('💥 Error loading shared song:', error);
        setError('Failed to load the shared song. Please try again.');
        setIsLoading(false);
      }
    };

    loadSharedSong();
  }, [hashCode, playSong]);

  useEffect(() => {
    if (song) {
      // Update liked state
      setIsLikedState(isLiked(song.id));
    }
  }, [song, isLiked]);

  const handleLike = async () => {
    if (song) {
      const newLikedState = await toggleLikeSong(song.id);
      setIsLikedState(newLikedState);
    }
  };

  const handlePlaySong = () => {
    if (song) {
      console.log('🎵 Manual play button clicked for:', song.title);
      playSong(song);
    }
  };

  const handleExploreMusic = () => {
    navigate('/');
  };

  const handleCopyCurrentUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    toast.success('Share link copied to clipboard!');
  };

  if (!hashCode) {
    console.error('❌ No hashCode found in URL - redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-green-400 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Loading Shared Song...</h1>
          <p className="text-gray-400 mb-2">Finding your music...</p>
          <div className="bg-gray-800/50 rounded-lg p-3 mt-4">
            <p className="text-gray-500 text-xs">Song Hash: {hashCode}</p>
            <p className="text-gray-500 text-xs">Platform: {window.location.host}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Song Not Found</h1>
          <p className="text-gray-400 mb-4">
            {error || "The shared song could not be found."}
          </p>
          
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <p className="text-gray-500 text-sm mb-2">Debug Info:</p>
            <p className="text-gray-500 text-xs">Hash: {hashCode}</p>
            <p className="text-gray-500 text-xs">URL: {window.location.href}</p>
            <p className="text-gray-500 text-xs">Platform: {window.location.host}</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleExploreMusic}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
            >
              <Music className="h-4 w-4 mr-2" />
              Explore Music
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white px-6 py-3 rounded-lg w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md w-full">
        {/* Song Image and Playing Indicator */}
        <div className="mb-6">
          <div className="relative">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-64 h-64 rounded-lg mx-auto mb-4 shadow-2xl"
              onError={(e) => {
                console.log('Image failed to load, using fallback');
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-white">{song.title}</h1>
          <p className="text-gray-400 text-xl mb-2">{song.artist}</p>
          <p className="text-gray-500 text-sm">{song.album}</p>
        </div>
        
        {/* Playing Status */}
        <div className="flex items-center justify-center space-x-2 text-green-400 mb-6">
          <Play className="h-5 w-5" />
          <span>
            {isCurrentlyPlaying ? 'Now Playing' : 'Ready to Play'}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-8">
          🎵 This song was shared with you on RoyalStar Music
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Button
            onClick={handlePlaySong}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>{isCurrentlyPlaying ? 'Playing' : 'Play Now'}</span>
          </Button>
          
          <Button
            onClick={handleLike}
            variant="outline"
            className={`border-gray-600 px-4 py-3 rounded-lg transition-colors ${
              isLikedState ? 'text-red-500 border-red-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLikedState ? 'fill-current' : ''}`} />
          </Button>

          <ShareSong song={song} className="border-gray-600 px-4 py-3 rounded-lg" />
        </div>

        {/* Share URL Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
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
              onClick={handleCopyCurrentUrl}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Copy
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              ✅ Works on all platforms
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <ExternalLink className="h-3 w-3 mr-1" />
              {window.location.host}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleExploreMusic}
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white px-6 py-3 rounded-lg transition-colors w-full"
        >
          <Music className="h-4 w-4 mr-2" />
          Explore More Music
        </Button>
      </div>
    </div>
  );
};

export default SharedSong;
