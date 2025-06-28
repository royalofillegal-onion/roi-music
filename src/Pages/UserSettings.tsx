import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const UserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("dark");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to access settings");
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (error) {
        toast.error("Error loading user profile");
        console.error("Error loading profile:", error);
        return;
      }
      
      if (data) {
        setName(data.name || "");
        setTheme(data.theme || "dark");
        setAvatarUrl(data.avatar_url || "");
        setPreviewUrl(data.avatar_url || "");
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      toast.error("An error occurred while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to save settings");
        return;
      }
      
      // Update the user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name,
          theme,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id);
        
      if (error) {
        toast.error("Error saving profile");
        console.error("Error saving profile:", error);
        return;
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in saveProfile:", error);
      toast.error("An error occurred while saving your profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large (max 5MB)");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file.");
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
    try {
      setUploading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to upload an avatar");
        return;
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          const oldPath = `${session.user.id}/${oldFileName}`;
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        toast.error("Error uploading avatar: " + uploadError.message);
        console.error("Error uploading avatar:", uploadError);
        return;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      setAvatarUrl(publicUrl);
      setPreviewUrl(publicUrl);
      toast.success("Avatar uploaded successfully");
      
    } catch (error: any) {
      console.error("Error in uploadAvatar:", error);
      toast.error("An error occurred while uploading your avatar: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast.error("Error updating password: " + error.message);
        return;
      }
      
      toast.success("Password updated successfully");
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      console.error("Error in handleChangePassword:", error);
      toast.error("An error occurred while updating your password");
    } finally {
      setChangingPassword(false);
    }
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
      <h1 className="text-3xl font-bold mb-6 mt-2">User Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full max-w-3xl">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-medium">Profile Information</h2>
            <Separator className="bg-gray-800" />
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-music-accent text-black text-3xl">
                      {getInitials(name || "User")}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <Button 
                  variant="outline" 
                  className="relative"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Upload Avatar
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </Button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
                
                <div>
                  <Label>Theme Preference</Label>
                  <div className="flex items-center mt-2">
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                    <span className="ml-2">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={saveProfile}
              className="bg-music-accent hover:bg-music-accent/90 text-black"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-medium">Music Preferences</h2>
            <Separator className="bg-gray-800" />
            
            <div className="space-y-4">
              <div>
                <Label>Audio Quality</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["Normal", "High", "Ultra"].map((quality) => (
                    <Button 
                      key={quality}
                      variant={quality === "High" ? "default" : "outline"}
                      className={quality === "High" ? "bg-music-accent text-black" : ""}
                    >
                      {quality}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Autoplay</Label>
                <div className="flex items-center mt-2">
                  <Switch defaultChecked />
                  <span className="ml-2">Automatically play music when opening the app</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-medium">Account Settings</h2>
            <Separator className="bg-gray-800" />
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value="user@example.com"
                  disabled
                  className="bg-gray-800 border-gray-700 mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">To change your email, please contact support</p>
              </div>
              
              {showChangePassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4 bg-gray-800/50 p-4 rounded-md">
                  <h3 className="font-medium">Change Password</h3>
                  
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 mt-1"
                      minLength={6}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 mt-1"
                      minLength={6}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="bg-music-accent hover:bg-music-accent/90 text-black"
                      disabled={changingPassword}
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowChangePassword(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                    className="text-music-accent hover:text-music-accent/90 border-music-accent/50 hover:bg-music-accent/10"
                  >
                    Change Password
                  </Button>
                </div>
              )}
              
              <div>
                <Button variant="outline" className="text-red-500 hover:text-red-400 hover:bg-red-900/20">
                  Delete Account
                </Button>
                <p className="text-xs text-gray-400 mt-1">This action cannot be undone</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
