
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Plus, Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlayer } from "@/context/PlayerContext";

interface Reel {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  video_url: string;
  audio_id?: string;
  caption: string;
  likes: number;
  created_at: string;
  liked_by_user: boolean;
}

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reelsContainerRef = useRef<HTMLDivElement>(null);
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
  
  // Fetch reels
  useEffect(() => {
    fetchReels();
  }, [userId]);
  
  // Handle reel scrolling and video playback
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          
          if (entry.isIntersecting) {
            video.play().catch(err => console.error("Error playing video:", err));
            
            // Update current reel index
            const reelId = video.getAttribute('data-reel-id');
            if (reelId) {
              const index = reels.findIndex(reel => reel.id === reelId);
              if (index >= 0) {
                setCurrentReelIndex(index);
              }
            }
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.7, // At least 70% of the element should be visible
        root: reelsContainerRef.current
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
  }, [reels]);
  
  // Fetch reels from server
  const fetchReels = async () => {
    setIsLoading(true);
    try {
      // For demonstration, we'll use dummy data since we haven't created the reels table yet
      // In a real implementation, you would fetch from Supabase
      
      // This is placeholder data until the reels table and functionality are fully implemented
      const dummyReels: Reel[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Music Lover',
          avatar_url: 'https://i.pravatar.cc/150?img=1',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-happily-in-a-field-of-flowers-4702-large.mp4',
          audio_id: currentSong?.id || 'song1',
          caption: 'Dancing to my favorite tune! 🎵 #MusicMoment',
          likes: 42,
          created_at: new Date().toISOString(),
          liked_by_user: false
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Rhythm King',
          avatar_url: 'https://i.pravatar.cc/150?img=2',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-walking-between-palm-trees-4877-large.mp4',
          audio_id: 'song2',
          caption: 'Beach vibes only 🏝️ #SummerSoundtrack',
          likes: 87,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          liked_by_user: userId === 'user2'
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Melody Master',
          avatar_url: 'https://i.pravatar.cc/150?img=3',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-man-playing-an-acoustic-guitar-on-the-street-4818-large.mp4',
          audio_id: 'song3',
          caption: 'Street performance with my acoustic guitar 🎸 #StreetMusic',
          likes: 124,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          liked_by_user: false
        }
      ];
      
      setReels(dummyReels);
      
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error('Failed to load reels');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file upload for new reel
  const handleReelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to upload reels');
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size too large (max 100MB)");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('video/')) {
      toast.error("Only video files are allowed");
      return;
    }
    
    setIsUploading(true);
    toast.info("Reel upload feature is coming soon!");
    
    // This would be where we upload to Supabase storage
    // and create a record in the reels table
    
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Reel upload feature is in development");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };
  
  // Toggle like on a reel
  const toggleLike = async (reelId: string) => {
    if (!isLoggedIn) {
      toast.error('Please sign in to like reels');
      return;
    }
    
    // Update UI optimistically
    setReels(currentReels => 
      currentReels.map(reel => {
        if (reel.id === reelId) {
          const wasLiked = reel.liked_by_user;
          return {
            ...reel,
            likes: wasLiked ? reel.likes - 1 : reel.likes + 1,
            liked_by_user: !wasLiked
          };
        }
        return reel;
      })
    );
    
    // In a real implementation, we would update the likes in Supabase
  };
  
  // Share reel
  const shareReel = (reel: Reel) => {
    // In a real implementation, this would open a share dialog
    toast.info("Share feature coming soon!");
  };
  
  // Register video ref
  const setVideoRef = (reelId: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(reelId, element);
    } else {
      videoRefs.current.delete(reelId);
    }
  };
  
  return (
    <div className="flex flex-col h-full pt-16 md:pt-0 md:ml-16 md:mb-20">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Reels</h1>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !isLoggedIn}
        >
          {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleReelUpload}
          accept="video/*"
          className="hidden"
        />
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
        </div>
      ) : reels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-xl font-medium mb-2">No reels yet</h2>
          <p className="text-gray-400 mb-4">Be the first to share a reel!</p>
          {isLoggedIn ? (
            <Button 
              variant="default" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Upload a Reel
            </Button>
          ) : (
            <Button variant="default" onClick={() => toast.info("Please sign in to upload reels")}>
              Sign in to upload
            </Button>
          )}
        </div>
      ) : (
        <div 
          ref={reelsContainerRef}
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
        >
          {reels.map((reel, index) => (
            <div 
              key={reel.id}
              className="h-full w-full snap-start snap-always flex flex-col"
            >
              <div className="relative flex-1 bg-black">
                <video
                  ref={el => setVideoRef(reel.id, el)}
                  src={reel.video_url}
                  className="h-full w-full object-contain"
                  loop
                  muted
                  playsInline
                  data-reel-id={reel.id}
                />
                
                {/* User info */}
                <div className="absolute bottom-16 left-4 flex items-center">
                  <img 
                    src={reel.avatar_url || 'https://via.placeholder.com/40'} 
                    alt={reel.user_name}
                    className="h-10 w-10 rounded-full border-2 border-white"
                  />
                  <div className="ml-2">
                    <p className="font-semibold">{reel.user_name}</p>
                    <p className="text-sm text-gray-300">{new Date(reel.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* Caption */}
                <div className="absolute bottom-4 left-4 right-12 bg-black bg-opacity-50 p-2 rounded">
                  <p className="text-sm">{reel.caption}</p>
                </div>
                
                {/* Actions */}
                <div className="absolute right-4 bottom-16 flex flex-col items-center space-y-6">
                  <button 
                    className="flex flex-col items-center"
                    onClick={() => toggleLike(reel.id)}
                  >
                    <Heart className={`h-8 w-8 ${reel.liked_by_user ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                    <span className="text-xs mt-1">{reel.likes}</span>
                  </button>
                  
                  <button className="flex flex-col items-center">
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs mt-1">Comment</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center"
                    onClick={() => shareReel(reel)}
                  >
                    <Share2 className="h-8 w-8" />
                    <span className="text-xs mt-1">Share</span>
                  </button>
                </div>
                
                {/* Progress indicator */}
                <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1">
                  {reels.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1 rounded-full ${i === currentReelIndex ? 'bg-music-accent w-6' : 'bg-gray-500 w-4'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reels;
