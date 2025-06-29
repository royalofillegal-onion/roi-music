
import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Mail, Heart, MessageSquare, Music2, Users, FileText, ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [likedCount, setLikedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || "");
        
        // Load user profile
        const { data: profile } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('user_id', session.user.id)
          .single();
          
        if (profile) {
          setUserName(profile.name || "");
          setAvatarUrl(profile.avatar_url || "");
          setTempName(profile.name || "");
        }
        
        // Load liked songs count
        const { count } = await supabase
          .from('liked_songs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
          
        setLikedCount(count || 0);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from('users')
        .update({ name: tempName.trim() })
        .eq('user_id', session.user.id);

      if (error) throw error;

      setUserName(tempName.trim());
      setEditingName(false);
      toast.success("Name updated successfully");
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-music-accent" />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-32 md:pb-40 px-4 md:px-8 md:ml-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-music-accent" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          {/* User Profile Section */}
          {isLoggedIn && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-music-accent" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={userName} />
                    ) : (
                      <AvatarFallback className="bg-music-accent text-black text-xl">
                        {getInitials(userName || "User")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userEmail}
                        disabled
                        className="bg-gray-800 border-gray-700 text-gray-400 mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      {editingName ? (
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-gray-800 border-gray-700"
                            placeholder="Enter your name"
                          />
                          <Button 
                            onClick={handleSaveName}
                            disabled={saving}
                            size="sm"
                            className="bg-music-accent hover:bg-music-accent/90 text-black"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button 
                            onClick={() => {
                              setEditingName(false);
                              setTempName(userName);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={userName || "Not set"}
                            disabled
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button 
                            onClick={() => setEditingName(true)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liked Songs */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-400" />
                  Liked Songs
                </CardTitle>
                <CardDescription>
                  {isLoggedIn ? `You have ${likedCount} liked songs` : "Sign in to view your liked songs"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/liked')}
                  variant="outline"
                  className="w-full justify-start border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                  disabled={!isLoggedIn}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  View Liked Songs
                </Button>
              </CardContent>
            </Card>

            {/* My Playlists */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music2 className="h-5 w-5 text-purple-400" />
                  My Playlists
                </CardTitle>
                <CardDescription>
                  {isLoggedIn ? "Manage your custom playlists" : "Sign in to create playlists"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/playlists')}
                  variant="outline"
                  className="w-full justify-start border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white"
                  disabled={!isLoggedIn}
                >
                  <Music2 className="h-4 w-4 mr-2" />
                  View My Playlists
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator className="bg-gray-800" />

          {/* App Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Browse Artists */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Browse Artists
                </CardTitle>
                <CardDescription>
                  Explore artists and discover new music
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/artists')}
                  variant="outline"
                  className="w-full justify-start border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View All Artists
                </Button>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  Feedback
                </CardTitle>
                <CardDescription>
                  Share your thoughts and suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/feedback')}
                  variant="outline"
                  className="w-full justify-start border-green-500 text-green-400 hover:bg-green-600 hover:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Legal Information */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                Legal Information
              </CardTitle>
              <CardDescription>
                Terms of service and platform policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/terms')}
                variant="outline"
                className="w-full justify-start border-gray-500 text-gray-400 hover:bg-gray-600 hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Terms & Conditions
              </Button>
            </CardContent>
          </Card>

          {/* Sign In Prompt for Non-logged Users */}
          {!isLoggedIn && (
            <Card className="bg-gray-900/50 border-gray-800 border-music-accent/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-music-accent" />
                  Sign In Required
                </CardTitle>
                <CardDescription>
                  Sign in to access all features and personalize your experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In / Sign Up
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
