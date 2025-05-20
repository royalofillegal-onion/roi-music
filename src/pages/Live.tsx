
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Plus, Heart, MessageCircle, Share2, Loader2, Calendar, Clock } from "lucide-react";
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
  const [lives, setLives] = useState<Live[]>([]);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentLiveId, setCurrentLiveId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newLive, setNewLive] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    scheduled_at: new Date().toISOString().slice(0, 16),
  });
  const { toast: uiToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const livesContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
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
  
  // Fetch lives
  useEffect(() => {
    fetchLives();
  }, [userId]);

  // Subscribe to new comments for current live
  useEffect(() => {
    if (!currentLiveId) return;

    const subscription = supabase
      .channel('public:live_comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_comments',
        filter: `live_id=eq.${currentLiveId}`
      }, payload => {
        fetchComments(currentLiveId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentLiveId]);
  
  // Handle live scrolling and video playback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting) {
            video.play().catch(err => console.error("Error playing video:", err));
            
            // Update current live index
            const liveId = video.getAttribute('data-live-id');
            if (liveId) {
              const index = lives.findIndex(live => live.id === liveId);
              if (index >= 0) {
                setCurrentLiveIndex(index);
                setCurrentLiveId(liveId);
                // Fetch comments for this live
                fetchComments(liveId);
              }
            }
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.7, // At least 70% of the element should be visible
        root: livesContainerRef.current
      }
    );
    
    // Observe all video elements
    videoRefs.current.forEach(video => {
      observer.observe(video);
    });
    
    return () => {
      videoRefs.current.forEach(video => {
        observer.unobserve(video);
      });
    };
  }, [lives]);
  
  // Fetch lives from server
  const fetchLives = async () => {
    setIsLoading(true);
    try {
      // Get all scheduled lives
      const { data: livesData, error } = await supabase
        .from('lives')
        .select('*')
        .order('scheduled_at', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Get user details for each live
      const livesWithUserDetails = await Promise.all(
        livesData.map(async (live) => {
          // Get user name and avatar
          const { data: userData } = await supabase
            .from('users')
            .select('name, avatar_url')
            .eq('user_id', live.user_id)
            .single();
          
          // Get likes count
          const { count: likesCount } = await supabase
            .from('live_likes')
            .select('*', { count: 'exact', head: true })
            .eq('live_id', live.id);
          
          // Get comments count
          const { count: commentsCount } = await supabase
            .from('live_comments')
            .select('*', { count: 'exact', head: true })
            .eq('live_id', live.id);
          
          // Check if user has liked this live
          let likedByUser = false;
          if (userId) {
            const { data: likeData } = await supabase
              .from('live_likes')
              .select('id')
              .eq('live_id', live.id)
              .eq('user_id', userId)
              .single();
            
            likedByUser = !!likeData;
          }
          
          return {
            ...live,
            user_name: userData?.name || 'Unknown User',
            avatar_url: userData?.avatar_url,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            liked_by_user: likedByUser
          };
        })
      );
      
      setLives(livesWithUserDetails);
      if (livesWithUserDetails.length > 0) {
        setCurrentLiveId(livesWithUserDetails[0].id);
        fetchComments(livesWithUserDetails[0].id);
      }
    } catch (error) {
      console.error('Error fetching lives:', error);
      toast.error('Failed to load lives');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch comments for a live
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
    
    if (!newComment.trim() || !currentLiveId) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('live_comments')
        .insert({
          live_id: currentLiveId,
          user_id: userId,
          content: newComment.trim()
        });
      
      if (error) {
        throw error;
      }
      
      // Clear comment input
      setNewComment('');
      
      // Scroll to bottom of comments
      if (commentsRef.current) {
        commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };
  
  // Toggle like on a live
  const toggleLike = async (liveId: string) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to like lives');
      return;
    }
    
    // Update UI optimistically
    setLives(currentLives => 
      currentLives.map(live => {
        if (live.id === liveId) {
          const wasLiked = live.liked_by_user;
          return {
            ...live,
            likes_count: wasLiked ? live.likes_count - 1 : live.likes_count + 1,
            liked_by_user: !wasLiked
          };
        }
        return live;
      })
    );
    
    try {
      const live = lives.find(l => l.id === liveId);
      if (!live) return;
      
      if (live.liked_by_user) {
        // Unlike
        const { error } = await supabase
          .from('live_likes')
          .delete()
          .eq('live_id', liveId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('live_likes')
          .insert({
            live_id: liveId,
            user_id: userId
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
      
      // Revert UI change on error
      fetchLives();
    }
  };
  
  // Share live
  const shareLive = (live: Live) => {
    if (navigator.share) {
      navigator.share({
        title: live.title,
        text: live.description || 'Check out this live stream!',
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      toast.info("Share feature coming soon!");
    }
  };
  
  // Handle file upload for new live
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
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
  
  // Handle video upload for new live
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 100MB)
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
        });
        
      if (error) throw error;
      
      toast.success('Live created successfully');
      setUploadOpen(false);
      
      // Reset form
      setNewLive({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        scheduled_at: new Date().toISOString().slice(0, 16),
      });
      
      // Refresh lives
      fetchLives();
    } catch (error) {
      console.error('Error creating live:', error);
      toast.error('Failed to create live');
    }
  };
  
  // Register video ref
  const setVideoRef = (liveId: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(liveId, element);
    } else {
      videoRefs.current.delete(liveId);
    }
  };
  
  return (
    <div className="flex flex-col h-full pt-16 md:pt-0 md:ml-16 md:mb-20">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Live</h1>
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
              <DialogTitle>Create New Live</DialogTitle>
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
                <Label htmlFor="scheduled_at">Scheduled Time *</Label>
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
                Create Live
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleVideoUpload}
          accept="video/*"
          className="hidden"
        />
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
        </div>
      ) : lives.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-xl font-medium mb-2">No lives yet</h2>
          <p className="text-gray-400 mb-4">Be the first to create a live!</p>
          {isLoggedIn ? (
            <Button 
              variant="default" 
              onClick={() => setUploadOpen(true)}
              disabled={isUploading}
            >
              Create a Live
            </Button>
          ) : (
            <Button variant="default" onClick={() => toast.info("Please sign in to create a live")}>
              Sign in to create
            </Button>
          )}
        </div>
      ) : (
        <div 
          ref={livesContainerRef}
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
        >
          {lives.map((live, index) => (
            <div 
              key={live.id}
              className="h-full w-full snap-start snap-always flex flex-col"
            >
              <div className="relative flex-1 bg-black">
                <video
                  ref={el => setVideoRef(live.id, el)}
                  src={live.video_url}
                  className="h-full w-full object-contain"
                  loop
                  muted
                  playsInline
                  poster={live.thumbnail_url || undefined}
                  data-live-id={live.id}
                />
                
                {/* Scheduled info */}
                <div className="absolute top-4 left-4 flex items-center bg-black bg-opacity-50 p-2 rounded">
                  <Calendar className="h-4 w-4 mr-2 text-music-accent" />
                  <span className="text-sm">
                    {format(new Date(live.scheduled_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                
                {/* User info */}
                <div className="absolute bottom-16 left-4 flex items-center">
                  <img 
                    src={live.avatar_url || 'https://via.placeholder.com/40'} 
                    alt={live.user_name}
                    className="h-10 w-10 rounded-full border-2 border-white"
                  />
                  <div className="ml-2">
                    <p className="font-semibold">{live.user_name}</p>
                    <p className="text-sm text-gray-300">
                      {new Date(live.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Caption */}
                <div className="absolute bottom-4 left-4 right-12 bg-black bg-opacity-50 p-2 rounded">
                  <h3 className="font-bold">{live.title}</h3>
                  {live.description && <p className="text-sm mt-1">{live.description}</p>}
                </div>
                
                {/* Actions */}
                <div className="absolute right-4 bottom-16 flex flex-col items-center space-y-6">
                  <button 
                    className="flex flex-col items-center"
                    onClick={() => toggleLike(live.id)}
                  >
                    <Heart className={`h-8 w-8 ${live.liked_by_user ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                    <span className="text-xs mt-1">{live.likes_count}</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs mt-1">{live.comments_count}</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center"
                    onClick={() => shareLive(live)}
                  >
                    <Share2 className="h-8 w-8" />
                    <span className="text-xs mt-1">Share</span>
                  </button>
                </div>
                
                {/* Progress indicator */}
                <div className="absolute top-4 right-0 left-0 flex justify-center space-x-1">
                  {lives.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1 rounded-full ${i === currentLiveIndex ? 'bg-music-accent w-6' : 'bg-gray-500 w-4'}`}
                    />
                  ))}
                </div>
                
                {/* Comments panel */}
                {showComments && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-gray-800">
                      <h3 className="font-bold">Comments ({comments.length})</h3>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowComments(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <ScrollArea 
                      ref={commentsRef} 
                      className="flex-1 p-4"
                    >
                      {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <p className="text-gray-400">No comments yet</p>
                          <p className="text-gray-500 text-sm mt-2">Be the first to comment!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map(comment => (
                            <div key={comment.id} className="flex">
                              <img 
                                src={comment.avatar_url || 'https://via.placeholder.com/32'} 
                                alt={comment.user_name}
                                className="h-8 w-8 rounded-full mr-3 flex-shrink-0"
                              />
                              <div className="bg-gray-800 rounded-lg px-3 py-2 flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="font-medium text-sm">{comment.user_name}</p>
                                  <span className="text-gray-500 text-xs">
                                    {format(new Date(comment.created_at), "h:mm a")}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="p-4 border-t border-gray-800 flex gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addComment()}
                      />
                      <Button 
                        disabled={!newComment.trim() || !isLoggedIn}
                        onClick={addComment}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Live;
