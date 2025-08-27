
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Pause, 
  Calendar,
  Youtube,
  Upload,
  Eye,
  Heart
} from "lucide-react";

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  scheduled_at: string;
  ends_at?: string;
  is_active: boolean;
  views: number;
  created_at: string;
}

const AdminLive = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [lives, setLives] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLive, setEditingLive] = useState<LiveStream | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    scheduled_at: new Date().toISOString().slice(0, 16),
    ends_at: "",
  });

  // Check if accessing royal section
  useEffect(() => {
    if (section === "royal") {
      // Show password prompt
      setIsAuthenticated(false);
    } else {
      navigate("/admin");
    }
  }, [section, navigate]);

  // Handle password authentication
  const handlePasswordAuth = () => {
    if (password === "$$me") {
      setIsAuthenticated(true);
      setPassword("");
      fetchLiveStreams();
    } else {
      console.error("Invalid password");
    }
  };

  // Fetch live streams
  const fetchLiveStreams = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLives(data || []);
    } catch (error) {
      console.error('Error fetching live streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.video_url) {
      console.error("Title and video URL are required");
      return;
    }

    setIsLoading(true);
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("Not authenticated");
        return;
      }

      const liveData = {
        ...formData,
        user_id: session.user.id,
        ends_at: formData.ends_at || null,
        thumbnail_url: formData.thumbnail_url || null,
      };

      if (editingLive) {
        // Update existing live
        const { error } = await supabase
          .from('lives')
          .update(liveData)
          .eq('id', editingLive.id);

        if (error) throw error;
      } else {
        // Create new live
        const { error } = await supabase
          .from('lives')
          .insert(liveData);

        if (error) throw error;
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        scheduled_at: new Date().toISOString().slice(0, 16),
        ends_at: "",
      });
      setShowForm(false);
      setEditingLive(null);
      fetchLiveStreams();

    } catch (error) {
      console.error('Error saving live stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle live status
  const toggleLiveStatus = async (liveId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('lives')
        .update({ is_active: !currentStatus })
        .eq('id', liveId);

      if (error) throw error;
      
      fetchLiveStreams();
    } catch (error) {
      console.error('Error toggling live status:', error);
    }
  };

  // Delete live stream
  const deleteLive = async (liveId: string) => {
    if (!confirm("Are you sure you want to delete this live stream?")) return;

    try {
      const { error } = await supabase
        .from('lives')
        .delete()
        .eq('id', liveId);

      if (error) throw error;
      
      fetchLiveStreams();
    } catch (error) {
      console.error('Error deleting live stream:', error);
    }
  };

  // Start editing
  const startEdit = (live: LiveStream) => {
    setEditingLive(live);
    setFormData({
      title: live.title,
      description: live.description || "",
      video_url: live.video_url,
      thumbnail_url: live.thumbnail_url || "",
      scheduled_at: new Date(live.scheduled_at).toISOString().slice(0, 16),
      ends_at: live.ends_at ? new Date(live.ends_at).toISOString().slice(0, 16) : "",
    });
    setShowForm(true);
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string) => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Royal Live Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordAuth()}
            />
            <Button 
              onClick={handlePasswordAuth} 
              className="w-full"
              disabled={!password}
            >
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-16 pb-24 md:pb-4 md:pl-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Royal Live Admin</h1>
          <p className="text-gray-400">Manage live streams and videos</p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingLive(null);
            setFormData({
              title: "",
              description: "",
              video_url: "",
              thumbnail_url: "",
              scheduled_at: new Date().toISOString().slice(0, 16),
              ends_at: "",
            });
          }} 
          className="flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus size={16} /> Add Live Stream</>}
        </Button>
      </div>

      {/* Live Stream Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingLive ? "Edit Live Stream" : "Create New Live Stream"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Live stream title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Scheduled Date *</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Video URL * (YouTube or Direct)</label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=... or direct video URL"
                  required
                />
                {formData.video_url && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {isYouTubeUrl(formData.video_url) ? (
                      <><Youtube className="h-4 w-4 text-red-500" /> YouTube Video</>
                    ) : (
                      <><Upload className="h-4 w-4 text-blue-500" /> Direct Video</>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Live stream description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <Input
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({...formData, ends_at: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingLive ? "Update" : "Create"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingLive(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Live Streams List */}
      <Card>
        <CardHeader>
          <CardTitle>Live Streams ({lives.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : lives.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No live streams created yet
            </div>
          ) : (
            <div className="space-y-4">
              {lives.map((live) => (
                <div key={live.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{live.title}</h3>
                        <Badge variant={live.is_active ? "destructive" : "secondary"}>
                          {live.is_active ? "🔴 LIVE" : "OFFLINE"}
                        </Badge>
                        {isYouTubeUrl(live.video_url) && (
                          <Badge variant="outline">
                            <Youtube className="h-3 w-3 mr-1" />
                            YouTube
                          </Badge>
                        )}
                      </div>
                      
                      {live.description && (
                        <p className="text-gray-400 text-sm mb-2">{live.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(live.scheduled_at).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {live.views} views
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={live.is_active ? "destructive" : "default"}
                        onClick={() => toggleLiveStatus(live.id, live.is_active)}
                      >
                        {live.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(live)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteLive(live.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-gray-800 p-2 rounded">
                    <strong>URL:</strong> {live.video_url}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLive;
