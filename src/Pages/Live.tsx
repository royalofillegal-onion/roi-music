import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Maximize,
  Minimize,
  Send,
  Users,
  MessageSquare,
  X,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Settings,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlayer } from "@/context/PlayerContext";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { enableContinuousPlayback } from "@/services/androidNotification";
import { continuousPlaylistService, PlaylistSong } from "@/services/ContinuousPlaylistService";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


interface Live {
  id: string;
  user_id: string;
  user_name?: string;
  avatar_url?: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  scheduled_at: string;
  ends_at?: string;
  is_active: boolean;
  views: number;
  likes_count: number;
  comments_count: number;
  liked_by_user: boolean;
  created_at: string;
  current_time?: number;
}

interface Comment {
  id: string;
  live_id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  content: string;
  created_at: string;
}

const Live = () => {
  const [currentLive, setCurrentLive] = useState<Live | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Guest User');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [currentPlaylistSong, setCurrentPlaylistSong] = useState<PlaylistSong | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoVolume, setVideoVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [qualityOptions, setQualityOptions] = useState(['Auto', '720p', '480p', '360p']);
  const [selectedQuality, setSelectedQuality] = useState('Auto');

  
  const { setIsLiveMode } = usePlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Enable continuous playback and hide player when on live page
  useEffect(() => {
    enableContinuousPlayback();
    setIsLiveMode(true);
    
    return () => {
      setIsLiveMode(false);
    };
  }, [setIsLiveMode]);
  
  // Check if user is logged in and get user profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        setUserId(session.user.id);
        
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          setUserName(profile.name || 'Music Lover');
        }
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
        if (session) {
          setUserId(session.user.id);
          
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('user_id', session.user.id)
            .single();
          
          if (profile) {
            setUserName(profile.name || 'Music Lover');
          }
        } else {
          setUserId(null);
          setUserName('Guest User');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Fetch current 24-hour live stream
  useEffect(() => {
    fetchCurrentLive();
  }, [userId]);

  // Subscribe to new comments for current live
  useEffect(() => {
    if (!currentLive?.id) return;

    const subscription = supabase
      .channel('public:live_comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_comments',
        filter: `live_id=eq.${currentLive.id}`
      }, payload => {
        fetchComments(currentLive.id);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'live_comments',
        filter: `live_id=eq.${currentLive.id}`
      }, payload => {
        fetchComments(currentLive.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentLive?.id]);

  // Enhanced real-time video synchronization for live streaming
  useEffect(() => {
    if (!currentLive?.id || !videoRef.current) return;

    const video = videoRef.current;
    
    // Calculate real-time position based on stream start time
    const startTime = new Date(currentLive.scheduled_at).getTime();
    
    const syncToRealTime = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;
      
      // For live streams, sync to real-time position
      if (video.duration && elapsedSeconds > 0) {
        const currentTime = elapsedSeconds % video.duration;
        const timeDiff = Math.abs(video.currentTime - currentTime);
        
        // Sync if difference is more than 2 seconds
        if (timeDiff > 2) {
          video.currentTime = currentTime;
          console.log(`Syncing to real-time position: ${currentTime.toFixed(2)}s`);
        }
      }
      
      // Ensure video is playing and unmuted
      if (video.paused) {
        video.muted = false;
        video.play().catch(console.error);
      }
    };

    // Initial sync
    syncToRealTime();

    // Real-time broadcast channel for user synchronization
    const channel = supabase.channel(`live_sync_${currentLive.id}`)
      .on('broadcast', { event: 'time_sync' }, (payload) => {
        if (payload.server_time && video) {
          const serverTime = new Date(payload.server_time).getTime();
          const elapsedSeconds = (serverTime - startTime) / 1000;
          
          if (video.duration && elapsedSeconds > 0) {
            const syncTime = elapsedSeconds % video.duration;
            const timeDiff = Math.abs(video.currentTime - syncTime);
            
            // Only sync if significantly out of sync
            if (timeDiff > 3) {
              video.currentTime = syncTime;
              console.log(`Server sync: ${syncTime.toFixed(2)}s`);
            }
          }
        }
      })
      .subscribe();

    // Broadcast server time every 5 seconds for synchronization
    const syncInterval = setInterval(() => {
      if (video && !video.paused) {
        channel.send({
          type: 'broadcast',
          event: 'time_sync',
          server_time: new Date().toISOString()
        });
      }
      
      // Also sync to real-time every 5 seconds
      syncToRealTime();
    }, 5000);

    return () => {
      clearInterval(syncInterval);
      supabase.removeChannel(channel);
    };
  }, [currentLive?.id]);

  // Auto-delete comments older than 24 hours
  useEffect(() => {
    const deleteOldComments = async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      try {
        await supabase
          .from('live_comments')
          .delete()
          .lt('created_at', twentyFourHoursAgo);
      } catch (error) {
        console.error('Error deleting old comments:', error);
      }
    };

    const interval = setInterval(deleteOldComments, 60 * 60 * 1000);
    deleteOldComments();
    
    return () => clearInterval(interval);
  }, []);

  // Real-time viewer count tracking
  useEffect(() => {
    if (!currentLive?.id) return;

    const channel = supabase.channel(`live_${currentLive.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId || 'anonymous',
            user_name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentLive?.id, userId, userName]);
  
  // Convert YouTube URL to embeddable format
  const convertYouTubeUrl = (url: string): string => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`;
    }
    
    return url;
  };
  
  // Check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
  };
  
  // Fetch current active live stream
  const fetchCurrentLive = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { data: liveData, error } = await supabase
        .from('lives')
        .select('*')
        .eq('is_active', true)
        .gte('scheduled_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('scheduled_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (liveData) {
        const { data: userData } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('user_id', liveData.user_id)
          .single();
        
        const { count: likesCount } = await supabase
          .from('live_likes')
          .select('*', { count: 'exact', head: true })
          .eq('live_id', liveData.id);
        
        const { count: commentsCount } = await supabase
          .from('live_comments')
          .select('*', { count: 'exact', head: true })
          .eq('live_id', liveData.id);
        
        let likedByUser = false;
        if (userId) {
          const { data: likeData } = await supabase
            .from('live_likes')
            .select('id')
            .eq('live_id', liveData.id)
            .eq('user_id', userId)
            .single();
          
          likedByUser = !!likeData;
        }
        
        const liveWithDetails = {
          ...liveData,
          user_name: userData?.name || 'Royal of Illegal',
          avatar_url: userData?.avatar_url,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          liked_by_user: likedByUser,
          current_time: 0
        };
        
        setCurrentLive(liveWithDetails);
        fetchComments(liveData.id);
      } else {
        setCurrentLive(null);
      }
    } catch (error) {
      console.error('Error fetching current live:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch comments for the live
  const fetchComments = async (liveId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('live_comments')
        .select('*')
        .eq('live_id', liveId)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      const commentsWithUserDetails = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: userData } = await supabase
            .from('users')
            .select('name, avatar_url')
            .eq('user_id', comment.user_id)
            .single();
          
          return {
            ...comment,
            user_name: userData?.name || 'Unknown User',
            avatar_url: userData?.avatar_url || '/roi-assets/default-avatar.png'
          };
        })
      );
      
      setComments(commentsWithUserDetails);
      
      setTimeout(() => {
        if (commentsRef.current) {
          commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const addComment = async () => {
    if (!isLoggedIn) {
      console.error('Please sign in to comment');
      return;
    }
    
    if (!newComment.trim() || !currentLive?.id) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('live_comments')
        .insert({
          live_id: currentLive.id,
          user_id: userId,
          content: newComment.trim()
        });
      
      if (error) {
        throw error;
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Initialize continuous playlist
  useEffect(() => {
    const initializePlaylist = async () => {
      await continuousPlaylistService.loadDailyPlaylist();
      
      continuousPlaylistService.onSongChange = (song: PlaylistSong) => {
        setCurrentPlaylistSong(song);
        console.log('Now playing:', song.title);
      };

      continuousPlaylistService.start();
    };

    initializePlaylist();

    return () => {
      continuousPlaylistService.stop();
    };
  }, []);

  // Enhanced mobile video sizing
  const getVideoHeight = () => {
    if (isMobile) {
      if (isFullScreen) return 'h-screen';
      // Larger video for mobile - 60% of viewport height
      return 'h-[60vh]';
    }
    return isFullScreen ? 'h-screen' : 'h-[70vh]';
  };

  const toggleLike = async () => {
    if (!isLoggedIn || !currentLive?.id) {
      console.error('Please sign in to like');
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('live_likes')
          .delete()
          .eq('live_id', currentLive.id)
          .eq('user_id', userId);
        setIsLiked(false);
      } else {
        await supabase
          .from('live_likes')
          .insert({
            live_id: currentLive.id,
            user_id: userId
          });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Share functionality
  const shareStream = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentLive?.title || 'Live Stream',
          text: `Watch ${currentLive?.user_name}'s live stream!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Volume control for video
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVideoVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (newMuted) {
        videoRef.current.volume = 0;
        setVideoVolume(0);
      } else {
        videoRef.current.volume = videoVolume || 0.5;
        setVideoVolume(videoVolume || 0.5);
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 ${isFullScreen ? 'fixed inset-0 z-50' : 'pt-16 md:pt-0 md:ml-16'}`}>
      {/* Animated Background Effects */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-music-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center animate-fade-in">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-music-accent mx-auto mb-6" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-music-accent/20 rounded-full mx-auto animate-ping"></div>
            </div>
            <p className="text-gray-300 text-lg font-medium">Connecting to live stream...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-music-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-music-accent rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-music-accent rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      ) : !currentLive ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center relative z-10">
          <div className="max-w-md animate-fade-in">
            <div className="mb-8 relative">
              <div className="w-24 h-24 bg-gradient-to-br from-music-accent to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-black" />
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-music-accent/20 rounded-full mx-auto animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-music-accent to-purple-400 bg-clip-text text-transparent">
              No Live Stream
            </h2>
            <p className="text-gray-400 mb-8 text-lg">There's no active live stream right now. Check back later for live content!</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-music-accent to-music-accent/80 hover:from-music-accent/90 hover:to-music-accent/70 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <span>Refresh</span>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          {/* Enhanced Mobile Header */}
          {isMobile && !isFullScreen && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-gray-700/50 animate-fade-in">
              <div className="flex items-center space-x-3">
                <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500 animate-pulse shadow-lg shadow-red-500/20">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span>LIVE</span>
                  </div>
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-300 bg-white/10 rounded-full px-2 py-1">
                  <Users className="h-4 w-4 text-music-accent" />
                  <span className="font-medium">{viewerCount}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleLike}
                  className={`text-white hover:bg-white/10 rounded-full transition-all duration-300 ${isLiked ? 'text-red-500 bg-red-500/10' : ''}`}
                >
                  <Heart className={`h-4 w-4 transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={shareStream}
                  className="text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowMobileChat(!showMobileChat)}
                  className="text-white hover:bg-white/10 rounded-full transition-all duration-300 relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  {comments.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-music-accent to-purple-500 text-black text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-5 flex items-center justify-center font-bold shadow-lg animate-bounce">
                      {comments.length > 99 ? '99+' : comments.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1`}>
            {/* Enhanced Video Section */}
            <div className={`${isMobile ? 'w-full' : 'flex-1'} relative`}>
              <div className="relative bg-black">
                {isYouTubeUrl(currentLive.video_url) ? (
                  <div className={`w-full ${getVideoHeight()}`}>
                    <iframe
                      src={convertYouTubeUrl(currentLive.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={`w-full ${getVideoHeight()}`}>
                    <video
                      ref={videoRef}
                      src={currentLive.video_url}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      poster={currentLive.thumbnail_url}
                      controls={!isMobile}
                      onVolumeChange={(e) => {
                        const video = e.target as HTMLVideoElement;
                        setVideoVolume(video.volume);
                        setIsMuted(video.muted);
                      }}
                    />
                  </div>
                )}

                {/* Enhanced Mobile Video Controls Overlay */}
                {isMobile && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      
                      {!isMuted && (
                        <div className="w-20 bg-black/60 rounded-full p-2 backdrop-blur-sm border border-white/10">
                          <Slider
                            value={[videoVolume]}
                            max={1}
                            step={0.1}
                            onValueChange={handleVolumeChange}
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-md border-gray-600">
                          {qualityOptions.map((quality) => (
                            <DropdownMenuItem
                              key={quality}
                              onClick={() => setSelectedQuality(quality)}
                              className={`text-white hover:bg-white/10 transition-colors ${selectedQuality === quality ? 'bg-music-accent/20 text-music-accent' : ''}`}
                            >
                              {quality} {selectedQuality === quality && '✓'}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleFullScreen}
                        className="bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110"
                      >
                        {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Desktop Controls - Enhanced */}
                {!isMobile && (
                  <div className="absolute top-4 right-4 flex items-center gap-3 animate-fade-in">
                    <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500 animate-pulse shadow-lg shadow-red-500/30 border border-red-400/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                        <span className="font-bold">LIVE</span>
                      </div>
                    </Badge>
                    <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleLike}
                        className={`text-white hover:bg-white/10 rounded-full transition-all duration-300 ${isLiked ? 'text-red-500 bg-red-500/10' : ''}`}
                      >
                        <Heart className={`h-4 w-4 transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'hover:scale-110'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={shareStream}
                        className="text-white hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleFullScreen}
                        className="bg-music-accent/20 hover:bg-music-accent/30 text-music-accent rounded-full transition-all duration-300 hover:scale-110"
                      >
                        {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Stream Info - Mobile */}
              {isMobile && !isFullScreen && (
                <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700/50 animate-fade-in">
                  <h3 className="font-bold text-xl mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {currentLive.title}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={currentLive.avatar_url || '/roi-assets/default-avatar.png'} 
                          alt={currentLive.user_name}
                          className="h-12 w-12 rounded-full border-2 border-music-accent/50"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{currentLive.user_name}</p>
                        <p className="text-xs text-gray-400">
                          Started {format(new Date(currentLive.scheduled_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-md border-gray-600">
                        <DropdownMenuItem className="text-white hover:bg-white/10">
                          Report Stream
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-white/10">
                          Block User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {currentLive.description && (
                    <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-600/30">
                      <p className="text-sm text-gray-200">{currentLive.description}</p>
                    </div>
                  )}
                  
                  {/* Enhanced Engagement Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">{currentLive.likes_count}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                        <MessageSquare className="h-4 w-4 text-music-accent" />
                        <span className="text-sm font-medium">{comments.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-500/20 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-400">{viewerCount} watching</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stream Info - Desktop */}
              {!isMobile && !isFullScreen && (
                <div className="p-6 bg-gray-900">
                  <h3 className="font-bold text-2xl mb-3">{currentLive.title}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={currentLive.avatar_url || '/roi-assets/default-avatar.png'} 
                        alt={currentLive.user_name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-lg">{currentLive.user_name}</p>
                        <p className="text-gray-400">
                          Started {format(new Date(currentLive.scheduled_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{viewerCount} watching</span>
                    </div>
                  </div>
                  {currentLive.description && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <p className="text-gray-300">{currentLive.description}</p>
                    </div>
                  )}
                  {currentPlaylistSong && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <span>🎵</span>
                        <span className="text-music-accent font-medium">Now Playing:</span>
                        <span className="text-gray-300">{currentPlaylistSong.title}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Chat Section with better mobile experience */}
            <div className={`
              ${isFullScreen ? 'hidden' : ''} 
              ${isMobile ? 
                (showMobileChat ? 
                  'fixed inset-0 z-50 bg-gray-900 flex flex-col' : 
                  'hidden'
                ) : 
                'w-80 flex flex-col border-l border-gray-800'
              } 
              bg-gray-900
            `}>
              {/* Enhanced Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-lg">Live Chat</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{viewerCount}</span>
                  </div>
                </div>
                {isMobile && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowMobileChat(false)}
                    className="text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Enhanced Messages with better styling */}
              <ScrollArea ref={commentsRef} className="flex-1 p-4">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
                    <p className="text-gray-400 mb-2">No messages yet</p>
                    <p className="text-gray-500 text-sm">Be the first to say something!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <img 
                          src={comment.avatar_url || '/roi-assets/default-avatar.png'} 
                          alt={comment.user_name}
                          className="h-8 w-8 rounded-full flex-shrink-0 ring-2 ring-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-medium text-music-accent text-sm">
                              {comment.user_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.created_at), "h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-100 break-words mt-1 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Enhanced Message Input */}
              <div className={`p-4 border-t border-gray-800 ${isMobile ? 'pb-8' : ''}`}>
                <div className="flex space-x-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isLoggedIn ? `Message as ${userName}...` : "Sign in to chat"}
                    disabled={!isLoggedIn}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-music-accent rounded-full px-4 py-2"
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    maxLength={500}
                  />
                  <Button 
                    onClick={addComment}
                    disabled={!newComment.trim() || !isLoggedIn}
                    size="icon"
                    className="bg-music-accent hover:bg-music-accent/80 text-black flex-shrink-0 rounded-full"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!isLoggedIn && (
                  <p className="text-xs text-gray-500 mt-2 text-center">Sign in to participate in live chat</p>
                )}
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {newComment.length}/500
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Live;
