
import React, { useState, useEffect } from 'react';
import { Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Song } from '@/data/songs';

interface LikeData {
  user_id: string;
  username: string;
  created_at: string;
}

interface GlobalLikeSystemProps {
  song: Song;
  showLikers?: boolean;
  variant?: 'compact' | 'full';
}

const GlobalLikeSystem = ({ song, showLikers = false, variant = 'compact' }: GlobalLikeSystemProps) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likers, setLikers] = useState<LikeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadData();
    setupRealtime();
  }, [song.id]);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
    
    await loadLikeData();
    if (session?.user) {
      await checkIfUserLiked(session.user.id);
    }
  };

  const loadLikeData = async () => {
    try {
      // Get like count
      const { data: countData, error: countError } = await supabase
        .rpc('get_song_like_count', { song_id_param: song.id });
      
      if (countError) throw countError;
      setLikeCount(countData || 0);

      // Get likers if needed
      if (showLikers) {
        const { data: likersData, error: likersError } = await supabase
          .rpc('get_song_likers', { song_id_param: song.id });
        
        if (likersError) throw likersError;
        setLikers(likersData || []);
      }
    } catch (error) {
      console.error('Error loading like data:', error);
    }
  };

  const checkIfUserLiked = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('global_likes')
        .select('id')
        .eq('song_id', song.id)
        .eq('user_id', userId)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // User hasn't liked this song
      setIsLiked(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel(`song-likes-${song.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_likes',
          filter: `song_id=eq.${song.id}`
        },
        () => {
          loadLikeData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      toast.error('Please sign in to like songs');
      return;
    }

    setLoading(true);
    
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('global_likes')
          .delete()
          .eq('song_id', song.id)
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        toast.success('Song unliked');
      } else {
        // Like
        const { error } = await supabase
          .from('global_likes')
          .insert({
            song_id: song.id,
            user_id: currentUser.id,
            username: currentUser.user_metadata?.name || 'Music Lover'
          });
        
        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        toast.success('Song liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLike}
          disabled={loading}
          className={`transition-colors ${
            isLiked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        
        {likeCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {likeCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white">Global Likes</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleLike}
              disabled={loading}
              className={`${
                isLiked 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Unlike' : 'Like'}
            </Button>
            
            <Badge className="bg-blue-600">
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </Badge>
          </div>
        </div>

        {showLikers && likers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Likes:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {likers.slice(0, 5).map((liker, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{liker.username}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(liker.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
            {likers.length > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                +{likers.length - 5} more users liked this song
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalLikeSystem;
