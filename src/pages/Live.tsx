import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { 
  Plus, 
  Loader2, 
  Calendar, 
  Clock, 
  Maximize,
  Minimize,
  Send,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlayer } from "@/context/PlayerContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLiveAdmin } from "@/context/LiveAdminContext";
import UserProfile from "@/components/UserProfile";

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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [newLive, setNewLive] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    scheduled_at: new Date().toISOString().slice(0, 16),
  });

  const { toast: uiToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { currentSong } = usePlayer();
  const { isAdmin, login } = useLiveAdmin();
  
  // Check if user is logged in and get user profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        setUserId(session.user.id);
        
        // Fetch user profile
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
          
          // Fetch user profile
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

  // Real-time video synchronization with audio enabled
  useEffect(() => {
    if (!currentLive?.id || !videoRef.current) return;

    const video = videoRef.current;
    
    // Calculate the current time based on when the stream started
    const startTime = new Date(currentLive.scheduled_at).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;
    
    // Set video to current time and play with audio
    if (video.duration && elapsedSeconds > 0) {
      const currentTime = elapsedSeconds % video.duration;
      video.currentTime = currentTime;
      video.muted = false; // Enable audio
      video.play().catch(console.error);
    }

    // Sync with other users periodically
    const channel = supabase.channel(`live_sync_${currentLive.id}`)
      .on('broadcast', { event: 'video_sync' }, (payload) => {
        if (payload.current_time !== undefined && video) {
          const timeDiff = Math.abs(video.currentTime - payload.current_time);
          // Only sync if time difference is significant (more than 3 seconds)
          if (timeDiff > 3) {
            video.currentTime = payload.current_time;
          }
        }
      })
      .subscribe();

    // Broadcast current time every 10 seconds to keep all users in sync
    const syncInterval = setInterval(() => {
      if (video && !video.paused) {
        channel.send({
          type: 'broadcast',
          event: 'video_sync',
          current_time: video.currentTime
        });
      }
    }, 10000);

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
      toast.error('Failed to load live stream');
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
            avatar_url: userData?.avatar_url
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
  
  // Add comment
  const addComment = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to comment');
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
      toast.error('Failed to add comment');
    }
  };
  
  // Admin login
  const handleAdminLogin = () => {
    if (login(adminCredentials.username, adminCredentials.password)) {
      setShowAdminLogin(false);
      setUploadOpen(true);
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

  // Submit new live
  const submitNewLive = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }
    
    if (!newLive.title || !newLive.video_url || !newLive.scheduled_at) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const processedUrl = isYouTubeUrl(newLive.video_url) 
        ? convertYouTubeUrl(newLive.video_url) 
        : newLive.video_url;
        
      const { error } = await supabase
        .from('lives')
        .insert({
          user_id: userId || 'admin',
          title: newLive.title,
          description: newLive.description,
          video_url: processedUrl,
          thumbnail_url: newLive.thumbnail_url,
          scheduled_at: new Date(newLive.scheduled_at).toISOString(),
          is_active: true,
        });
        
      if (error) throw error;
      
      toast.success('Live created successfully');
      setUploadOpen(false);
      
      setNewLive({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        scheduled_at: new Date().toISOString().slice(0, 16),
      });
      
      fetchCurrentLive();
    } catch (error) {
      console.error('Error creating live:', error);
      toast.error('Failed to create live');
    }
  };
  
  return (
    <div className={`flex flex-col h-full pt-16 md:pt-0 md:ml-16 md:mb-20 ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header with User Profile */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Live Stream</h1>
        <div className="flex items-center gap-4">
          <UserProfile />
          <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Admin Login Required</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input 
                    id="admin-username"
                    type="text"
                    value={adminCredentials.username}
                    onChange={e => setAdminCredentials({...adminCredentials, username: e.target.value})}
                    placeholder="Enter admin username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input 
                    id="admin-password"
                    type="password"
                    value={adminCredentials.password}
                    onChange={e => setAdminCredentials({...adminCredentials, password: e.target.value})}
                    placeholder="Enter admin password"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAdminLogin}>
                  Login as Admin
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Dialog for upload */}
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start New Live Stream</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={newLive.title}
                  onChange={e => setNewLive({...newLive, title: e.target.value})}
                  placeholder="Enter live title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={newLive.description}
                  onChange={e => setNewLive({...newLive, description: e.target.value})}
                  placeholder="Enter live description"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="video_url">Video URL * (YouTube or direct video)</Label>
                <Input 
                  id="video_url"
                  value={newLive.video_url}
                  onChange={e => setNewLive({...newLive, video_url: e.target.value})}
                  placeholder="Enter YouTube URL or direct video URL"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="scheduled_at">Start Time *</Label>
                <Input 
                  id="scheduled_at"
                  type="datetime-local"
                  value={newLive.scheduled_at}
                  onChange={e => setNewLive({...newLive, scheduled_at: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={submitNewLive}
                disabled={!newLive.title || !newLive.video_url || !newLive.scheduled_at}
              >
                Start Live Stream
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
        </div>
      ) : !currentLive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-xl font-medium mb-2">No live stream active</h2>
          <p className="text-gray-400 mb-4">Start the first 24-hour live stream!</p>
          <Button 
            variant="default" 
            onClick={() => setShowAdminLogin(true)}
          >
            Admin Access Required
          </Button>
        </div>
      ) : (
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1 ${isFullScreen ? 'h-screen' : ''}`}>
          {/* Video Player Section */}
          <div className={`${isMobile ? 'w-full' : 'flex-1'} bg-black`}>
            <div className="relative bg-black overflow-hidden">
              {isYouTubeUrl(currentLive.video_url) ? (
                <div className={`relative ${isMobile ? 'pt-[56.25%]' : 'min-h-[300px] md:min-h-[450px]'}`}>
                  <iframe
                    src={currentLive.video_url}
                    className={`${isMobile ? 'absolute inset-0 w-full h-full' : 'w-full h-full'}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={`relative ${isMobile ? 'pt-[56.25%]' : 'min-h-[300px] md:min-h-[450px]'}`}>
                  <video
                    ref={videoRef}
                    src={currentLive.video_url}
                    className={`${isMobile ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-full object-contain'}`}
                    controls={true}
                    autoPlay
                    loop
                    poster={currentLive.thumbnail_url || undefined}
                  />
                </div>
              )}
              
              {/* Video Controls Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge variant="destructive" className="bg-red-600">
                  LIVE
                </Badge>
                {!isMobile && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleFullScreen}
                    className="bg-black bg-opacity-50 hover:bg-opacity-70"
                  >
                    {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Live Info */}
            <div className="p-4 bg-gray-900 border-b border-gray-800">
              <h3 className="font-bold text-xl mb-2">{currentLive.title}</h3>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentLive.avatar_url || 'https://via.placeholder.com/40'} 
                    alt={currentLive.user_name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{currentLive.user_name}</p>
                    <p className="text-sm text-gray-400">
                      Started {format(new Date(currentLive.scheduled_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{viewerCount} watching</span>
                </div>
              </div>
              
              {currentLive.description && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-300">{currentLive.description}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Section - Improved mobile layout */}
          <div className={`${isFullScreen ? 'hidden' : ''} ${isMobile ? 'w-full h-[50vh] flex flex-col' : 'w-80 flex flex-col'} bg-gray-900 border-l border-gray-800`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-800 flex-shrink-0">
              <h3 className="font-bold">Live Chat</h3>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>{viewerCount}</span>
              </div>
            </div>
            
            {/* Comments - Fixed mobile height */}
            <ScrollArea 
              ref={commentsRef} 
              className="flex-1 p-3"
            >
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-400">No messages yet</p>
                  <p className="text-gray-500 text-sm mt-1">Be the first to say something!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <img 
                        src={comment.avatar_url || 'https://via.placeholder.com/24'} 
                        alt={comment.user_name}
                        className="h-6 w-6 rounded-full flex-shrink-0 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-sm text-music-accent">
                            {comment.user_name}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {format(new Date(comment.created_at), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm break-words">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {/* Comment Input - Fixed at bottom */}
            <div className={`p-3 border-t border-gray-800 flex-shrink-0 ${isMobile ? 'sticky bottom-0 bg-gray-900' : ''}`}>
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder={isLoggedIn ? `Say something as ${userName}...` : "Sign in to chat"}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addComment()}
                  disabled={!isLoggedIn}
                  maxLength={500}
                />
                <Button 
                  size="icon"
                  disabled={!newComment.trim() || !isLoggedIn}
                  onClick={addComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!isLoggedIn && (
                <p className="text-xs text-gray-500 mt-2">Sign in to participate in live chat</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Live;
