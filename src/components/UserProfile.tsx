import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User as UserIcon, LogOut, Heart, Music2, Loader2, Radio } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const UserProfile = () => {
  const [userName, setUserName] = useState<string>('Guest User');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('UserProfile: Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          setIsLoggedIn(true);
          // Get user profile in a separate function to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchLikedSongsCount(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserName('Guest User');
          setAvatarUrl('');
          setLikedCount(0);
        }
      }
    );
    
    // Then check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsLoggedIn(true);
          await fetchUserProfile(session.user.id);
          await fetchLikedSongsCount(session.user.id);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };
    
    checkUser();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to get user profile from Supabase
      const { data: profile, error } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
        
      if (profile) {
        setUserName(profile.name || 'Music Lover');
        setAvatarUrl(profile.avatar_url || '');
      } else {
        setUserName('Music Lover');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchLikedSongsCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('liked_songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!error && count !== null) {
        setLikedCount(count);
      }
    } catch (error) {
      console.error("Error fetching liked songs count:", error);
    }
  };

  // Subscribe to real-time changes in liked_songs table
  useEffect(() => {
    if (!isLoggedIn) return;

    const channel = supabase
      .channel('liked_songs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'liked_songs'
        },
        async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetchLikedSongsCount(session.user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        toast.error("Sign out failed: " + error.message);
      } else {
        // Clear all auth data from local storage
        localStorage.removeItem('auth.session');
        localStorage.removeItem('supabase.auth.token');
        
        // Update state
        setIsLoggedIn(false);
        setUserName('Guest User');
        setAvatarUrl('');
        setLikedCount(0);
        
        // Show toast
        toast.success("Signed out successfully");
        
        // Redirect to home page
        navigate('/');
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      toast.error("An unexpected error occurred while signing out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  const navigateToLikedSongs = () => {
    navigate('/liked');
  };

  const navigateToLive = () => {
    navigate('/live');
  };

  // Enhanced profile picture upload with better error handling and user-uploads bucket
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB)");
      return;
    }

    try {
      setIsUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to upload a profile picture");
        return;
      }
      
      // Create a unique file name for this upload
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${session.user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase Storage with improved error handling
      const { data, error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Error uploading profile picture: " + uploadError.message);
        return;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);
      
      // Allow time for storage processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('user_id', session.user.id);
        
      if (updateError) {
        toast.error("Error updating profile: " + updateError.message);
        console.error("Error updating avatar URL:", updateError);
        return;
      }
      
      setAvatarUrl(publicUrl);
      toast.success("Profile picture updated successfully");
      
    } catch (error: any) {
      console.error("Error in profile picture upload:", error);
      toast.error("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const openFileUpload = () => {
    if (isLoggedIn && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfilePictureUpload}
        accept="image/*"
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" disabled={isLoading}>
          <div className="flex items-center space-x-3 rounded-full bg-gray-800/50 p-2 pr-4 transition-colors hover:bg-gray-800/80">
            <Avatar 
              className="h-9 w-9 cursor-pointer relative" 
              onClick={openFileUpload}
            >
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full z-10">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={userName} />
              ) : (
                <AvatarFallback className="bg-music-accent text-black">
                  {getInitials(userName)}
                </AvatarFallback>
              )}
            </Avatar>
            {!isMobile && (
              <span className="text-sm font-medium truncate max-w-[120px]">{userName}</span>
            )}
            
            {isLoggedIn && likedCount > 0 && (
              <Badge className="bg-music-accent text-black ml-1 text-xs">{likedCount}</Badge>
            )}
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
          <DropdownMenuLabel>RoyalStar Pro Advanced Edition</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />
          
          {isLoggedIn ? (
            <>
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={openFileUpload}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Update Profile Picture</span>
              </DropdownMenuItem>
            
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={navigateToLikedSongs}
              >
                <Heart className="mr-2 h-4 w-4" />
                <span>Liked Songs</span>
                {likedCount > 0 && (
                  <Badge className="ml-auto bg-music-accent text-black">{likedCount}</Badge>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={() => navigate('/playlists')}
              >
                <Music2 className="mr-2 h-4 w-4" />
                <span>My Playlists</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={navigateToLive}
              >
                <Radio className="mr-2 h-4 w-4" />
                <span>Live</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={navigateToSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-800" />
              
              <DropdownMenuItem 
                className="flex items-center text-red-500 hover:text-red-400 cursor-pointer"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? <span>Signing out...</span> : <span>Sign Out</span>}
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={handleSignIn}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;
