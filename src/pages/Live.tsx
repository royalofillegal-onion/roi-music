
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { currentSong } = usePlayer();
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
        if (session) {
          setUserId(session.user.id);
        } else {
          setUserId(null);
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

    // Delete old comments every hour
    const interval = setInterval(deleteOldComments, 60 * 60 * 1000);
    
    // Run once on component mount
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
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId || 'anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentLive?.id, userId]);
  
  // Fetch current active live stream
  const fetchCurrentLive = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Get the current active live stream (within 24 hours)
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
        // Get user details for the live
        const { data: userData } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('user_id', liveData.user_id)
          .single();
        
        // Get likes count
        const { count: likesCount } = await supabase
          .from('live_likes')
          .select('*', { count: 'exact', head: true })
          .eq('live_id', liveData.id);
        
        // Get comments count
        const { count: commentsCount } = await supabase
          .from('live_comments')
          .select('*', { count: 'exact', head: true })
          .eq('live_id', liveData.id);
        
        // Check if user has liked this live
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
          user_name: userData?.name || 'Unknown User',
          avatar_url: userData?.avatar_url,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          liked_by_user: likedByUser
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
      
      // Get user details for each comment
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
      
      // Auto-scroll to bottom
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
  
  // Toggle like on the live
  const toggleLike = async () => {
    if (!isLoggedIn || !currentLive) {
      toast.error('Please sign in to like the live stream');
      return;
    }
    
    try {
      if (currentLive.liked_by_user) {
        // Unlike
        const { error } = await supabase
          .from('live_likes')
          .delete()
          .eq('live_id', currentLive.id)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        setCurrentLive({
          ...currentLive,
          likes_count: currentLive.likes_count - 1,
          liked_by_user: false
        });
      } else {
        // Like
        const { error } = await supabase
          .from('live_likes')
          .insert({
            live_id: currentLive.id,
            user_id: userId
          });
        
        if (error) throw error;
        
        setCurrentLive({
          ...currentLive,
          likes_count: currentLive.likes_count + 1,
          liked_by_user: true
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };
  
  // Share live
  const shareLive = () => {
    if (!currentLive) return;
    
    if (navigator.share) {
      navigator.share({
        title: currentLive.title,
        text: currentLive.description || 'Check out this live stream!',
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      toast.info("Share feature coming soon!");
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle video upload for new live
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video size too large (max 100MB)");
      return;
    }
    
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `videos/${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
        
      setNewLive({
        ...newLive,
        video_url: data.publicUrl
      });
      
      toast.success("Video uploaded successfully");
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail size too large (max 5MB)");
      return;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file);
        
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
        
      setNewLive({
        ...newLive,
        thumbnail_url: data.publicUrl
      });
      
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error("Failed to upload thumbnail");
    }
  };
  
  // Submit new live
  const submitNewLive = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to create a live');
      return;
    }
    
    if (!newLive.title || !newLive.video_url || !newLive.scheduled_at) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lives')
        .insert({
          user_id: userId,
          title: newLive.title,
          description: newLive.description,
          video_url: newLive.video_url,
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Live Stream</h1>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              disabled={isUploading || !isLoggedIn}
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            </Button>
          </DialogTrigger>
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
                <Label htmlFor="scheduled_at">Start Time *</Label>
                <Input 
                  id="scheduled_at"
                  type="datetime-local"
                  value={newLive.scheduled_at}
                  onChange={e => setNewLive({...newLive, scheduled_at: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    Choose Image
                  </Button>
                  <span className="text-sm text-gray-400">
                    {newLive.thumbnail_url ? "Thumbnail uploaded" : "No image selected"}
                  </span>
                </div>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="video">Video *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Choose Video"
                    )}
                  </Button>
                  <span className="text-sm text-gray-400">
                    {newLive.video_url ? "Video uploaded" : "No video selected"}
                  </span>
                </div>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  className="hidden"
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
          {isLoggedIn ? (
            <Button 
              variant="default" 
              onClick={() => setUploadOpen(true)}
              disabled={isUploading}
            >
              Start Live Stream
            </Button>
          ) : (
            <Button variant="default" onClick={() => toast.info("Please sign in to start a live stream")}>
              Sign in to start
            </Button>
          )}
        </div>
      ) : (
        <div className={`flex-1 ${isFullScreen ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-3 gap-4 p-4'}`}>
          {/* Video Player */}
          <div className={`${isFullScreen ? 'flex-1' : 'lg:col-span-2'} relative`}>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={currentLive.video_url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                loop
                poster={currentLive.thumbnail_url || undefined}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge variant="destructive" className="bg-red-600">
                  LIVE
                </Badge>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={toggleFullScreen}
                  className="bg-black bg-opacity-50 hover:bg-opacity-70"
                >
                  {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Live Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={currentLive.avatar_url || 'https://via.placeholder.com/32'} 
                        alt={currentLive.user_name}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-sm">{currentLive.user_name}</p>
                        <p className="text-xs text-gray-300">
                          Started {format(new Date(currentLive.scheduled_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{viewerCount}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">{currentLive.title}</h3>
                  {currentLive.description && (
                    <p className="text-sm text-gray-300 mt-1">{currentLive.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Video Actions */}
            {!isFullScreen && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <button 
                    className="flex items-center gap-2 hover:text-music-accent transition-colors"
                    onClick={toggleLike}
                  >
                    <Heart className={`h-6 w-6 ${currentLive.liked_by_user ? 'text-red-500 fill-red-500' : ''}`} />
                    <span>{currentLive.likes_count}</span>
                  </button>
                  
                  <button 
                    className="flex items-center gap-2 hover:text-music-accent transition-colors"
                    onClick={shareLive}
                  >
                    <Share2 className="h-6 w-6" />
                    <span>Share</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MessageCircle className="h-4 w-4" />
                  <span>{comments.length} comments</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Section */}
          {!isFullScreen && (
            <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="font-bold">Live Chat</h3>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{viewerCount} viewers</span>
                </div>
              </div>
              
              {/* Comments */}
              <ScrollArea 
                ref={commentsRef} 
                className="flex-1 p-4"
              >
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-gray-600 mb-2" />
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-music-accent">
                              {comment.user_name}
                            </span>
                            <span className="text-xs text-gray-500">
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
              
              {/* Comment Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    placeholder={isLoggedIn ? "Say something..." : "Sign in to chat"}
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
          )}
        </div>
      )}
    </div>
  );
};

export default Live;
