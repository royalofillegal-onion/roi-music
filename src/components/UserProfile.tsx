import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User as UserIcon, LogOut, Heart, Music2, Loader2, MessageSquare } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const UserProfile = () => {
  const [userName, setUserName] = useState<string>('Guest User');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [likedCount, setLikedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsLoggedIn(true);
          setTimeout(() => {
            fetchUserProfile(session.user);
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
    
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsLoggedIn(true);
          await fetchUserProfile(session.user);
          await fetchLikedSongsCount(session.user.id);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };
    
    checkUser();
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      if (profile && profile.display_name) {
        setUserName(profile.display_name);
        setAvatarUrl(profile.avatar_url || '');
      } else {
        const displayName = user.user_metadata?.name || 
                           user.user_metadata?.full_name || 
                           user.email?.split('@')[0] || 
                           'Music Lover';
        setUserName(displayName);
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            user_id: user.id,
            display_name: displayName,
            avatar_url: user.user_metadata?.avatar_url || ''
          }, { onConflict: 'user_id' });
          
        if (!upsertError) {
          setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchLikedSongsCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!error && count !== null) {
        setLikedCount(count);
      }
    } catch (error) {
      console.error("Error fetching liked songs count:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        localStorage.removeItem('auth.session');
        localStorage.removeItem('supabase.auth.token');
        setIsLoggedIn(false);
        setUserName('Guest User');
        setAvatarUrl('');
        setLikedCount(0);
        navigate('/');
      }
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024 || !file.type.startsWith('image/')) return;

    try {
      setIsUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        await supabase.from('profiles').upsert({ 
          user_id: session.user.id,
          avatar_url: publicUrl,
          display_name: userName
        }, { onConflict: 'user_id' });
        
        setAvatarUrl(publicUrl);
      }
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
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
            <Avatar className="h-9 w-9 cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
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
          <DropdownMenuLabel>ROI MUSIC 2.7</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />
          
          {isLoggedIn ? (
            <>
              <DropdownMenuItem onClick={() => navigate('/liked')}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Liked Songs</span>
                {likedCount > 0 && (
                  <Badge className="ml-auto bg-music-accent text-black">{likedCount}</Badge>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-800" />
              
              <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? <span>Signing out...</span> : <span>Sign Out</span>}
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => navigate('/auth')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Sign In</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;
