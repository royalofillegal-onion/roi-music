import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'sonner';
import { Loader2, Music, Play, Heart, Share2, Globe, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ShareSong from '@/components/ShareSong';
import { SongUrlGenerator } from '@/utils/songUrlGenerator';
import { Song } from '@/data/songs';

const SharedSong = () => {
  const { hashCode } = useParams<{ hashCode?: string }>();
  const { playSong, currentSong, isPlaying, toggleLikeSong, isLiked } = usePlayer();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLikedState, setIsLikedState] = useState(false);
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformInfo, setPlatformInfo] = useState<any>(null);

  useEffect(() => {
    // Add debugging for URL handling
    console.log('Current location:', location);
    console.log('Hash code from params:', hashCode);
    console.log('Full URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    const loadSharedSong = async () => {
      if (!hashCode) {
        console.error('No hash code provided in URL');
        console.log('Available params:', useParams());
        setError('No song identifier provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get platform information
        const platform = SongUrlGenerator.getPlatformInfo();
        setPlatformInfo(platform);
        
        console.log('Loading shared song with hash/ID:', hashCode);
        console.log('Platform info:', platform);
        console.log('Current URL:', window.location.href);
        
        // Try to get song from hash code or direct ID
        const foundSong = await SongUrlGenerator.getSongFromHash(hashCode);
        
        if (!foundSong) {
          console.error('Song not found for hash/ID:', hashCode);
          setError(`Song not found for identifier: ${hashCode}`);
          setIsLoading(false);
          return;
        }

        console.log('Successfully found song:', foundSong.title, 'by', foundSong.artist);
        setSong(foundSong);
        
        // Try to increment click count (only works if it's a hash, not direct ID)
        try {
          await SongUrlGenerator.incrementClickCount(hashCode);
          console.log('Click count incremented for hash:', hashCode);
        } catch (clickError) {
          console.log('Could not increment click count (probably direct ID):', clickError);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shared song:', error);
        setError('Failed to load song');
        setIsLoading(false);
      }
    };

    loadSharedSong();
  }, [hashCode, location]);

  useEffect(() => {
    if (song && !isLoading && !error) {
      // Update page metadata for better sharing
      document.title = `${song.title} by ${song.artist} - RoyalStar Music`;
      
      // Auto-play the song after a short delay
      const timer = setTimeout(() => {
        console.log('Auto-playing song:', song.title);
        setIsAutoPlaying(true);
        playSong(song);
        toast.success(`Now playing: ${song.title} by ${song.artist}`);
      }, 1000);

      // Update liked state
      setIsLikedState(isLiked(song.id));

      return () => clearTimeout(timer);
    }
  }, [song, isLoading, error, playSong, isLiked]);

  const handleLike = async () => {
    if (song) {
      const newLikedState = await toggleLikeSong(song.id);
      setIsLikedState(newLikedState);
    }
  };

  const handleExploreMusic = () => {
    navigate('/');
  };

  const handleCopyCurrentUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    toast.success('Current page URL copied to clipboard!');
    console.log('Copied URL:', currentUrl);
  };

  const handleTestUrl = () => {
    // Test function to verify URL structure
    const testUrls = [
      'https://royalstar-music.netlify.app/share/' + hashCode,
      'https://royalstar-music.vercel.app/share/' + hashCode,
      'https://royalstar-music.lovableproject.com/share/' + hashCode
    ];
    
    console.log('Test URLs for this song:');
    testUrls.forEach(url => console.log(url));
    
    toast.success('Check console for test URLs on different platforms');
  };

  if (!hashCode) {
    console.error('No hashCode parameter in URL');
    console.log('Current pathname:', window.location.pathname);
    console.log('URL search params:', window.location.search);
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-green-400 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Loading Song...</h1>
          <p className="text-gray-400">Please wait while we load your shared song.</p>
          <p className="text-gray-500 text-sm mt-2">Looking for: {hashCode}</p>
          {platformInfo && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Loading from {platformInfo.platform}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Song Not Found</h1>
          <p className="text-gray-400 mb-2">The shared song could not be found.</p>
          <p className="text-gray-500 text-sm mb-6">
            Identifier: {hashCode}
            <br />
            {error && `Error: ${error}`}
            {platformInfo && (
              <span className="block mt-2">
                Platform: {platformInfo.platform} | Host: {platformInfo.hostname}
              </span>
            )}
          </p>
          <Button 
            onClick={handleExploreMusic}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Explore Music
          </Button>
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md w-full">
        {/* Platform Info Banner */}
        {platformInfo && (
          <div className="mb-6 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">
                Shared from {platformInfo.platform}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {platformInfo.hostname}
              </Badge>
              {platformInfo.isSecure && (
                <Badge className="bg-green-600 text-xs">
                  Secure
                </Badge>
              )}
              <Button
                onClick={handleTestUrl}
                size="sm"
                variant="outline"
                className="text-xs border-gray-600"
              >
                Test URLs
              </Button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <img
              src={song.imageUrl}
              alt={song.title}
              className="w-64 h-64 rounded-lg mx-auto mb-4 shadow-2xl"
            />
            {isCurrentlyPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-white">{song.title}</h1>
          <p className="text-gray-400 text-xl mb-2">{song.artist}</p>
          <p className="text-gray-500 text-sm">{song.album}</p>
        </div>
        
        {isAutoPlaying ? (
          <div className="flex items-center justify-center space-x-2 text-green-400 mb-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Starting playback...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-blue-400 mb-6">
            <Play className="h-5 w-5" />
            <span>Ready to play</span>
          </div>
        )}
        
        <p className="text-gray-400 text-sm mb-8">
          This song was shared with you on RoyalStar Music. {isAutoPlaying ? 'It will start playing automatically.' : 'Click play to enjoy!'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Button
            onClick={() => playSong(song)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>Play Now</span>
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

        {/* Enhanced URL Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Universal Song URL
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            This link works on any platform: Vercel, Netlify, Lovable, GitHub Pages, and more!
          </p>
          <div className="space-y-2">
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
            <div className="text-xs text-gray-500">
              <strong>Hash Code:</strong> {hashCode}
            </div>
            <div className="text-xs text-gray-500">
              <strong>Platform:</strong> {platformInfo?.platform || 'Unknown'}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <ExternalLink className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">
              Works across all deployment platforms
            </span>
          </div>
        </div>
        
        <Button 
          onClick={handleExploreMusic}
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white px-6 py-3 rounded-lg transition-colors"
        >
          Explore More Music
        </Button>
      </div>
    </div>
  );
};

export default SharedSong;
