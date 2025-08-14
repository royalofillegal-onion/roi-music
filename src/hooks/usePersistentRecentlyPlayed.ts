import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song } from '@/data/songs';

export const usePersistentRecentlyPlayed = () => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentlyPlayed();
  }, []);

  const loadRecentlyPlayed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Load from localStorage for non-authenticated users
        const saved = localStorage.getItem('recentlyPlayed');
        if (saved) {
          setRecentlyPlayed(JSON.parse(saved));
        }
        setLoading(false);
        return;
      }

      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from('recent_plays')
        .select('song_id, played_at')
        .eq('user_id', session.user.id)
        .order('played_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading recent plays:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('recentlyPlayed');
        if (saved) {
          setRecentlyPlayed(JSON.parse(saved));
        }
      } else if (data) {
        // Note: In a real app, you'd need to fetch the actual song data
        // For now, we'll use localStorage as the primary source and sync to Supabase
        const saved = localStorage.getItem('recentlyPlayed');
        if (saved) {
          setRecentlyPlayed(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error('Error in loadRecentlyPlayed:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('recentlyPlayed');
      if (saved) {
        setRecentlyPlayed(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const addToRecentlyPlayed = async (song: Song) => {
    try {
      // Update local state
      const updated = [song, ...recentlyPlayed.filter(s => s.id !== song.id)].slice(0, 10);
      setRecentlyPlayed(updated);
      
      // Save to localStorage immediately
      localStorage.setItem('recentlyPlayed', JSON.stringify(updated));

      // Save to Supabase if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('recent_plays')
          .upsert({
            user_id: session.user.id,
            song_id: song.id,
            played_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,song_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error saving to recent_plays:', error);
          // Continue with localStorage version
        }
      }
    } catch (error) {
      console.error('Error adding to recently played:', error);
    }
  };

  const clearRecentlyPlayed = async () => {
    try {
      setRecentlyPlayed([]);
      localStorage.removeItem('recentlyPlayed');

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('recent_plays')
          .delete()
          .eq('user_id', session.user.id);
      }
    } catch (error) {
      console.error('Error clearing recently played:', error);
    }
  };

  return {
    recentlyPlayed,
    loading,
    addToRecentlyPlayed,
    clearRecentlyPlayed,
    loadRecentlyPlayed
  };
};