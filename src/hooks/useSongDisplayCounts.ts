
import { useState, useEffect } from 'react';

interface SongDisplayCounts {
  trending: number;
  popular: number;
  newReleases: number;
  playlists: number;
}

const defaultCounts: SongDisplayCounts = {
  trending: 6,
  popular: 6,
  newReleases: 6,
  playlists: 4
};

export const useSongDisplayCounts = () => {
  const [counts, setCounts] = useState<SongDisplayCounts>(defaultCounts);

  useEffect(() => {
    // Load saved settings
    const loadCounts = () => {
      const saved = localStorage.getItem('royalstar_song_display_counts');
      if (saved) {
        try {
          const parsedCounts = JSON.parse(saved);
          setCounts(parsedCounts);
        } catch (error) {
          console.error('Error loading song display counts:', error);
          setCounts(defaultCounts);
        }
      }
    };

    loadCounts();

    // Listen for updates from admin panel
    const handleUpdate = (event: CustomEvent) => {
      setCounts(event.detail);
    };

    window.addEventListener('songDisplayCountsUpdated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('songDisplayCountsUpdated', handleUpdate as EventListener);
    };
  }, []);

  return counts;
};
