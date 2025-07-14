
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Heart, 
  Users, 
  Calendar, 
  Music, 
  Send,
  Star,
  Clock,
  Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/context/PlayerContext';

interface UserStats {
  totalListens: number;
  favoriteGenre: string;
  recentActivity: string;
  joinedDate: string;
}

const UserInteraction = () => {
  const { currentSong, recentlyPlayed } = usePlayer();
  const [feedback, setFeedback] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [userStats, setUserStats] = useState<UserStats>({
    totalListens: 247,
    favoriteGenre: 'Pop',
    recentActivity: '2 hours ago',
    joinedDate: 'Dec 2024'
  });

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }
    
    // Simulate feedback submission
    toast.success('Thank you for your feedback! We appreciate it.');
    setFeedback('');
    
    // In real app, this would send to backend
    console.log('Feedback submitted:', feedback);
  };

  const handleSongRequest = () => {
    if (!songRequest.trim()) {
      toast.error('Please enter a song request');
      return;
    }
    
    toast.success('Song request submitted! We\'ll review and add it soon.');
    setSongRequest('');
    
    // In real app, this would send to admin/owner
    console.log('Song request:', songRequest);
  };

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Music Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Headphones className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{userStats.totalListens}</p>
              <p className="text-sm text-gray-400">Total Listens</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Music className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-lg font-bold text-white">{userStats.favoriteGenre}</p>
              <p className="text-sm text-gray-400">Favorite Genre</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-sm font-bold text-white">{userStats.recentActivity}</p>
              <p className="text-sm text-gray-400">Last Active</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-sm font-bold text-white">{userStats.joinedDate}</p>
              <p className="text-sm text-gray-400">Member Since</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currently Playing Interaction */}
      {currentSong && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Music className="h-5 w-5" />
              Now Playing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <img 
                src={currentSong.imageUrl} 
                alt={currentSong.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{currentSong.title}</h3>
                <p className="text-gray-400">{currentSong.artist}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-red-500 text-red-400">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Tell us what you think about RoyalStar Music..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            rows={3}
          />
          <Button 
            onClick={handleFeedbackSubmit}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Song Request Section */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Music className="h-5 w-5" />
            Request a Song
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Song name - Artist name"
            value={songRequest}
            onChange={(e) => setSongRequest(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button 
            onClick={handleSongRequest}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            <Music className="h-4 w-4 mr-2" />
            Request Song
          </Button>
          <p className="text-xs text-gray-500">
            Our team reviews all requests and adds popular songs regularly
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentlyPlayed.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyPlayed.slice(0, 3).map((song, index) => (
                <div key={song.id} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <img 
                    src={song.imageUrl} 
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{song.title}</p>
                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserInteraction;
