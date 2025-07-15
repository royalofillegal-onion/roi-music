
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
  const [appRedirectAttempted, setAppRedirectAttempted] = useState(false);

  // Extract hash code from URL parameters
  const hashCode = params.hashCode || params.songId;

  // Check if app is available and redirect
  const attemptAppRedirect = () => {
    if (appRedirectAttempted) return;
    setAppRedirectAttempted(true);

    // Custom URL scheme for the app
    const appUrl = `roimusic://share/${hashCode}`;
    
    // Try to open the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = appUrl;
    document.body.appendChild(iframe);
    
    // Fallback timer - if app doesn't open, continue with web version
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);

    // For Android Chrome, we can use intent URLs
    if (navigator.userAgent.includes('Android')) {
      const intentUrl = `intent://share/${hashCode}#Intent;scheme=roimusic;package=com.roimusic.app;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
      window.location.href = intentUrl;
    }
  };

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
    // First attempt app redirect
    attemptAppRedirect();
    
    // Then load the song for web fallback
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
