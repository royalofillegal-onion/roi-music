
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { SongUrlGenerator } from '@/utils/songUrlGenerator';
import { Song } from '@/data/songs';
import SharedSongLoading from '@/components/SharedSongLoading';
import SharedSongError from '@/components/SharedSongError';
import SharedSongPlayer from '@/components/SharedSongPlayer';

const SharedSong = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract hash code from URL parameters
  const hashCode = params.hashCode || params.songId;

  const loadSharedSong = async () => {
    if (!hashCode) {
      setError('Invalid share link - no song identifier found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔎 Loading shared song with hash:', hashCode);
      
      const foundSong = await SongUrlGenerator.getSongFromHash(hashCode);
      
      if (!foundSong) {
        setError('Song not found. The shared link may be invalid or expired.');
        setIsLoading(false);
        return;
      }

      console.log('✅ Successfully loaded shared song:', foundSong.title);
      setSong(foundSong);
      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 Error loading shared song:', error);
      setError('Failed to load the shared song. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSharedSong();
  }, [hashCode]);

  const handleRetry = () => {
    loadSharedSong();
  };

  const handleExploreMusic = () => {
    navigate('/');
  };

  if (!hashCode) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <SharedSongLoading hashCode={hashCode} />;
  }

  if (error || !song) {
    return (
      <SharedSongError 
        error={error || 'Song not found'}
        hashCode={hashCode}
        onRetry={handleRetry}
        onExploreMusic={handleExploreMusic}
      />
    );
  }

  return (
    <SharedSongPlayer 
      song={song} 
      onExploreMusic={handleExploreMusic}
    />
  );
};

export default SharedSong;
