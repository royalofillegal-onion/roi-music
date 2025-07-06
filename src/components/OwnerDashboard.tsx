
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Music, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Clock,
  Star,
  Plus,
  Settings,
  BarChart3,
  Heart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import GlobalLikeSystem from '@/components/GlobalLikeSystem';
import { songs } from '@/data/songs';

interface UserFeedback {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  rating: number;
}

interface SongRequest {
  id: string;
  user: string;
  songName: string;
  artist: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalSongs: number;
  totalPlays: number;
  totalLikes: number;
  engagementRate: string;
}

const OwnerDashboard = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 1247,
    activeUsers: 892,
    totalSongs: 156,
    totalPlays: 25891,
    totalLikes: 3456,
    engagementRate: '87.2%'
  });

  const [feedbacks] = useState<UserFeedback[]>([
    {
      id: '1',
      user: 'MusicLover123',
      message: 'Amazing platform! Love the new like system and community features.',
      timestamp: '2 hours ago',
      rating: 5
    },
    {
      id: '2',
      user: 'RockFan88',
      message: 'The song discovery is fantastic! Found so many new favorites.',
      timestamp: '5 hours ago',
      rating: 4
    },
    {
      id: '3',
      user: 'PopQueen',
      message: 'Love how I can see what others are enjoying without feeling pressured.',
      timestamp: '1 day ago',
      rating: 5
    }
  ]);

  const [songRequests, setSongRequests] = useState<SongRequest[]>([
    {
      id: '1',
      user: 'MelodyMaker',
      songName: 'Shape of You',
      artist: 'Ed Sheeran',
      timestamp: '1 hour ago',
      status: 'pending'
    },
    {
      id: '2',
      user: 'BeatLover',
      songName: 'Blinding Lights',
      artist: 'The Weeknd',
      timestamp: '3 hours ago',
      status: 'pending'
    },
    {
      id: '3',
      user: 'SoundWave',
      songName: 'Watermelon Sugar',
      artist: 'Harry Styles',
      timestamp: '6 hours ago',
      status: 'approved'
    }
  ]);

  const handleSongRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    setSongRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' }
          : request
      )
    );
    
    toast.success(`Song request ${action}d successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Owner Dashboard</h1>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Song
        </Button>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-xs text-green-400 mt-2">↗ +12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-xs text-green-400 mt-2">↗ +8% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Songs</p>
                <p className="text-2xl font-bold text-white">{stats.totalSongs}</p>
              </div>
              <Music className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xs text-blue-400 mt-2">+3 added this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Plays</p>
                <p className="text-2xl font-bold text-white">{stats.totalPlays.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-xs text-green-400 mt-2">↗ +156 today</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Likes</p>
                <p className="text-2xl font-bold text-white">{stats.totalLikes.toLocaleString()}</p>
              </div>
              <Heart className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-xs text-green-400 mt-2">↗ +89 today</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Engagement</p>
                <p className="text-2xl font-bold text-white">{stats.engagementRate}</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-400" />
            </div>
            <p className="text-xs text-green-400 mt-2">↗ +2.1% this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
            Advanced Analytics
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-green-600">
            Song Requests
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-green-600">
            User Feedback
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-green-600">
            Content Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Advanced Song Analytics & Engagement Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5 text-red-400" />
                        <span className="font-semibold text-white">Like Engagement</span>
                      </div>
                      <p className="text-2xl font-bold text-red-400">89.2%</p>
                      <p className="text-xs text-gray-400">Average engagement rate</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <span className="font-semibold text-white">Trending Factor</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">+347%</p>
                      <p className="text-xs text-gray-400">Compared to last week</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700/50 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                        <span className="font-semibold text-white">User Retention</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">94.7%</p>
                      <p className="text-xs text-gray-400">Users returning daily</p>
                    </CardContent>
                  </Card>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                  Track detailed engagement metrics, user behavior patterns, and song performance analytics. 
                  The privacy-focused like system shows engagement without revealing specific counts to users.
                </p>
                
                {songs.slice(0, 5).map((song) => (
                  <div key={song.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={song.imageUrl} 
                        alt={song.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{song.title}</h4>
                        <p className="text-gray-400">{song.artist}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Music
                          </Badge>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <GlobalLikeSystem 
                      song={song} 
                      variant="full" 
                      showLikers={true}
                      showOwnerInsights={true}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Music className="h-5 w-5" />
                Song Requests ({songRequests.filter(r => r.status === 'pending').length} pending)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {songRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">
                          {request.songName} - {request.artist}
                        </h4>
                        <Badge className={`${getStatusColor(request.status)} text-white text-xs`}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        Requested by {request.user} • {request.timestamp}
                      </p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleSongRequestAction(request.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={() => handleSongRequestAction(request.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Feedback & Community Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{feedback.user}</h4>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{feedback.message}</p>
                    <p className="text-xs text-gray-500">{feedback.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Smart Content Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Intelligent Content Management</h3>
                <p className="text-gray-400 mb-4">
                  Plan daily rotations, feature trending songs, and optimize engagement based on user behavior patterns
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Smart Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerDashboard;
