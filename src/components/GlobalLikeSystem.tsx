
import React, { useState, useEffect } from 'react';
import { Heart, Users, TrendingUp, Clock } from 'lucide-react';
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
  showOwnerInsights?: boolean;
}

const GlobalLikeSystem = ({ song, showLikers = false, variant = 'compact', showOwnerInsights = false }: GlobalLikeSystemProps) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likers, setLikers] = useState<LikeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [recentLikes, setRecentLikes] = useState<LikeData[]>([]);

  useEffect(() => {
    checkAuthAndLoadData();
    setupRealtime();
  }, [song.id]);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
    
    if (session?.user) {
      // Check if user is owner/admin
      const { data: roleData } = await supabase
        .rpc('is_admin', { user_id: session.user.id });
      setIsOwner(roleData || false);
      
      await checkIfUserLiked(session.user.id);
    }
    
    await loadLikeData();
  };

  const loadLikeData = async () => {
    try {
      // Get like count
      const { data: countData, error: countError } = await supabase
        .rpc('get_song_like_count', { song_id_param: song.id });
      
      if (countError) throw countError;
      setLikeCount(countData || 0);

      // Get likers data
      const { data: likersData, error: likersError } = await supabase
        .rpc('get_song_likers', { song_id_param: song.id });
      
      if (likersError) throw likersError;
      setLikers(likersData || []);
      
      // Set recent likes (last 5)
      setRecentLikes((likersData || []).slice(0, 5));
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
        (payload) => {
          loadLikeData();
          
          // Show real-time like notifications for owners
          if (isOwner && payload.eventType === 'INSERT') {
            toast.success(`${payload.new.username || 'Someone'} liked this song!`);
          }
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
        // Like with animation
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
        setLikeAnimation(true);
        setTimeout(() => setLikeAnimation(false), 600);
        toast.success('Song liked! ❤️');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setLoading(false);
    }
  };

  const getLikeEngagementRate = () => {
    if (likeCount === 0) return '0%';
    // Simple engagement calculation based on recent activity
    const recentLikesCount = recentLikes.length;
    const rate = Math.min((recentLikesCount / Math.max(likeCount, 1)) * 100, 100);
    return `${rate.toFixed(1)}%`;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLike}
          disabled={loading}
          className={`transition-all duration-300 ${
            isLiked 
              ? 'text-red-500 hover:text-red-600 scale-110' 
              : 'text-gray-400 hover:text-red-500'
          } ${likeAnimation ? 'animate-bounce' : ''}`}
        >
          <Heart 
            className={`h-4 w-4 transition-all duration-300 ${
              isLiked ? 'fill-current' : ''
            } ${likeAnimation ? 'scale-125' : ''}`} 
          />
        </Button>
        
        {/* Only show count to owners/admins */}
        {(isOwner || showOwnerInsights) && likeCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {likeCount}
          </Badge>
        )}
        
        {/* Show recent activity indicator for non-owners */}
        {!isOwner && likeCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Loved</span>
          </div>
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
            <h3 className="font-semibold text-white">Song Engagement</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleLike}
              disabled={loading}
              className={`transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-600 hover:bg-red-700 scale-105' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } ${likeAnimation ? 'animate-pulse' : ''}`}
            >
              <Heart 
                className={`h-4 w-4 mr-2 transition-all duration-300 ${
                  isLiked ? 'fill-current' : ''
                } ${likeAnimation ? 'scale-110' : ''}`} 
              />
              {isLiked ? 'Loved' : 'Love it'}
            </Button>
            
            {(isOwner || showOwnerInsights) && (
              <Badge className="bg-blue-600">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </Badge>
            )}
          </div>
        </div>

        {/* Owner insights */}
        {(isOwner || showOwnerInsights) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Engagement Rate</span>
              </div>
              <span className="text-lg font-bold text-green-400">{getLikeEngagementRate()}</span>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-gray-300">Recent Activity</span>
              </div>
              <span className="text-lg font-bold text-orange-400">{recentLikes.length}</span>
            </div>
          </div>
        )}

        {/* Show activity for regular users without counts */}
        {!isOwner && likeCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">This song is loved by the community</span>
            </div>
          </div>
        )}

        {/* Likers list (only for owners or when explicitly requested) */}
        {showLikers && (isOwner || showOwnerInsights) && likers.length > 0 && (
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

        {/* Anonymous engagement indicator for regular users */}
        {!isOwner && !showOwnerInsights && likers.length > 0 && (
          <div className="mt-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(likers.length, 5))].map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-gray-800 flex items-center justify-center"
                >
                  <Heart className="h-3 w-3 text-white fill-current" />
                </div>
              ))}
              {likers.length > 5 && (
                <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                  <span className="text-xs text-white">+</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Music lovers are enjoying this track</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalLikeSystem;
