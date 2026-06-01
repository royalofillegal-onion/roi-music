import React, { useState, useEffect, useRef } from "react";
import { Settings as SettingsIcon, User, Mail, Heart, MessageSquare, Music2, Users, FileText, ArrowLeft, Save, Loader2, Upload, Camera, Shield, Info, Globe, Copyright, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const getInitials = (name: string, email?: string) => {
  const source = (name || email || "U").trim();
  if (!source) return "U";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.substring(0, 2).toUpperCase();
};

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialName =
    user?.displayName || user?.email?.split("@")[0] || "";
  const initialAvatar = user?.photoURL || "";

  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userName, setUserName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [previewUrl, setPreviewUrl] = useState(initialAvatar);
  const [likedCount, setLikedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const isLoggedIn = !!user;

  // Load profile in background — UI already populated from Firebase user
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [{ data: profile }, { count }] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("firebase_uid", user.uid)
            .maybeSingle(),
          supabase
            .from("user_likes")
            .select("*", { count: "exact", head: true })
            .eq("firebase_uid", user.uid),
        ]);
        if (cancelled) return;
        if (profile?.display_name) {
          setUserName(profile.display_name);
          setTempName(profile.display_name);
        }
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
          setPreviewUrl(profile.avatar_url);
        }
        setLikedCount(count || 0);
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);


  const handleSaveName = async () => {
    if (!tempName.trim() || !user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            firebase_uid: user.uid,
            display_name: tempName.trim(),
            avatar_url: avatarUrl || null,
          },
          { onConflict: "firebase_uid" }
        );

      if (error) throw error;

      setUserName(tempName.trim());
      setEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return;
    }
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.uid}/${Date.now()}.${fileExt}`;

      // Delete old avatar if it lives in our bucket
      if (avatarUrl && avatarUrl.includes("/avatars/")) {
        const oldFileName = avatarUrl.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("avatars").remove([`${user.uid}/${oldFileName}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            firebase_uid: user.uid,
            avatar_url: publicUrl,
            display_name: userName || user.email?.split("@")[0] || "User",
          },
          { onConflict: "firebase_uid" }
        );

      if (updateError) {
        console.error("Error updating avatar:", updateError);
        return;
      }

      setAvatarUrl(publicUrl);
      setPreviewUrl(publicUrl);
    } catch (error: any) {
      console.error("Error in uploadAvatar:", error);
    } finally {
      setUploading(false);
    }
  };

      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase() || 'U';
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !feedback.trim()) {
      console.error("Please provide a rating and feedback");
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create form data for FormSubmit
      const formData = new FormData();
      formData.append('name', feedbackName.trim() || userName || "Anonymous");
      formData.append('email', feedbackEmail.trim() || userEmail || "noreply@royalstar.com");
      formData.append('rating', rating.toString());
      formData.append('feedback', feedback.trim());
      formData.append('user_id', session?.user?.id || 'guest');
      formData.append('_subject', `New Feedback from ROI MUSIC - ${rating} stars`);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_next', window.location.origin + '/settings?feedback=success');

      // Submit to FormSubmit
      const response = await fetch('https://formsubmit.co/royalofillegal@gmail.com', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Reset form
        setRating(0);
        setFeedback("");
        setFeedbackEmail("");
        setFeedbackName("");
        setShowFeedbackForm(false);
      } else {
        throw new Error('Failed to submit feedback');
      }
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4 pt-20 pb-24 md:pb-4 md:pl-24">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>
              Please log in to access your settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              Settings
            </h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Update your profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {getInitials(userName || userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={triggerFileInput}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{userName || 'Set your name'}</h3>
                  <p className="text-sm text-gray-400">Click the camera to change avatar</p>
                </div>
              </div>

              {/* Name Section */}
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={editingName ? tempName : userName}
                    onChange={(e) => setTempName(e.target.value)}
                    readOnly={!editingName}
                    placeholder="Enter your name"
                  />
                  {editingName ? (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveName}
                        disabled={saving || !tempName.trim()}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingName(false);
                          setTempName(userName);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingName(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Section */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{userEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5" />
                Your Music Stats
              </CardTitle>
              <CardDescription>
                Your activity on Royal of Illegal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-red-400" />
                  <div className="text-lg font-semibold">{likedCount}</div>
                  <div className="text-xs text-gray-400">Liked Songs</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                  <div className="text-lg font-semibold">0</div>
                  <div className="text-xs text-gray-400">Comments</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/user-settings')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/terms')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Terms & Conditions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Give Feedback
            </CardTitle>
            <CardDescription>
              Help us improve by sharing your thoughts and suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showFeedbackForm ? (
              <Button 
                onClick={() => setShowFeedbackForm(true)}
                className="w-full bg-music-accent hover:bg-music-accent/90 text-black"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Share Your Feedback
              </Button>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <Label>Rate your experience</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400 hover:text-yellow-400"
                        }`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback-name">Name (Optional)</Label>
                  <Input
                    id="feedback-name"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder={userName || "Your name"}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="feedback-email">Email (Optional)</Label>
                  <Input
                    id="feedback-email"
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder={userEmail || "your.email@example.com"}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    We'll only use this to follow up if needed
                  </p>
                </div>

                <div>
                  <Label htmlFor="feedback-text">Your Feedback</Label>
                  <Textarea
                    id="feedback-text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you love, what could be improved, or any suggestions you have..."
                    className="bg-gray-800 border-gray-700 mt-1 min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-music-accent hover:bg-music-accent/90 text-black"
                    disabled={isSubmittingFeedback || !rating || !feedback.trim()}
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFeedbackForm(false)}
                    disabled={isSubmittingFeedback}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24 space-y-6">
        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About Royal of Illegal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">Version:</span>
                <span>2.7.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Music2 className="h-4 w-4 text-purple-400" />
                <span className="text-gray-400">Songs Available:</span>
                <span>10000+</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                <span className="text-gray-400">Active Users:</span>
                <span>NA</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Copyright className="h-3 w-3" />
                <span>2024 Royal of Illegal. All rights reserved.</span>
              </div>
              <span>Made with ❤️ for music lovers</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Settings;
