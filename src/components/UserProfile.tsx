import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User as UserIcon, LogOut, Heart, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

const getInitials = (name: string, email?: string) => {
  const source = (name || email || "U").trim();
  if (!source) return "U";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.substring(0, 2).toUpperCase();
};

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileName, setProfileName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [likedCount, setLikedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = !!user;
  const displayName =
    profileName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    (user ? "Music Lover" : "Guest User");
  const photo = avatarUrl || user?.photoURL || "";

  useEffect(() => {
    if (!user) {
      setProfileName("");
      setAvatarUrl("");
      setLikedCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: profile }, { count }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user.uid)
          .maybeSingle(),
        supabase
          .from("user_likes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.uid),
      ]);
      if (cancelled) return;
      if (profile) {
        setProfileName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url || "");
      }
      setLikedCount(count || 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      navigate("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none" disabled={isLoading}>
          <div className="flex items-center space-x-3 rounded-full bg-gray-800/50 p-2 pr-4 transition-colors hover:bg-gray-800/80">
            <Avatar className="h-9 w-9">
              {photo ? (
                <AvatarImage src={photo} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                  {getInitials(displayName, user?.email ?? undefined)}
                </AvatarFallback>
              )}
            </Avatar>
            {!isMobile && (
              <span className="text-sm font-medium truncate max-w-[120px]">
                {displayName}
              </span>
            )}
            {isLoggedIn && likedCount > 0 && (
              <Badge className="bg-music-accent text-black ml-1 text-xs">
                {likedCount}
              </Badge>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
          <DropdownMenuLabel>ROI MUSIC 2.7</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />

          {isLoggedIn ? (
            <>
              <DropdownMenuItem onClick={() => navigate("/liked")}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Liked Songs</span>
                {likedCount > 0 && (
                  <Badge className="ml-auto bg-music-accent text-black">
                    {likedCount}
                  </Badge>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/settings")}>
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
            <DropdownMenuItem onClick={() => navigate("/auth")}>
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
